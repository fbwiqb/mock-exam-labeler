const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("labeler", {
  getSystemFonts: () => ipcRenderer.invoke("get-system-fonts"),
  openImage: () => ipcRenderer.invoke("open-image"),
  openProject: () => ipcRenderer.invoke("open-project"),
  saveProject: (payload) => ipcRenderer.invoke("save-project", payload),
  saveDataUrl: (payload) => ipcRenderer.invoke("save-data-url", payload),
  saveExportSet: (payload) => ipcRenderer.invoke("save-export-set", payload)
});
