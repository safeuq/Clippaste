const electron = require('electron');
const robot = require('robotjs');
const ipcRenderer = electron.ipcRenderer;
const Store = require('electron-store');
const preferenceStore = new Store();
const isMac = process.platform === 'darwin';

let isInterrupted = false;
let ignoreSpaces;
let addSpacesNewline;
let newlineMet = false;

function handleKeypress(letter) {
  if (letter === '\n') {
    if (addSpacesNewline && !newlineMet) {
      robot.keyTap('space');
    }
    if (ignoreSpaces) {
      newlineMet = true;
    }
    robot.keyTap('enter');
  } else {
    if (!newlineMet || (letter !== ' ' && letter !== '\t')) {
      newlineMet = false;
      robot.typeString(letter);
    }
  }
}

function waitAndWrite (sender, content, i) {    
  setTimeout(function () {  
    if (isInterrupted) {
      ipcRenderer.send('worker-paste-error');
      return;
    }
    handleKeypress(content.charAt(content.length - i));             
    if (--i) {
      waitAndWrite(sender, content, i); 
    }
    else {
      sender.send('worker-paste-complete');
    }
  }, 10)
}

ipcRenderer.on('worker-paste-interrupted', () => isInterrupted = true);
ipcRenderer.on('worker-paste-start', function(event, content){
    ignoreSpaces = preferenceStore.get('ignore-spaces');
    addSpacesNewline = preferenceStore.get('add-space-end');

    if (isMac) {
      robot.keyTap('tab', 'command');
      robot.keyTap('enter');
    } else {
      robot.keyTap('tab', 'alt');
    }

    newlineMet = false;
    isInterrupted = false;
    setTimeout(() => waitAndWrite(event.sender, content, content.length), 500);
});