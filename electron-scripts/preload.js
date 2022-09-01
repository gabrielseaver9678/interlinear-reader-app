const { ipcRenderer, contextBridge } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
    console: {
        log: (value) => {
            ipcRenderer.send("console-log", JSON.stringify(value))
        }
    },
    
    translate: async (source, target, text) => {
        return ipcRenderer.invoke("translate", source, target, text)
    },
    
    translateAndFormat: async (source, target, text) => {
        return JSON.parse(await ipcRenderer.invoke("translateAndFormat", source, target, text))
    },
    
    openLink: (url) => {
        ipcRenderer.send("open-link", url)
    },
})