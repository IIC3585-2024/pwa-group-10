import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { saveEvent, getEvents } from './indexedDB';


function store(data = {}, name = "store") {
  function emit(type, detail) {
    // Create a new event
    let event = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      detail: detail,
    });

    // Dispatch the event
    return document.dispatchEvent(event);
  }

  function handler(name, data) {
    return {
      get: function (obj, prop) {
        return obj[prop];
      },
      set: function (obj, prop, value) {
        if (obj[prop] === value) return true;
        obj[prop] = value;
        emit(name, data);
        return true;
      },
      deleteProperty: function (obj, prop) {
        delete obj[prop];
        emit(name, data);
        return true;
      },
    };
  }

  return new Proxy(data, handler(name, data));
}

const userStore = store({ uid: null }, "user");
const eventsStore = store({ events: {} }, "events");

onAuthStateChanged(auth, async (user) => {
  console.log("onAuthStateChanged", user);
  userStore.uid = user ? user.uid : null;
  if (userStore.uid) {
    eventsStore.events = await getEvents();
  } else {
    eventsStore.events = {};
  }
});

async function addOrUpdateEvent(event) {
  try {
    await saveEvent(event); 
    eventsStore.events[event.id] = event; 
    emit('eventsUpdated', eventsStore.events); 
  } catch (error) {
    console.error('Error saving event:', error);
  }
}

async function refreshEvents() {
  eventsStore.events = await getEvents(); 
  emit('eventsRefreshed', eventsStore.events); 
}

export { userStore, eventsStore, addOrUpdateEvent, refreshEvents };
