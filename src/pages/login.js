import { auth } from "../firebase.js";
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import navigateTo from "../router.js";

const html = `
  <div>
    <h1>Splittypie</h1>
  </div>
  <div>
    <button id="sign-in">Iniciar Sesión con Google</button>
  </div>
  <div>
    <div>Crear Nueva Cuenta</div>
    <div>Iniciar Sesión</div>
  </div>
`;

function setupPage() {
  const signInButton = document.getElementById("sign-in");
  signInButton?.addEventListener("click", tryToSignIn);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("there is user, redirecting");
      navigateTo("/");
    }
  });

  getRedirectResult(auth)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      const user = result.user;
      console.log("user", user);
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error?.code;
      const errorMessage = error?.message;
      // The email of the user's account used.
      const email = error?.customData?.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
    });

  async function tryToSignIn() {
    console.log("Sign in clicked");
    await signInWithRedirect(auth, new GoogleAuthProvider());
    navigateTo("/");
  }
}

export default {
  html,
  setupPage,
};
