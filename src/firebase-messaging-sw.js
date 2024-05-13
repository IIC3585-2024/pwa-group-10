importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyABfLu3f-Lmngcvka3i8-XTjdZOEuFDzQY",
  authDomain: "splittypie-iic3585.firebaseapp.com",
  projectId: "splittypie-iic3585",
  messagingSenderId: "492776923604",
  appId: "1:492776923604:web:120d57fe386f0e4ad13641",
  databaseURL: "https://splittypie-iic3585-default-rtdb.firebaseio.com",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// onBackgroundMessage(messaging, (payload) => {
//   console.log("[firebase-messaging-sw.js] Received background message ", payload);
//   const notificationTitle = "Background Message Title";
//   const notificationOptions = {
//     body: "Background Message body.",
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
