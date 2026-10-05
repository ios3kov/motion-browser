export const REMOTE_WEB_PREFERENCES = Object.freeze({
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  webSecurity: true,
  allowRunningInsecureContent: false,
  webviewTag: false,
  spellcheck: true,
  partition: "persist:motion-browser-web"
});

export const TOOLBAR_WEB_PREFERENCES = Object.freeze({
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  webSecurity: true
});

export const SECURITY_POLICY = Object.freeze({
  allowRemoteNode: false,
  allowRemotePreloadBridge: false,
  allowAutomaticPermissions: false,
  allowAutomaticDownloads: false,
  allowedNavigationProtocols: ["http:", "https:"]
});
