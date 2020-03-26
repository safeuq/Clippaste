const Store = require('electron-store');
const { remote } = require('electron');
const preferenceStore = new Store({
  'igonre-spaces': {
    type: 'boolean',
    default: true
  },
  'add-space-end': {
    type: 'boolean',
    default: true
  }
});

let options = document.getElementsByTagName('input');
for(let option of options){
    option.checked = preferenceStore.get(option.name);
    option.onclick = toggleCheck;
}

function toggleCheck(event) {
  let element = event.target;
  // console.log(element.name + ": " + element.checked);
  preferenceStore.set(element.name, element.checked);
}

window.addEventListener('keyup', (event) => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  if (event.key === 'Escape') {
    remote.getCurrentWindow().close();
  }
}, true);