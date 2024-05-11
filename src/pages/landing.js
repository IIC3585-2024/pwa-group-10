import { ref, get, child } from "firebase/database";
import { signOut } from "firebase/auth";
import _ from "lodash";

import { auth, db } from "../firebase";
import { userStore, eventsStore } from "../store";
import navigateTo from "../router";

const html = `
<div>
  <button id="open-login-page">Log In</button>
  <button id="sign-out" hidden>Log Out</button>
</div>
<div>
  <h1>Splittypie</h1>
</div>
<div id="content" hidden>
  <select name="event" id="event-selector">
    <option value="default">Choose an event</option>
  </select>
  <button id="create-event">Create Event</button>
  <br />

  <h3 id="event-name"></h3>
  <div id="create-transaction"></div>
  <div id="event-balance"></div>
  <div id="settle-debts"></div>
</div>
`;

function setupPage() {
  checkIfUserIsLoggedIn();
  document.addEventListener("user", async () => {
    await checkIfUserIsLoggedIn();
  });

  changeSelectOptions();
  document.addEventListener("events", () => {
    changeSelectOptions();
  });

  const openLoginPageButton = document.getElementById("open-login-page");
  openLoginPageButton?.addEventListener("click", () => {
    navigateTo("/login");
  });

  const signOutButton = document.getElementById("sign-out");
  signOutButton?.addEventListener("click", () => {
    signOut(auth);
  });

  const newEventButton = document.getElementById("create-event");
  newEventButton?.addEventListener("click", () => {
    navigateTo("/event");
  });

  const eventSelector = document.getElementById("event-selector");
  eventSelector.addEventListener("change", (event) => {
    const value = event.target.value;
    if (value === "default") {
      navigateTo("/");
      return;
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.set("event", value);
    navigateTo(`/?${urlParams.toString()}`);
  });
}

async function checkIfUserIsLoggedIn() {
  showOrHideContent();

  if (userStore.uid) {
    await getEvents();
    redirectIfEventNotFromUser();
  }
}

function showOrHideContent() {
  const content = document.getElementById("content");
  const openLoginPageButton = document.getElementById("open-login-page");
  const signOutButton = document.getElementById("sign-out");

  if (userStore.uid) {
    openLoginPageButton.hidden = true;
    signOutButton.hidden = false;
    content.hidden = false;
  } else {
    openLoginPageButton.hidden = false;
    signOutButton.hidden = true;
    content.hidden = true;
  }
}

async function getEvents() {
  const userId = userStore.uid;
  const dbRef = ref(db);
  const userEventsSnap = await get(child(dbRef, `users/${userId}/events`));
  const userEvents = userEventsSnap.val() || {};

  const promises = [];
  Object.keys(userEvents).forEach((eventKey) => {
    promises.push(get(child(dbRef, `events/${eventKey}`)));
  });

  const eventsPromises = await Promise.all(promises);

  const newEvents = {};

  eventsPromises.forEach((eventSnap) => {
    const event = eventSnap.val();
    newEvents[eventSnap.key] = event;
  });

  const thereIsNewEvent = Object.entries(newEvents).some(([eventKey, newEvent]) => {
    const savedEvent = eventsStore.events[eventKey];
    if (!savedEvent) return true;
    if (!_.isEqual(newEvent, savedEvent)) return true;
  });

  if (thereIsNewEvent) {
    eventsStore.events = newEvents;
  }
}

function changeSelectOptions() {
  const eventSelector = document.getElementById("event-selector");
  eventSelector.innerHTML = "<option value='default'>Select an event</option>";

  Object.keys(eventsStore.events).forEach((eventId) => {
    const event = eventsStore.events[eventId];
    if (!event) return;

    const option = document.createElement("option");
    option.value = eventId;
    option.innerText = event.name;
    eventSelector.appendChild(option);
  });

  checkUrlParams();
}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("event");

  if (!eventId) {
    displayChosenEventInfo();
    return;
  }

  const eventSelector = document.getElementById("event-selector");
  for (const option of eventSelector.options) {
    if (option.value === eventId) {
      option.selected = true;
      displayChosenEventInfo();
      return;
    }
  }
}

function redirectIfEventNotFromUser() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("event");

  if (!eventId) return;
  console.log("eventsStore", eventsStore.events);
  if (!eventsStore.events[eventId] && userStore.uid) {
    navigateTo(`/who-are-you?${urlParams.toString()}`);
  }
}

function displayChosenEventInfo() {
  const eventSelector = document.getElementById("event-selector");
  const eventId = eventSelector.value;

  const eventName = document.getElementById("event-name");
  console.log("eventId", eventId);
  if (eventId === "default") {
    eventName.innerHTML = "Choose an event";
    return;
  }

  const event = eventsStore.events[eventId];
  if (!event) return;

  eventName.innerText = event.name;

  const createTransaction = document.getElementById("create-transaction");
  const createTransactionButton = document.createElement("button");
  createTransactionButton.innerHTML = "Create Transaction";
  createTransactionButton.addEventListener("click", () => {
    navigateTo(`/transaction?event=${eventId}`);
  });
  createTransaction.appendChild(createTransactionButton);

  const eventBalance = document.getElementById("event-balance");

  const balanceTitle = document.createElement("h4");
  balanceTitle.innerHTML = "Individual Balance";
  eventBalance.appendChild(balanceTitle);

  event.participants.forEach((participant) => {
    const participantBalance = document.createElement("p");
    participantBalance.innerHTML = `${participant.name}: $${participant.balance}`;
    eventBalance.appendChild(participantBalance);
  });

  // const settleDebts = document.getElementById("settle-debts");
  // settleDebts.innerHTML = `
  //   <h3>Debts:</h3>
  //   <ul>
  //     ${event.debts.map((debt) => `<li>${debt.from} le debe a ${debt.to} $${debt.amount}</li>`).join("")}
  //   </ul>
  // `;
}

export default {
  html,
  setupPage,
};
