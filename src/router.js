import landingPage from "./pages/landing";
import loginPage from "./pages/login";
import eventPage from "./pages/event";
import whoAreYouPage from "./pages/whoAreYou";
import transactionPage from "./pages/transaction";

const routes = {
  "/404": {
    html: `<div>404: content not found</div>`,
    setupPage: () => console.log("404 page"),
  },
  "/": landingPage,
  "/login": loginPage,
  "/event": eventPage,
  "/who-are-you": whoAreYouPage,
  "/transaction": transactionPage,
};

function navigateTo(href) {
  window.history.pushState({}, "", href);
  handleLocation();
}

async function handleLocation() {
  const path = window.location.pathname;
  const page = routes[path] || routes["/404"];
  document.getElementById("app").innerHTML = page.html;
  page.setupPage();
}

window.onpopstate = handleLocation;
window.route = navigateTo;

handleLocation();

export default navigateTo;
