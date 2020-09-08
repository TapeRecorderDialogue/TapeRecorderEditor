const electron = require("electron")
const ipcRenderer = electron.ipcRenderer
const fs = require("fs")
// const yarnWindow = electron.remote.getCurrentWindow()

let tapeInstance = null

const editorFrameEl = document.getElementById("tape-frame")

window.addEventListener("tapeReady", e => {
    tapeInstance = e
    tapeInstance.app.fs = fs
    tapeInstance.app.electron = electron
})

editorFrameEl.src = `../dist/index.html` //TODO: copy ../dist/ to ./app