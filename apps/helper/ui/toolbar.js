const form = document.querySelector("#nav");
const urlInput = document.querySelector("#url");
const selectButton = document.querySelector("#select");
const sendButton = document.querySelector("#send");
const status = document.querySelector("#status");

function render(state) {
  if (!state) return;
  if (state.url && document.activeElement !== urlInput) urlInput.value = state.url;
  status.textContent = state.message || (state.connected ? "Connected to AE" : "Not connected to AE");
  sendButton.disabled = !state.hasSelection || !state.connected;
  selectButton.disabled = Boolean(state.busy);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const state = await window.motionBrowser.navigate(urlInput.value);
  render(state);
});

selectButton.addEventListener("click", async () => {
  render(await window.motionBrowser.selectElement());
});

sendButton.addEventListener("click", async () => {
  render(await window.motionBrowser.sendSelection());
});

window.motionBrowser.getState().then(render);
window.motionBrowser.onState(render);
