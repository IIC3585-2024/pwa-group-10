import "./style.css";

loadLandingPage();

function loadLandingPage() {
  const el = document.querySelector("#app");
  if (el === null) {
    return;
  }

  el.innerHTML = `
    <div>
      Splittypie
    </div>
  `;
}
