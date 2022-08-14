const { ipcRenderer, contextBridge } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
    console: {
        log: (value) => {
            ipcRenderer.send("console-log", value)
        }
    },
    
    translate: async (source, target, text) => {
        return ipcRenderer.invoke("translate", source, target, text)
    },
    
    translateAll: async (source, target, texts) => {
        return JSON.parse(await ipcRenderer.invoke("translateAll", source, target, JSON.stringify(texts)))
    },
    
    openLink: (url) => {
        ipcRenderer.send("open-link", url)
    },
})