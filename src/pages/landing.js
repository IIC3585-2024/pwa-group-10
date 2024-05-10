import { ref, get, child } from "firebase/database";
import { signOut } from "firebase/auth";
import _ from "lodash";

import { auth, db } from "../firebase";
import { userStore, eventsStore } from "../store";
import navigateTo from "../router";

const html = `
  <div>
    <button id="open-login-page">Iniciar Sesión</button>
    <button id="sign-out" hidden>Cerrar Sesión</button>
  </div>
  <div>
    <h1>Splittypie</h1>
  </div>
  <div id="content" hidden>
    <select name="event" id="event-selector">
      <option value="default">Seleccione un evento</option>
    </select>
    <button id="create-event">Nuevo Evento</button>
    <div>Información de evento</div>
  </div>
`;

function setupPage() {
  console.log("userStore on setup", userStore);
  console.log("eventsStore on setup", eventsStore);

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
  eventSelector.innerHTML = "<option value='default'>Seleccione un evento</option>";

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

  if (!eventId) return;

  const eventSelector = document.getElementById("event-selector");
  for (const option of eventSelector.options) {
    if (option.value === eventId) {
      option.selected = true;
      return;
    }
  }

  // navigateTo("/who-are-you");
}

export default {
  html,
  setupPage,
};
