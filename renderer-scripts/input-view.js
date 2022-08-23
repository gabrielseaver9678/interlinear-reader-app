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
        
        // Turn the plaintext input into formatted text so it can be translated
        let textObj = formatPlainTextStr(inputText.value.toString())
        
        // Then translate the formatted text object
        textObj = await electronAPI.translateWithFormat(langSourceSelect.value, "en", textObj)
        
        // Switch the view and send the translation data
        PageViewController.switchToView("interlinear-view", textObj)
    }
    
    function formatPlainTextStr (textStr) {
        let text = []
        let isWhitespace = []
        const whitespaceExp = /^[\s]+/
        const wordExp = /^[^\s]+/
        
        while (textStr.length > 0) {
            if (whitespaceExp.test(textStr)) {
                // The remaining part of the text begins with whitespace
                const whitespace = whitespaceExp.exec(textStr)[0]       // Get the whitespace
                isWhitespace.push(true)                                 // Record that this word is actually whitespace
                text.push(whitespace)                                   // Add the whitespace to the text list
                textStr = textStr.substring(whitespace.length)          // Remove the whitespace from the beginning of the string
            } else {
                // The remaining part of the text begins with a word
                const word = wordExp.exec(textStr)[0]                   // Get the word
                isWhitespace.push(false)                                // Record that this word is not whitespace
                text.push(word)                                         // Add the word to the text list
                textStr = textStr.substring(word.length)                // Remove the word from the beginning of the string
            }
        }
        
        return { "sections" : [{ "original" : text, "isWhitespace" : isWhitespace }] }
    }
    
    PageViewController.addPageView("input-view", new PageView("input-view", () => {}, () => {}), true)
})()