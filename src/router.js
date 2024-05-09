import landingPage from "./pages/landing";
import loginPage from "./pages/login";

const routes = {
  404: {
    html: `<div>404: content not found</div>`,
    setupPage: () => console.log("404 page"),
  },
  "/": landingPage,
  "/login": loginPage,
};

function navigateTo(event) {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  handleLocation();
}

async function handleLocation() {
  const path = window.location.pathname;
  const page = routes[path] || routes[404];
  document.getElementById("app").innerHTML = page.html;
  page.setupPage();
}

window.onpopstate = handleLocation;
window.route = navigateTo;

handleLocation();
