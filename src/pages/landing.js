import { auth } from "../firebase";
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
  const signOutButton = document.getElementById("sign-out");

  openLoginPageButton?.addEventListener("click", () => {
    document.location.href = "/login";
  });

  signOutButton?.addEventListener("click", () => {
    console.log("sign out clicked");
    signOut(auth);
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
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

export default {
  html,
  setupPage,
};
