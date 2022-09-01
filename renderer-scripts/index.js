const appConstants = {
    
    langCodes : {
        "ar" : "Arabic",
        "bn" : "Bengali",
        "fr" : "French",
        "de" : "German",
        "hi" : "Hindi",
        "it" : "Italian",
        "ja" : "Japanese",
        "ko" : "Korean",
        "pt" : "Portuguese",
        "ru" : "Russian",
        "es" : "Spanish",
        "tr" : "Turkish",
    }
    
}

class PageView {
    #elemId
    #onLoad
    #onUnload
    
    constructor (elemId, onLoad, onUnload) {
        this.#elemId = elemId
        this.#onLoad = onLoad
        this.#onUnload = onUnload
    }
    
    unload () {
        document.getElementById(this.#elemId).style.visibility = "hidden"
        this.#onUnload()
    }
    
    load (data) {
        document.getElementById(this.#elemId).style.visibility = "visible"
        this.#onLoad(data)
    }
}

class PageViewController {
    static #activeView
    static #pageViews = { }
    
    static addPageView (viewName, pageView, defaultView) {
        this.#pageViews[viewName] = pageView
        if (defaultView) PageViewController.switchToView(viewName)
    }
    
    static switchToView (viewName, data) {
        // If there is an active view, unload it
        if (this.#activeView) {
            this.#activeView.unload()
        }
        
        // Then load the given view
        this.#activeView = this.#pageViews[viewName]
        this.#activeView.load(data)
    }
    
}