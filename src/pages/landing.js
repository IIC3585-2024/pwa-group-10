import { ref, get, child } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth, db } from "../firebase";
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
  const content = document.getElementById("content");
  const openLoginPageButton = document.getElementById("open-login-page");
  let events = {};

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

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      openLoginPageButton.hidden = true;
      signOutButton.hidden = false;
      content.hidden = false;
      events = await getEvents();
      changeSelectOptions(events);
      checkUrlParams();
    } else {
      console.log("not found user");
      openLoginPageButton.hidden = false;
      signOutButton.hidden = true;
      content.hidden = true;
    }
  });
}

async function getEvents() {
  const userId = auth.currentUser.uid;

  const dbRef = ref(db);

  const userEventsSnap = await get(child(dbRef, `users/${userId}/events`));
  const userEvents = userEventsSnap.val() || {};

  const promises = [];
  Object.keys(userEvents).forEach((eventKey) => {
    promises.push(get(child(dbRef, `events/${eventKey}`)));
  });

  const events = {};
  const eventsPromises = await Promise.all(promises);
  eventsPromises.forEach((eventSnap) => {
    const event = eventSnap.val();
    events[eventSnap.key] = event;
  });

  return events;
}

function changeSelectOptions(events) {
  const eventSelector = document.getElementById("event-selector");
  eventSelector.innerHTML = "<option value='default'>Seleccione un evento</option>";

  Object.keys(events).forEach((eventId) => {
    const event = events[eventId];
    const option = document.createElement("option");
    option.value = eventId;
    option.innerText = event.name;
    eventSelector.appendChild(option);
  });
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
