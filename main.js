const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, Menu, Tray } = require('electron')
const path = require('path')
const AutoLaunch = require('auto-launch');
const isDev = require('electron-is-dev');

var ks = require('node-key-sender')

// Enable reload
require('electron-reload')(__dirname);

// Lets remove application menu
Menu.setApplicationMenu(false);


var iconpath = path.join(__dirname, '/src/assets/icon.ico');
let tray = null;
function createWindow () {
  const win = new BrowserWindow({
    width: 400,
    height: 279,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    },    
    resizable: false,
    icon: iconpath
  })
  
  if (isDev) {
    //win.webContents.openDevTools()
  }
  
  win.loadFile('src/app/index.html')
  win.hide();

  // Add to tray  
  tray = new Tray(iconpath)
  const contextMenu = Menu.buildFromTemplate([    
    { label: 'Quit', click:  function(){
        app.isQuiting = true;
        app.quit();
      }
    }
  ])
  tray.setToolTip('Unipen')
  tray.setContextMenu(contextMenu)  

  // Register short codes
  globalShortcut.register ("CommandOrControl+Alt+P", () => { win.show (); })

  // Event handler
  ipcMain.on('send', (event, arg) => { 
    const text = arg
    clipboard.writeText(text)    
    ks.sendCombination(['control', 'v'])       
    win.minimize()
    win.hide()
  });

  ipcMain.on('dismiss', () => {     
    win.minimize()
    win.hide()
  });
}

app.whenReady().then(createWindow)

// Auto launch
let autoLaunch = new AutoLaunch({
  name: 'Unipen',
  path: app.getPath('exe'),
});
autoLaunch.isEnabled().then((isEnabled) => {
  if (!isEnabled) autoLaunch.enable();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    //app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})