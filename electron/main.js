const electron = require("electron")

const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
const dialog = electron.dialog
const app = electron.app

let mainWin

function createWindow(){
    
    mainWin = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // mainWin.setMenu(null)

    mainWin.loadURL(`file://${__dirname}/index.html`)
}


app.on("ready", createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })