const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("labeler", {
  getSystemFonts: () => ipcRenderer.invoke("get-system-fonts"),
  getPathForFile: (file) => webUtils?.getPathForFile(file) || file?.path || "",
  openImage: () => ipcRenderer.invoke("open-image"),
  openFilePath: (filePath) => ipcRenderer.invoke("open-file-path", filePath),
  openProject: () => ipcRenderer.invoke("open-project"),
  saveProject: (payload) => ipcRenderer.invoke("save-project", payload),
  saveDataUrl: (payload) => ipcRenderer.invoke("save-data-url", payload),
  setDirtyState: (dirty) => ipcRenderer.send("set-dirty-state", dirty),
  onOpenProjectData: (callback) => ipcRenderer.on("open-project-data", (_event, payload) => callback(payload)),
  onUpdateProgress: (callback) => ipcRenderer.on("update-progress", (_event, payload) => callback(payload))
});
