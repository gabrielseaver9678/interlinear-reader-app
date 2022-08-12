const { app, ipcMain, BrowserWindow } = require("electron")
const path = require("path")
const translator = require("./translator")

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        }
    })
    
    win.loadFile("index.html")
}

app.whenReady().then(() => {
    
    ipcMain.handle("translate", async (_, source, target, text) => {
        return translator.translate(source, target, text)
    })
    
    ipcMain.handle("translateAll", async (_, source, target, textsJSON) => {
        return translator.translateAll(source, target, textsJSON)
    })
    
    ipcMain.on("console-log", (_, value) => {
        console.log(value)
    })
    
    createWindow()
    
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})