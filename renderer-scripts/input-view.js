(() => {    
    const inputText = document.getElementById("input-text")

    const translateButton = document.getElementById("translate-button")
    translateButton.onclick = translateInput

    const langSourceSelect = document.getElementById("lang-source")
    function addLangOption (code, langName, selected) {
        // Add a language option to the source languages dropdown
        const sourceOpt = document.createElement("option")
        sourceOpt.text = langName
        sourceOpt.value = code
        if (selected) { sourceOpt.selected = "selected" }
        langSourceSelect.appendChild(sourceOpt)
    }

    // Add all the source language options
    addLangOption("ar", "Arabic")
    addLangOption("bn", "Bengali")
    addLangOption("fr", "French")
    addLangOption("de", "German")
    addLangOption("hi", "Hindi")
    addLangOption("it", "Italian")
    addLangOption("ja", "Japanese")
    addLangOption("ko", "Korean")
    addLangOption("pt", "Portuguese")
    addLangOption("ru", "Russian", true)
    addLangOption("es", "Spanish")
    addLangOption("tr", "Turkish")

    async function translateInput () {
        // Translate the text
        const textObj = await electronAPI.translateAndFormat(langSourceSelect.value, "en", inputText.value.toString())
        
        // Switch the view and send the translation data
        PageViewController.switchToView("interlinear-view", textObj)
    }
    
    PageViewController.addPageView("input-view", new PageView("input-view", () => {}, () => {}), true)
})()