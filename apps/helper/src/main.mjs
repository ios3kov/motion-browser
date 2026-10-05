import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  app,
  BaseWindow,
  WebContentsView,
  ipcMain
} from "electron";

import { createPayload } from "../../../packages/protocol/src/index.mjs";
import { connectMailbox, writeEvent, writeHelperReady } from "./mailbox.mjs";
import { normalizeNavigationUrl, isAllowedRemoteUrl } from "./navigation.mjs";
import { REMOTE_WEB_PREFERENCES, TOOLBAR_WEB_PREFERENCES } from "./security.mjs";
import { findConnectUrl, parseConnectUrl } from "./session.mjs";
import { normalizeRawSelection } from "./selection-normalizer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HELPER_VERSION = "0.0.1";
const TOOLBAR_HEIGHT = 52;
const SELECTION_WORLD_ID = 17041;
const SMOKE_MODE = process.argv.includes("--smoke");

let mainWindow = null;
let toolbarView = null;
let pageView = null;
let activeSession = null;
let currentSelection = null;
let busy = false;
let message = "Not connected to AE";
let pendingConnectUrl = findConnectUrl(process.argv);

function stateSnapshot() {
  return {
    connected: Boolean(activeSession),
    hasSelection: Boolean(currentSelection),
    busy,
    message,
    url: pageView && !pageView.webContents.isDestroyed()
      ? pageView.webContents.getURL()
      : ""
  };
}

function publishState() {
  if (toolbarView && !toolbarView.webContents.isDestroyed()) {
    toolbarView.webContents.send("mb:state", stateSnapshot());
  }
}

function setStatus(nextMessage, nextBusy = busy) {
  message = String(nextMessage);
  busy = Boolean(nextBusy);
  publishState();
}

function assertToolbarSender(event) {
  if (!toolbarView || event.sender !== toolbarView.webContents) {
    throw new Error("unauthorized toolbar IPC sender");
  }
}

function layoutViews() {
  if (!mainWindow || !toolbarView || !pageView) return;
  const { width, height } = mainWindow.getContentBounds();
  toolbarView.setBounds({ x: 0, y: 0, width, height: TOOLBAR_HEIGHT });
  pageView.setBounds({
    x: 0,
    y: TOOLBAR_HEIGHT,
    width,
    height: Math.max(0, height - TOOLBAR_HEIGHT)
  });
}

async function navigate(input) {
  const url = normalizeNavigationUrl(input);
  setStatus("Loading…", true);
  try {
    await pageView.webContents.loadURL(url);
    setStatus(activeSession ? "Connected to AE" : "Not connected to AE", false);
  } catch (error) {
    setStatus(`Load failed: ${error.message}`, false);
  }
  return stateSnapshot();
}

async function selectElement() {
  if (!pageView || pageView.webContents.isDestroyed()) {
    throw new Error("browser view unavailable");
  }
  const currentUrl = pageView.webContents.getURL();
  if (!isAllowedRemoteUrl(currentUrl)) {
    setStatus("Open a website first", false);
    return stateSnapshot();
  }

  setStatus("Click an element. Esc cancels.", true);

  try {
    const selectorSource = await readFile(
      path.join(__dirname, "..", "injected", "selector.js"),
      "utf8"
    );

    const raw = await pageView.webContents.executeJavaScriptInIsolatedWorld(
      SELECTION_WORLD_ID,
      [{ code: selectorSource }],
      true
    );

    const normalized = normalizeRawSelection(raw);
    if (!normalized) {
      currentSelection = null;
      setStatus("Selection cancelled", false);
      return stateSnapshot();
    }

    currentSelection = normalized;
    setStatus(`Selected ${normalized.item.kind}`, false);
  } catch (error) {
    currentSelection = null;
    setStatus(`Selection failed: ${error.message}`, false);
  }

  return stateSnapshot();
}

async function sendSelection() {
  if (!currentSelection) {
    setStatus("Select an element first", false);
    return stateSnapshot();
  }
  if (!activeSession) {
    setStatus("Open Motion Browser from After Effects first", false);
    return stateSnapshot();
  }

  setStatus("Sending to AE…", true);

  try {
    const payload = createPayload({
      pageUrl: currentSelection.pageUrl,
      pageTitle: currentSelection.pageTitle,
      items: [currentSelection.item]
    });

    await writeEvent(activeSession, "selection.ready", {
      selection: payload,
      observedStyle: currentSelection.observedStyle
    });

    currentSelection = null;
    setStatus("Sent to AE", false);
  } catch (error) {
    setStatus(`Send failed: ${error.message}`, false);
  }

  return stateSnapshot();
}

async function connectFromUrl(connectUrl) {
  if (!connectUrl) return;

  try {
    const { mailboxPath, sessionId } = parseConnectUrl(connectUrl);
    activeSession = await connectMailbox(mailboxPath, sessionId);
    await writeHelperReady(activeSession, HELPER_VERSION);
    setStatus("Connected to AE", false);
  } catch (error) {
    activeSession = null;
    setStatus(`AE connection failed: ${error.message}`, false);
  }
}

function configureRemotePage() {
  const contents = pageView.webContents;
  const remoteSession = contents.session;

  remoteSession.setPermissionRequestHandler((_contents, _permission, callback) => {
    callback(false);
  });
  remoteSession.setPermissionCheckHandler(() => false);
  remoteSession.on("will-download", (event) => event.preventDefault());

  contents.setWindowOpenHandler(({ url }) => {
    if (isAllowedRemoteUrl(url)) {
      setImmediate(() => navigate(url));
    }
    return { action: "deny" };
  });

  contents.on("will-navigate", (event, url) => {
    if (!isAllowedRemoteUrl(url)) {
      event.preventDefault();
      setStatus("Blocked unsafe navigation", false);
    }
  });

  contents.on("did-navigate", () => publishState());
  contents.on("did-navigate-in-page", () => publishState());
  contents.on("did-fail-load", (_event, code, description) => {
    if (code === -3) return;
    setStatus(`Load failed: ${description}`, false);
  });
}

function createWindow() {
  mainWindow = new BaseWindow({
    width: 1220,
    height: 820,
    minWidth: 760,
    minHeight: 520,
    title: "Motion Browser"
  });

  toolbarView = new WebContentsView({
    webPreferences: {
      ...TOOLBAR_WEB_PREFERENCES,
      preload: path.join(__dirname, "toolbar-preload.cjs")
    }
  });

  pageView = new WebContentsView({
    webPreferences: { ...REMOTE_WEB_PREFERENCES }
  });

  mainWindow.contentView.addChildView(toolbarView);
  mainWindow.contentView.addChildView(pageView);

  layoutViews();
  mainWindow.on("resize", layoutViews);

  configureRemotePage();

  toolbarView.webContents.loadFile(
    path.join(__dirname, "..", "ui", "toolbar.html")
  );
  if (SMOKE_MODE) {
    toolbarView.webContents.once("did-finish-load", () => {
      console.log("MOTION_BROWSER_HELPER_SMOKE_OK");
      setTimeout(() => app.quit(), 100);
    });
  }

  mainWindow.on("closed", () => {
    toolbarView?.webContents.close();
    pageView?.webContents.close();
    toolbarView = null;
    pageView = null;
    mainWindow = null;
  });

  publishState();
}

function registerToolbarIpc() {
  ipcMain.handle("mb:get-state", (event) => {
    assertToolbarSender(event);
    return stateSnapshot();
  });

  ipcMain.handle("mb:navigate", async (event, url) => {
    assertToolbarSender(event);
    return navigate(url);
  });

  ipcMain.handle("mb:select-element", async (event) => {
    assertToolbarSender(event);
    return selectElement();
  });

  ipcMain.handle("mb:send-selection", async (event) => {
    assertToolbarSender(event);
    return sendSelection();
  });
}

function registerProtocolHandler() {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(
      "motionbrowser",
      process.execPath,
      [path.resolve(process.argv[1])]
    );
  } else {
    app.setAsDefaultProtocolClient("motionbrowser");
  }
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const url = findConnectUrl(argv);
    if (url) connectFromUrl(url);
    mainWindow?.show();
    mainWindow?.focus();
  });

  app.on("open-url", (event, url) => {
    event.preventDefault();
    if (app.isReady()) {
      connectFromUrl(url);
    } else {
      pendingConnectUrl = url;
    }
  });

  app.whenReady().then(async () => {
    registerProtocolHandler();
    registerToolbarIpc();
    createWindow();
    if (pendingConnectUrl) {
      await connectFromUrl(pendingConnectUrl);
      pendingConnectUrl = null;
    }
  });

  app.on("window-all-closed", () => app.quit());
}
