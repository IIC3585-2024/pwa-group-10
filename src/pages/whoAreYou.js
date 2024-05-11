import { db } from "../firebase";
import { ref, get, set } from "firebase/database";
import navigateTo from "../router";

import { userStore } from "../store";

const html = `
<div>
  <h1 id="title"></h1>
  <p id="description"></p>
  <div id="options"></div>
</div>
`;

async function setupPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("event");

  if (!eventId || !userStore.uid) {
    navigateTo("/404");
    return;
  }

  const eventRef = ref(db, `events/${eventId}/participants`);
  const participantsSnap = await get(eventRef);
  const participants = participantsSnap.val() || [];

  const missingParticipants = participants.filter((participant) => !participant.uid);

  const title = document.getElementById("title");
  const description = document.getElementById("description");

  if (!missingParticipants.length) {
    title.innerHTML = "This event is already full";
    description.innerHTML = "You can't see this event because all of its participants already opened it";
    return;
  }

  title.textContent = "Who are you?";
  description.textContent = "Choose one of the following options:";

  const options = document.getElementById("options");
  missingParticipants.forEach((participant) => {
    const button = document.createElement("button");
    button.innerHTML = participant.name;
    button.addEventListener("click", chooseParticipant);
    options.appendChild(button);
  });

  async function chooseParticipant(event) {
    const participantName = event.target.innerHTML;
    const index = participants.findIndex((participant) => participant.name === participantName);

    participants[index].uid = userStore.uid;

    await set(eventRef, participants);

    const userRef = ref(db, `users/${userStore.uid}/events/${eventId}`);
    await set(userRef, true);

    navigateTo("/");
  }
}

export default {
  html,
  setupPage,
};
