const electron = require('electron');
const robot = require('robotjs');
const ipcRenderer = electron.ipcRenderer;
const Store = require('electron-store');
const preferenceStore = new Store();

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

ipcRenderer.on('worker-paste-interrupted', () => isInterrupted = true);
ipcRenderer.on('worker-paste-start', function(event, content){
    ignoreSpaces = preferenceStore.get('ignore-spaces');
    addSpacesNewline = preferenceStore.get('add-space-end');

    robot.keyTap('tab', 'command');
    robot.keyTap('enter');

    newlineMet = false;
    isInterrupted = false;
    (function waitAndWrite (i) {          
        setTimeout(function () {  
          if (isInterrupted) {
            return;
          }
          handleKeypress(content.charAt(content.length - i));             
          if (--i) {
            waitAndWrite(i); 
          }
          else {
            event.sender.send('worker-paste-complete');
          }
        }, 10)
     })(content.length);
});