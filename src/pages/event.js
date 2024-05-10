import { ref, push, set } from "firebase/database";
import { auth, db } from "../firebase";
import navigateTo from "../router";

const html = `
<h1>Create Event</h1>

<form id="event-form">
  <label for="event-name">Event Name</label>
  <div>
    <input type="text" id="event-name" name="event-name" required />
  </div>
  <br />
  <br />

  <label for="participant-1">Participants</label>
  <div id="participants-container">
    <div>
      <input type="text" placeholder="Your name" required />
    </div>
  </div>
  <br />
  <br />

  <button type="button" id="add-participant-button">Add Participant</button>
  <button type="button" id="remove-participant-button">Delete Participant</button>
  <br />
  <br />

  <div>
    <button type="submit">Create</button>
    <button type="button" id="cancel-button">Cancel</button>
  </div>
</form>

`;

let participantCount = 1;

function setupPage() {
  participantCount = 1;

  const addParticipantButton = document.getElementById("add-participant-button");
  addParticipantButton?.addEventListener("click", addParticipant);

  const removeParticipantButton = document.getElementById("remove-participant-button");
  removeParticipantButton?.addEventListener("click", removeParticipant);

  const eventForm = document.getElementById("event-form");
  eventForm?.addEventListener("submit", createEvent);

  const cancelButton = document.getElementById("cancel-button");
  cancelButton?.addEventListener("click", () => {
    navigateTo("/");
  });
}

function addParticipant() {
  participantCount++;

  const participantsContainer = document.getElementById("participants-container");

  const container = document.createElement("div");
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Your friend's name";
  input.required = true;

  container.appendChild(input);
  participantsContainer.appendChild(container);
}

function removeParticipant() {
  if (participantCount <= 1) {
    alert("Event must have at least one participant");
    return;
  }
  participantCount--;
  const participantsContainer = document.getElementById("participants-container");
  const lastChild = participantsContainer.lastChild;
  participantsContainer.removeChild(lastChild);
}

async function createEvent(e) {
  e.preventDefault();

  const newEvent = {
    name: document.getElementById("event-name").value,
    participants: [],
  };

  const participantsContainer = document.getElementById("participants-container");

  for (const participantDiv of participantsContainer.children) {
    const participantName = participantDiv.children[0].value;
    newEvent.participants.push({ name: participantName, uid: "" });
  }

  const userId = auth.currentUser.uid;

  newEvent.participants[0].uid = userId;

  const eventsRef = ref(db, "events");
  const savedEvent = await push(eventsRef, newEvent);

  const userNewEventRef = ref(db, `users/${userId}/events/${savedEvent.key}`);
  await set(userNewEventRef, true);

  navigateTo("/");
}

export default {
  html,
  setupPage,
};
