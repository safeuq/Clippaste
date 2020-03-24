'use strict';
const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
const Menu = remote.Menu;

const InputMenu = Menu.buildFromTemplate([
    {label: 'Undo', role: 'undo'}, 
    {label: 'Redo', role: 'redo'}, 
    {type: 'separator'}, 
    {label: 'Cut', role: 'cut'}, 
    {label: 'Copy', role: 'copy'}, 
    {label: 'Paste', role: 'paste'}, 
    {type: 'separator'}, 
    {label: 'Select all',role: 'selectall'}
]);

document.body.addEventListener('contextmenu', (event) => {
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
    let content = document.getElementsByClassName('child textpane')[0].innerHTML;
    ipcRenderer.send('initiate-paste', content);
};

ipcRenderer.on('paste-complete', (event, ...args) => {
    alert(args[0]);
});

document.getElementsByClassName('child textpane')[0].addEventListener('paste', function (event) {
    let clipboardData, pastedData;

    // Stop data actually being pasted into div
    event.stopPropagation();
    event.preventDefault();

    // Get pasted data via clipboard API
    clipboardData = event.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');

    event.target.innerHTML = pastedData;
});
