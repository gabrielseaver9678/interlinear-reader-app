const { app, shell, ipcMain, BrowserWindow } = require("electron")
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
    
    ipcMain.handle("translateWithFormat", async (_, source, target, textJSON) => {
        return translator.translateWithFormat(source, target, textJSON)
    })
    
    ipcMain.on("console-log", (_, value) => {
        console.log(value)
    })
    
    ipcMain.on("open-link", (_, url) => {
        shell.openExternal(url)
    })
    
    createWindow()
    
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})