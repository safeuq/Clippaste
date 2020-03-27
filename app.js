'use strict';

const electron = require('electron');
const path = require('path');

const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
let workerWindow;
let preferencesWindow;

function showPreferencesWindow() {
  if (preferencesWindow === undefined || 
      preferencesWindow === null ||
      preferencesWindow.isDestroyed()
  ) {
    preferencesWindow = new BrowserWindow({
      width: 250,
      height: 100,
      resizable: false,
      parent: mainWindow,
      modal: true,
      show: false,
      icon: path.join(__dirname, 'icons/launcher/launcher_mac.png'),
      webPreferences: {
        nodeIntegration: true
      }
    });

    preferencesWindow.loadFile('preferences.html');
    preferencesWindow.once('ready-to-show', preferencesWindow.show);
    preferencesWindow.addListener('blur', preferencesWindow.hide);
    preferencesWindow.on('close', (event) => {
      if (mainWindow === undefined || 
          mainWindow === null || 
          mainWindow.isDestroyed() 
      ) {
        preferencesWindow = null;
      } else {
        event.stopPropagation();
        preferencesWindow.hide();
      }
    });
  } else {
    preferencesWindow.show();
  }
}
/**
 * Creates a new main window
 */
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    minWidth: 300,
    minHeight: 300,
    maxWidth: 800,
    maxHeight: 800,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.once('ready-to-show', mainWindow.show);
  mainWindow.loadFile('index.html');
  mainWindow.on('close', () => {
    mainWindow = null;
  });
  mainWindow.webContents.on('page-title-updated', function(e) {
    e.preventDefault();
  });

  if (workerWindow === undefined) {
    workerWindow = new BrowserWindow({
      show: false,
      webPreferences: { 
        nodeIntegration: true 
      }
    });
    workerWindow.loadFile('worker.html');
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length <= 1) {
    createWindow();
  }
});

ipcMain.on('initiate-paste', (event, content) => {
  workerWindow.webContents.send('worker-paste-start', content);
  mainWindow.addListener('focus', () => {
    workerWindow.webContents.send('worker-paste-interrupted');
  });
});

ipcMain.on('worker-paste-complete', () => {
  mainWindow.removeAllListeners('focus');
  mainWindow.webContents.send('paste-complete');
});

ipcMain.on('worker-paste-error', () => {
  mainWindow.removeAllListeners('focus');
  mainWindow.webContents.send('paste-error');
});

ipcMain.on('open-preferences', showPreferencesWindow);


// const Menu = electron.Menu;
// const isMac = process.platform === 'darwin';

// let template = [
//   // { role: 'appMenu' }
//   ...(isMac ? [{
//     label: app.name,
//     submenu: [
//       { role: 'about' },
//       { type: 'separator' },
//       { role: 'services' },
//       { type: 'separator' },
//       { role: 'hide' },
//       { role: 'hideothers' },
//       { role: 'unhide' },
//       { type: 'separator' },
//       { role: 'quit' }
//     ]
//   }] : []),
// ];
// let menu = Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(menu);