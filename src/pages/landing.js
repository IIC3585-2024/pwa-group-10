import { auth, db } from "../firebase";
import { ref, get, child } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";

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
    document.location.href = "/login";
  });
  const signOutButton = document.getElementById("sign-out");

  signOutButton?.addEventListener("click", () => {
    console.log("sign out clicked");
    signOut(auth);
  });

  const newEventButton = document.getElementById("create-event");
  newEventButton?.addEventListener("click", () => {
    document.location.href = "/event";
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      events = await getEvents();
      changeSelectOptions(events);
      openLoginPageButton.hidden = true;
      signOutButton.hidden = false;
      content.hidden = false;
    } else {
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

export default {
  html,
  setupPage,
};
