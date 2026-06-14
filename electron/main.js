const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron");
const { execFile } = require("child_process");
const { autoUpdater } = require("electron-updater");
const fs = require("fs/promises");
const path = require("path");

let mainWindow;
let pendingProjectPath = null;
let allowClose = false;
let hasUnsavedChanges = false;

function releaseNotesToText(notes) {
  if (!notes) return "";
  if (typeof notes === "string") return notes.replace(/<[^>]+>/g, "").trim();
  if (Array.isArray(notes)) {
    return notes.map((item) => (typeof item === "string" ? item : item && item.note ? item.note : "")).join("\n").trim();
  }
  return String(notes);
}

function setupAutoUpdate() {
  if (!app.isPackaged) return;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", async (info) => {
    const notes = releaseNotesToText(info.releaseNotes);
    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "업데이트 있음",
      message: `새 버전 ${info.version}이(가) 나왔습니다. 지금 받을까요?`,
      detail: notes ? `이번 변경 내용\n\n${notes}` : "",
      buttons: ["지금 업데이트", "나중에"],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });
    if (result.response === 0) autoUpdater.downloadUpdate().catch((error) => console.error(error));
  });

  autoUpdater.on("update-downloaded", async (info) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "업데이트 준비 완료",
      message: `버전 ${info.version} 설치 준비가 끝났습니다.`,
      detail: "지금 재시작하여 설치할까요? 저장하지 않은 작업이 있으면 먼저 저장하세요.",
      buttons: ["지금 재시작하여 설치", "나중에"],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });
    if (result.response === 0) {
      allowClose = true;
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  });

  autoUpdater.on("error", (error) => {
    console.error("auto-update error", error);
  });

  autoUpdater.checkForUpdates().catch((error) => console.error(error));
}

function projectPathFromArgv(argv) {
  return argv.find((item) => String(item || "").toLowerCase().endsWith(".melp")) || null;
}

async function sendProjectToWindow(filePath) {
  if (!filePath || !mainWindow) return;
  try {
    const text = await fs.readFile(filePath, "utf8");
    mainWindow.webContents.send("open-project-data", {
      filePath,
      project: JSON.parse(text)
    });
  } catch (_error) {
    dialog.showErrorBox("프로젝트 열기 실패", "프로젝트 파일을 열 수 없습니다.");
  }
}

function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1040,
    minHeight: 680,
    title: "모의고사 라벨러",
    icon: path.join(__dirname, "../assets/icon.png"),
    autoHideMenuBar: true,
    backgroundColor: "#f5f5f2",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../src/index.html"));
  mainWindow.webContents.once("did-finish-load", () => {
    if (pendingProjectPath) {
      sendProjectToWindow(pendingProjectPath);
      pendingProjectPath = null;
    }
  });
  mainWindow.on("close", async (event) => {
    if (allowClose || !hasUnsavedChanges) return;
    event.preventDefault();
    const result = await dialog.showMessageBox(mainWindow, {
      type: "warning",
      title: "저장하지 않은 변경사항",
      message: "프로젝트를 저장하지 않고 닫을까요?",
      detail: "저장하지 않으면 라벨 위치와 지시선 편집 내용이 사라질 수 있습니다.",
      buttons: ["닫기", "취소"],
      defaultId: 1,
      cancelId: 1,
      noLink: true
    });
    if (result.response === 0) {
      allowClose = true;
      mainWindow.close();
    }
  });
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

function runPowerShell(command) {
  return new Promise((resolve) => {
    execFile("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command], { windowsHide: true }, (error, stdout) => {
      if (error) {
        resolve("");
        return;
      }
      resolve(stdout);
    });
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const projectPath = projectPathFromArgv(argv);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      if (projectPath) sendProjectToWindow(projectPath);
    }
  });

  pendingProjectPath = projectPathFromArgv(process.argv);
  app.whenReady().then(() => {
    createWindow();
    setupAutoUpdate();
  });
}

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

ipcMain.handle("open-file-path", async (_event, filePath) => {
  if (!filePath) return null;
  const ext = path.extname(filePath).toLowerCase();
  const textExtensions = new Set([".melp", ".json"]);

  if (textExtensions.has(ext)) {
    const text = await fs.readFile(filePath, "utf8");
    return {
      filePath,
      fileName: path.basename(filePath, ext),
      text
    };
  }

  const buffer = await fs.readFile(filePath);
  return {
    filePath,
    fileName: path.basename(filePath, ext),
    dataUrl: `data:${extensionToMime(filePath)};base64,${buffer.toString("base64")}`
  };
});

ipcMain.handle("get-system-fonts", async () => {
  const command = `
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
    $OutputEncoding = [Console]::OutputEncoding
    $paths = @(
      'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts',
      'HKCU:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts'
    )
    $names = foreach ($path in $paths) {
      if (Test-Path $path) {
        (Get-ItemProperty $path).PSObject.Properties |
          Where-Object { $_.Name -notmatch '^PS' } |
          ForEach-Object {
            $_.Name -replace '\\s*\\((TrueType|OpenType|PostScript|Type 1)\\)\\s*$', '' -replace '\\s*&\\s*.+$', ''
          }
      }
    }
    $names | Where-Object { $_ -and $_.Trim() } | Sort-Object -Unique | ConvertTo-Json -Compress
  `;
  const stdout = await runPowerShell(command);

  try {
    const parsed = JSON.parse(stdout.trim() || "[]");
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (_error) {
    return [];
  }
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
  const buttons = ["그림과 같은 폴더", "위치 지정", "취소"];
  const choice = await dialog.showMessageBox(mainWindow, {
    type: "question",
    title: "프로젝트 저장",
    message: "프로젝트를 어디에 저장할까요?",
    buttons,
    defaultId: 0,
    cancelId: 2,
    noLink: true
  });

  if (choice.response === 2) return null;
  let filePath = "";
  const sourcePath = payload.imagePath || payload.projectPath || "";

  if (choice.response === 0 && sourcePath) {
    filePath = path.join(path.dirname(sourcePath), `${payload.fileName || "mock-exam-labels"}.melp`);
  } else {
    if (choice.response === 0 && !sourcePath) {
      await dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "원본 경로 없음",
        message: "원본 그림 경로를 알 수 없어 저장 위치를 직접 지정해주세요.",
        buttons: ["확인"],
        noLink: true
      });
    }
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "프로젝트 저장",
      defaultPath: sourcePath ? path.join(path.dirname(sourcePath), `${payload.fileName || "mock-exam-labels"}.melp`) : `${payload.fileName || "mock-exam-labels"}.melp`,
      filters: [
        { name: "Mock Exam Labeler Project", extensions: ["melp"] }
      ]
    });
    if (result.canceled || !result.filePath) return null;
    filePath = result.filePath;
  }

  await fs.writeFile(filePath, JSON.stringify(payload.project, null, 2), "utf8");
  return filePath;
});

ipcMain.on("set-dirty-state", (_event, dirty) => {
  hasUnsavedChanges = Boolean(dirty);
  if (mainWindow) mainWindow.setDocumentEdited(hasUnsavedChanges);
});

ipcMain.handle("save-data-url", async (_event, payload) => {
  const defaultName = payload.defaultName || "export.png";
  const sourcePath = payload.imagePath || payload.projectPath || "";
  const choice = await dialog.showMessageBox(mainWindow, {
    type: "question",
    title: payload.title || "PNG 저장",
    message: "이미지를 어디에 저장할까요?",
    buttons: ["그림과 같은 폴더", "위치 지정", "취소"],
    defaultId: 0,
    cancelId: 2,
    noLink: true
  });

  if (choice.response === 2) return null;
  let filePath = "";

  if (choice.response === 0 && sourcePath) {
    filePath = path.join(path.dirname(sourcePath), defaultName);
  } else {
    if (choice.response === 0 && !sourcePath) {
      await dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "원본 경로 없음",
        message: "원본 그림 경로를 알 수 없어 저장 위치를 직접 지정해주세요.",
        buttons: ["확인"],
        noLink: true
      });
    }
    const result = await dialog.showSaveDialog(mainWindow, {
      title: payload.title || "PNG 저장",
      defaultPath: sourcePath ? path.join(path.dirname(sourcePath), defaultName) : defaultName,
      filters: [
        { name: "PNG", extensions: ["png"] }
      ]
    });
    if (result.canceled || !result.filePath) return null;
    filePath = result.filePath;
  }

  await fs.writeFile(filePath, dataUrlToBuffer(payload.dataUrl));
  return filePath;
});
