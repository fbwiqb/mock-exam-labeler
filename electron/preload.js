const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("labeler", {
  getSystemFonts: () => ipcRenderer.invoke("get-system-fonts"),
  openImage: () => ipcRenderer.invoke("open-image"),
  openProject: () => ipcRenderer.invoke("open-project"),
  saveProject: (payload) => ipcRenderer.invoke("save-project", payload),
  saveDataUrl: (payload) => ipcRenderer.invoke("save-data-url", payload),
  setDirtyState: (dirty) => ipcRenderer.send("set-dirty-state", dirty),
  onOpenProjectData: (callback) => ipcRenderer.on("open-project-data", (_event, payload) => callback(payload))
});
