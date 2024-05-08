import { auth } from "./firebase.js";
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";

const signInButton = document.getElementById("sign-in");
signInButton?.addEventListener("click", tryToSignIn);

const signOutButton = document.getElementById("sign-out");
signOutButton?.addEventListener("click", tryToSignOut);

onAuthStateChanged(auth, (user) => {
  if (user) {
    signInButton.hidden = true;
    signOutButton.hidden = false;
  } else {
    signInButton.hidden = false;
    signOutButton.hidden = true;
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

function tryToSignIn() {
  console.log("Sign in clicked");
  signInWithRedirect(auth, new GoogleAuthProvider());
}

function tryToSignOut() {
  console.log("Sign out clicked");
  signOut(auth);
}
