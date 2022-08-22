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
    
    translateWithFormat: async (source, target, textObj) => {
        return JSON.parse(await ipcRenderer.invoke("translateWithFormat", source, target, JSON.stringify(textObj)))
    },
    
    openLink: (url) => {
        ipcRenderer.send("open-link", url)
    },
})