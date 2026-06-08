const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs/promises");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1040,
    minHeight: 680,
    backgroundColor: "#f5f5f2",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../src/index.html"));
}

function extensionToMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

function dataUrlToBuffer(dataUrl) {
  const comma = dataUrl.indexOf(",");
  return Buffer.from(dataUrl.slice(comma + 1), "base64");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("open-image", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "이미지 열기",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const buffer = await fs.readFile(filePath);
  const mime = extensionToMime(filePath);

  return {
    filePath,
    fileName: path.basename(filePath, path.extname(filePath)),
    dataUrl: `data:${mime};base64,${buffer.toString("base64")}`
  };
});

ipcMain.handle("open-project", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "프로젝트 열기",
    properties: ["openFile"],
    filters: [
      { name: "Mock Exam Labeler Project", extensions: ["melp", "json"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const text = await fs.readFile(filePath, "utf8");
  return { filePath, project: JSON.parse(text) };
});

ipcMain.handle("save-project", async (_event, payload) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "프로젝트 저장",
    defaultPath: `${payload.fileName || "mock-exam-labels"}.melp`,
    filters: [
      { name: "Mock Exam Labeler Project", extensions: ["melp"] }
    ]
  });

  if (result.canceled || !result.filePath) return null;
  await fs.writeFile(result.filePath, JSON.stringify(payload.project, null, 2), "utf8");
  return result.filePath;
});

ipcMain.handle("save-data-url", async (_event, payload) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: payload.title || "PNG 저장",
    defaultPath: payload.defaultName || "export.png",
    filters: [
      { name: "PNG", extensions: ["png"] }
    ]
  });

  if (result.canceled || !result.filePath) return null;
  await fs.writeFile(result.filePath, dataUrlToBuffer(payload.dataUrl));
  return result.filePath;
});

ipcMain.handle("save-export-set", async (_event, payload) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "내보낼 폴더 선택",
    properties: ["openDirectory", "createDirectory"]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  const directory = result.filePaths[0];
  const saved = [];

  for (const file of payload.files) {
    const filePath = path.join(directory, file.name);
    await fs.writeFile(filePath, dataUrlToBuffer(file.dataUrl));
    saved.push(filePath);
  }

  return saved;
});
