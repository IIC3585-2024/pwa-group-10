const admin = require("firebase-admin");
const { onValueCreated } = require("firebase-functions/v2/database");

admin.initializeApp();

const db = admin.database();

exports.notificationWhenTransactionCreated = onValueCreated(
  "events/{eventId}/transactions/{transactionId}",
  async (event) => {
    const transaction = event.data.val();

    const eventId = event.params.eventId;

    const eventSnap = await db.ref(`events/${eventId}`).once("value");
    const eventData = eventSnap.val();

    const eventName = eventData.name;
    const participants = eventData.participants;

    const usersToNotify = participants.filter((p) => p.uid && p.name !== transaction.whoPaid).map((p) => p.uid);

    const userPromises = [];
    usersToNotify.forEach((uid) => {
      userPromises.push(db.ref(`users/${uid}`).once("value"));
    });

    const users = await Promise.all(userPromises);

    const registrationTokens = [];
    users.forEach((userSnap) => {
      const user = userSnap.val();
      Object.keys(user.tokens).forEach((token) => {
        registrationTokens.push(token);
      });
    });

    const payload = {
      data: {
        title: `New Transaction in Event ${eventName}`,
        body: `New transaction ${transaction.name} of $${transaction.amount}`,
      },
      webpush: {
        fcmOptions: {
          link: `https://slittypie-iic3585.web.app/?event=${eventId}`,
        },
      },
    };

    console.log("payload", payload);
    console.log("registrationTokens", registrationTokens);

    const promises = [];
    registrationTokens.forEach((token) => {
      const sendMessage = admin.messaging().send({ ...payload, token });
      promises.push(sendMessage);
    });

    const responses = await Promise.all(promises);
    console.log("responses", responses);
  }
);
