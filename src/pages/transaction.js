import { ref, get, push } from "firebase/database";

import { db } from "../firebase";
import { userStore } from "../store";
import navigateTo from "../router";

const html = `
<h1>Create Transaction</h1>

<form id="transaction-form">
  <label for="transaction-name">Transaction Name</label>
  <div>
    <input type="text" id="transaction-name" name="transaction-name" required />
  </div>
  <br />
  <br />

  <label for="transaction-cost">Amount</label>
  <div>
    <input type="number" id="transaction-cost" name="transaction-cost" required />
  </div>
  <br />
  <br />

  <label for="who-paid">Who paid?</label>
  <div>
    <select name="who-paid" id="who-paid"></select>
  </div>
  <br />
  <br />

  <label for="divide-among">Divide the cost among:</label>
  <div id="divide-among-container"></div>
  <br />
  <br />

  <div>
    <button type="submit">Create</button>
    <button type="button" id="cancel-button">Cancel</button>
  </div>
</form>
`;

async function setupPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("event");

  if (!eventId || !userStore.uid) {
    navigateTo("/");
    return;
  }

  const participantsSnap = await get(ref(db, `events/${eventId}/participants`));
  const participants = participantsSnap.val() || [];
 // const participants = [];

  const whoPaidSelector = document.getElementById("who-paid");
  whoPaidSelector.innerHTML = "<option value='default'>Select who paid</option>";
  const divideAmong = document.getElementById("divide-among-container");

  participants.forEach((participant) => {
    const option = document.createElement("option");
    option.value = participant.name;
    option.innerText = participant.name;
    whoPaidSelector.appendChild(option);

    const container = document.createElement("div");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "divide-among-checkbox";
    checkbox.name = participant.name;
    checkbox.checked = true;
    const label = document.createElement("label");
    label.for = participant.name;
    label.innerHTML = participant.name;
    container.appendChild(checkbox);
    container.appendChild(label);
    divideAmong.appendChild(container);
  });

  const transactionForm = document.getElementById("transaction-form");
  transactionForm?.addEventListener("submit", createTransaction);

  const cancelButton = document.getElementById("cancel-button");
  cancelButton?.addEventListener("click", () => {
    navigateTo("/");
  });

  async function createTransaction(e) {
    e.preventDefault();

    const transactionName = document.getElementById("transaction-name").value;
    const amount = parseInt(document.getElementById("transaction-cost").value);
    const whoPaid = document.getElementById("who-paid").value;

    if (!participants.map((participant) => participant.name).includes(whoPaid)) {
      alert("Select who paid");
      return;
    }

    const checkboxes = document.getElementsByClassName("divide-among-checkbox");
    const divideAmong = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.name);

    const transaction = {
      name: transactionName,
      amount,
      whoPaid,
      divideAmong,
    };

    const eventTransactionsRef = ref(db, `events/${eventId}/transactions`);
    await push(eventTransactionsRef, transaction);
    navigateTo(`/?event=${eventId}`);
  }
}

export default {
  html,
  setupPage,
};
