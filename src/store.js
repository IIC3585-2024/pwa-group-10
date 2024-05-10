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
        if (prop === "_isProxy") return true;
        if (
          ["object", "array"].includes(Object.prototype.toString.call(obj[prop]).slice(8, -1).toLowerCase()) &&
          !obj[prop]._isProxy
        ) {
          obj[prop] = new Proxy(obj[prop], handler(name, data));
        }
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

const userStore = store({ uid: null, events: [] }, "user");
const eventsStore = store({}, "events");

export default {
  userStore,
  eventsStore,
};
