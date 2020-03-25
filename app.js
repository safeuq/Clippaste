'use strict';

const electron = require('electron');
const robot = require('robotjs');
const dialog = electron.dialog;

const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
/**
 * Creates a new main window
 */
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('close', (event) => {
    mainWindow = null;
  });
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

/**
 * Converts a character to a RobotJS keystroke
 * @param {string} content
 */
function textToKeyStroke(content) {
  for (let i = 0; i < content.length; i++) {
    if (content.charCodeAt(i) > 255) {
      throw new Error('Unicode not supported');
    }
    if (content.charAt(i) === content.charAt(i).toLocaleUpperCase()) {
      robot.keyTap(content.charAt(i), 'shift');
      continue;
    }
    switch (content.charAt(i)) {
      case '~':
        robot.keyTap('`', 'shift');
        break;
      case '!':
        robot.keyTap('1', 'shift');
        break;
      case '@':
        robot.keyTap('2', 'shift');
        break;
      case '#':
        robot.keyTap('3', 'shift');
        break;
      case '$':
        robot.keyTap('4', 'shift');
        break;
      case '%':
        robot.keyTap('5', 'shift');
        break;
      case '^':
        robot.keyTap('6', 'shift');
        break;
      case '&':
        robot.keyTap('7', 'shift');
        break;
      case '*':
        robot.keyTap('8', 'shift');
        break;
      case '(':
        robot.keyTap('9', 'shift');
        break;
      case ')':
        robot.keyTap('0', 'shift');
        break;
      case '_':
        robot.keyTap('-', 'shift');
        break;
      case '+':
        robot.keyTap('=', 'shift');
        break;
      case '{':
        robot.keyTap('[', 'shift');
        break;
      case '}':
        robot.keyTap(']', 'shift');
        break;
      case '|':
        robot.keyTap('\\', 'shift');
        break;
      case ':':
        robot.keyTap(';', 'shift');
        break;
      case '"':
        robot.keyTap('\'', 'shift');
        break;
      case '<':
        robot.keyTap(',', 'shift');
        break;
      case '>':
        robot.keyTap('.', 'shift');
        break;
      case '?':
        robot.keyTap('/', 'shift');
        break;
      case ' ':
        robot.keyTap('space');
        break;
      case '\n':
        robot.keyTap('enter');
        break;
      default:
        robot.keyTap(content.charAt(i));
    }
  }
}

ipcMain.on('initiate-paste', (event, ...args) => {
  const content = args[0];
  let isInterrupted = false;

  if (mainWindow === null) {
    throw new Error('No window present');
  }
  mainWindow.addListener('focus', (event) => isInterrupted = true );

  robot.keyTap('tab', 'command');
  robot.keyTap('enter');

  for (let i = 0; i < content.length; i++) {
    if (isInterrupted) {
      dialog.showMessageBox(null, {
        type: 'info',
        message: 'Interrupted',
      });
      break;
    }
    robot.typeStringDelayed(content.charAt(i), 60000);
  }
  event.sender.send('paste-complete', 'Done');
  mainWindow.removeAllListeners('focus');
  dialog.showMessageBox(null, {
    type: 'info',
    message: 'Not interrupted',
  });
});
