(() => {
    const interlinearViewPara = document.getElementById("interlinear-view-para")
    const returnToInputButton = document.getElementById("return-to-input")

    const textSelectionMenu = document.getElementById("text-selection-menu")
    const translateSelectedText = document.getElementById("translate-selected-text")
    const defineSelectedText = document.getElementById("define-selected-text")

    returnToInputButton.onclick = () => {
        PageViewController.switchToView("input-view", {})
    }

    // Whenever the user stops pressing the pointer, check if a text selection menu should be displayed
    interlinearViewPara.onpointerup = () => {
        const selection = window.getSelection()
        const range = selection.getRangeAt(0)
        const text = getInterlinearViewSelectedText()
        
        // Check that text is selected before showing dialog box
        if (text === "") return
        
        // Check that the selected text is all contained within the interlinear view
        // If the selection both begins and ends in the interlinear view box then the selection
        // must be entirely within the interlinear box
        if (!(interlinearViewPara.contains(selection.anchorNode) && interlinearViewPara.contains(selection.focusNode))) return
        
        // Reposition the text selection menu
        const sRect = range.getBoundingClientRect()
        const mRect = textSelectionMenu.getBoundingClientRect()
        textSelectionMenu.style.top = window.scrollY + sRect.bottom + "px"
        textSelectionMenu.style.left = window.scrollX + sRect.left + "px"
        
        // Make the text selection menu visible
        textSelectionMenu.style.visibility = "visible"
    }

    function getInterlinearViewSelectedText () {
        const selection = window.getSelection()
        const contents = selection.getRangeAt(0).cloneContents()
        
        // Get text of the selection contents and remove English translation--
        // despite the fact that you can't select the English translation it'll
        // still appear in the selection.toString() so the English must be manually
        // removed
        let text = ""
        
        if (contents.childElementCount === 0) {
            // Only the contents of one element is selected, so the text contained
            // can be used directly
            text = selection.toString()
        } else {
            // Content from several elements is selected, ensure only source lang
            // content is considered and not target lang content
            const numEles = contents.childElementCount
            
            // Loop through all child elements and add text content to text if necessary
            for (let i = 0; i < numEles; i ++) {
                const ele = contents.children[i]
                if (ele.className === "source-lang-whitespace") {
                    // If the element is whitespace from the source language, add its contents directly to the text field
                    text += ele.textContent
                } else if (ele.className === "word-pair-elem") {
                    // If the element is a word pair, add the first node contained (which will be
                    // the word from the original language) to the text field
                    text += ele.firstElementChild.textContent
                }
            }
        }
        
        return text
    }

    // When the user clicks, stop showing the text selection menu
    document.onpointerdown = (event) => {
        // Don't make the text selection menu disappear if the user clicked it; only if the user clicked elsewhere
        if (!textSelectionMenu.contains(event.target)) textSelectionMenu.style.visibility = "hidden"
    }

    translateSelectedText.onclick = async () => {
        const text = getInterlinearViewSelectedText()
        alert(await electronAPI.translate(langSourceSelect.value, "en", text))
    }

    defineSelectedText.onclick = () => {
        const text = getInterlinearViewSelectedText()
        electronAPI.openLink(`https://en.wiktionary.org/wiki/${text.toLowerCase()}#${langSourceSelect.options[langSourceSelect.selectedIndex].text}`)
    }

    function makeWhitespaceElem (whitespace) {
        const elem = document.createElement("span")
        const innerHTML = whitespace.replace(/\n/g, "<br class='source-lang-whitespace' />")
        elem.innerHTML = innerHTML
        elem.className = "source-lang-whitespace"
        interlinearViewPara.appendChild(elem)
    }

    function makeWordPairElem (original, translated) {
        // Create the span which holds both the source word (original) and target word (translated)
        const wordPairElem = document.createElement("span")
        wordPairElem.className = "word-pair-elem"
        
        // Create the source word
        const sourceWordElem = document.createElement("span")
        sourceWordElem.textContent = original
        sourceWordElem.className = "source-lang-word"
        
        // Create the target word
        const targetWordElem = document.createElement("span")
        targetWordElem.textContent = translated
        targetWordElem.className = "targetLangWord"
        
        // Append the source and target words to the word pair
        wordPairElem.appendChild(sourceWordElem)
        wordPairElem.appendChild(targetWordElem)
        
        // Append the word pair to the interlinear view
        interlinearViewPara.appendChild(wordPairElem)
        
        // Get the widths of both the source and target words
        const sourceWordWidth = sourceWordElem.getBoundingClientRect().width, targetWordWidth = targetWordElem.getBoundingClientRect().width
        
        // If the source word width is too small, make an extra space so that words do not overlap
        if (sourceWordWidth < targetWordWidth) {
            // Create a spacer to fill the difference between the source word width and the target word width
            const spaceWidth = targetWordWidth - sourceWordWidth
            const spacer = document.createElement("span")
            spacer.style.display = "inline-block"
            spacer.style.width = spaceWidth + "px"
            interlinearViewPara.appendChild(spacer)
        }
    }
    
    PageViewController.addPageView("interlinear-view", new PageView("interlinear-view", (translatedText) => {
        
        // Loop through all words
        for (let i = 0; i < translatedText.original.length; i ++) {
            
            // For each part of the text (whitespace or word) add it to the interlinear view
            if (!translatedText.isWhitespace[i]) {
                makeWordPairElem(translatedText.original[i], translatedText.translated[i]) // Word
            } else {
                makeWhitespaceElem(translatedText.original[i]) // Whitespace
            }
        }
    }, () => {
        interlinearViewPara.innerHTML = ""
    }))
})()