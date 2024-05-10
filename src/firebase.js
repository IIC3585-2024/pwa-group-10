import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyABfLu3f-Lmngcvka3i8-XTjdZOEuFDzQY",
  authDomain: "splittypie-iic3585.firebaseapp.com",
  projectId: "splittypie-iic3585",
  messagingSenderId: "492776923604",
  appId: "1:492776923604:web:120d57fe386f0e4ad13641",
  databaseURL: "https://splittypie-iic3585-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
