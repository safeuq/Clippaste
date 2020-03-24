'use strict';

const electron = require('electron')
const robot = require('robotjs');
const dialog = electron.dialog;

const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
  mainWindow.on('close', (event) => {
    mainWindow = null;
  })
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('initiate-paste', (event, ...args) => {
  const content = args[0];
  let isInterrupted = false;
  
  if (mainWindow === null) {
    throw new Error("No window present");
  }
  mainWindow.addListener('focus', (event) => isInterrupted = true );

  robot.keyTap('tab', 'command');
  robot.keyTap('enter');
  
  for (var i = 0; i < content.length; i++) {
    if (isInterrupted) {
      dialog.showMessageBox(null, {
        type: 'info',
        message: 'Interrupted'
      });
      break;
    }
    robot.typeString(content.charAt(i));
  }
  event.sender.send('paste-complete', 'Done');
  mainWindow.removeAllListeners('focus');
});