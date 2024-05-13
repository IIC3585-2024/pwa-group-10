import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyABfLu3f-Lmngcvka3i8-XTjdZOEuFDzQY",
  authDomain: "splittypie-iic3585.firebaseapp.com",
  projectId: "splittypie-iic3585",
  messagingSenderId: "492776923604",
  appId: "1:492776923604:web:120d57fe386f0e4ad13641",
  databaseURL: "https://splittypie-iic3585-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const msg = getMessaging(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    return;
  }

  const notificationPermission = await Notification.requestPermission();
  if (notificationPermission !== "granted") {
    return;
  }

  const token = await getToken(msg, {
    vapidKey: "BIS4aP0pSnHIOOMpXgRCthQjKRryRPOPUURDOLD__Nlx2vKe-FVpNZQt-BAKy61Z4PEYrhpzKtwH2Zc8SWPe14I",
  });

  if (!token) {
    console.error("No registration token available. Request permission to generate one.");
    return;
  }

  const userTokensRef = ref(db, `users/${user.uid}/tokens/${token}`);
  await set(userTokensRef, {
    token: token,
    timestamp: Date.now(),
  });

  console.log("token registered", token);

  onMessage(msg, (payload) => {
    console.log("Message received. ", payload);
  });
});

export { auth, db, msg };
