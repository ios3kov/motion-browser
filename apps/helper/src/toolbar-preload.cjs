const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("motionBrowser", {
  navigate: (url) => ipcRenderer.invoke("mb:navigate", url),
  selectElement: () => ipcRenderer.invoke("mb:select-element"),
  sendSelection: () => ipcRenderer.invoke("mb:send-selection"),
  getState: () => ipcRenderer.invoke("mb:get-state"),
  onState: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on("mb:state", handler);
    return () => ipcRenderer.removeListener("mb:state", handler);
  }
});
