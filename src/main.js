import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import "./auth";

const content = document.getElementById("content");

onAuthStateChanged(auth, (user) => {
  if (user) {
    content.hidden = false;
  } else {
    content.hidden = true;
  }
});
