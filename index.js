'use strict';

const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
const Menu = remote.Menu;

let infoPane = document.getElementsByClassName('infopane')[0];
let infoText = document.getElementsByClassName('infotext')[0];
let stopHide = false;

const InputMenu = Menu.buildFromTemplate([
  { label: 'Undo', role: 'undo' },
  { label: 'Redo', role: 'redo' },
  { type: 'separator' },
  { label: 'Cut', role: 'cut' },
  { label: 'Copy', role: 'copy' },
  { label: 'Paste', role: 'paste' },
  { type: 'separator' },
  { label: 'Select all', role: 'selectall' }
]);

document.body.addEventListener('contextmenu', event => {
  event.preventDefault();
  event.stopPropagation();

  let node = event.target;

  while (node) {
    if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
      InputMenu.popup(remote.getCurrentWindow());
      break;
    }
    node = node.parentNode;
  }
});

document.getElementsByClassName('paste-button')[0].onclick = function() {
  const content = document.getElementsByClassName('child textpane')[0]
    .textContent;
  infoPane.style.opacity = 1;
  infoText.textContent = 'Pasting...';
  infoPane.style.backgroundColor = 'var(--processing-bg)';

  stopHide = true;
  ipcRenderer.send('initiate-paste', content);
};

ipcRenderer.on('paste-complete', (event, ...args) => {
  stopHide = false;
  infoText.textContent = 'Completed';
  infoPane.style.backgroundColor = 'var(--success-bg)';
  setTimeout(() => {
    if (!stopHide) {
      infoPane.style.opacity = 0;
    }
  }, 5000);
});

ipcRenderer.on('paste-error', (event, ...args) => {
  stopHide = false;
  infoText.textContent = 'Interrupted';
  infoPane.style.backgroundColor = 'var(--error-bg)';
  setTimeout(() => {
    if (!stopHide) {
      infoPane.style.opacity = 0;
    }
  }, 5000);
});

document
  .getElementsByClassName('child textpane')[0]
  .addEventListener('paste', function(event) {
    let clipboardData;
    let pastedData;

    // Stop data actually being pasted into div
    event.stopPropagation();
    event.preventDefault();

    // Get pasted data via clipboard API
    clipboardData = event.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');

    event.target.textContent = pastedData;
  });

document.getElementsByClassName('pic settings')[0]
  .addEventListener('click', () => ipcRenderer.send('open-preferences'));
