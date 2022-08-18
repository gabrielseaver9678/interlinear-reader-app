const inputBox = document.getElementById("input-box")
const inputText = document.getElementById("input-text")

const translateButton = document.getElementById("translate-button")
translateButton.onclick = translateInput

const interlinearView = document.getElementById("interlinear-view")
const returnToInputButton = document.getElementById("return-to-input")

const textSelectionMenu = document.getElementById("text-selection-menu")
const translateSelectedText = document.getElementById("translate-selected-text")
const defineSelectedText = document.getElementById("define-selected-text")

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

returnToInputButton.onclick = () => {
    interlinearView.innerHTML = ""
    inputBox.style.visibility = "visible"
}

// Whenever the user stops pressing the pointer, check if a text selection menu should be displayed
interlinearView.onpointerup = () => {
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const text = getInterlinearViewSelectedText()
    
    // Check that text is selected before showing dialog box
    if (text === "") return
    
    // Check that the selected text is all contained within the interlinear view
    // If the selection both begins and ends in the interlinear view box then the selection
    // must be entirely within the interlinear box
    if (!(interlinearView.contains(selection.anchorNode) && interlinearView.contains(selection.focusNode))) return
    
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

async function translateInput () {
    // Make the input box invisible
    inputBox.style.visibility = "hidden"
    
    // Generate translated words and pair them
    const textParts = await getTranslatedTextParts(langSourceSelect.value, "en", inputText.value.toString())
    
    textParts.forEach(textPart => {
        // For part of the text (whitespace or word), add the text to the interlinear view
        if (textPart.type === "word") {
            makeWordPairElem(textPart)
        } else if (textPart.type === "whitespace") {
            makeWhitespaceElem(textPart)
        }
    });
}

function makeWhitespaceElem (whitespace) {
    const elem = document.createElement("span")
    const innerHTML = whitespace.content.replace(/\n/g, "<br class='source-lang-whitespace' />")
    elem.innerHTML = innerHTML
    elem.className = "source-lang-whitespace"
    interlinearView.appendChild(elem)
}

function makeWordPairElem (wordPair) {
    // Create the span which holds both the source word (original) and target word (translated)
    const wordPairElem = document.createElement("span")
    wordPairElem.className = "word-pair-elem"
    
    // Create the source word
    const sourceWordElem = document.createElement("span")
    sourceWordElem.textContent = wordPair.content.original
    sourceWordElem.className = "source-lang-word"
    
    // Create the target word
    const targetWordElem = document.createElement("span")
    targetWordElem.textContent = wordPair.content.translated
    targetWordElem.className = "targetLangWord"
    
    // Append the source and target words to the word pair
    wordPairElem.appendChild(sourceWordElem)
    wordPairElem.appendChild(targetWordElem)
    
    // Append the word pair to the interlinear view
    interlinearView.appendChild(wordPairElem)
    
    // Get the widths of both the source and target words
    const sourceWordWidth = sourceWordElem.getBoundingClientRect().width, targetWordWidth = targetWordElem.getBoundingClientRect().width
    
    // If the source word width is too small, make an extra space so that words do not overlap
    if (sourceWordWidth < targetWordWidth) {
        // Create a spacer to fill the difference between the source word width and the target word width
        const spaceWidth = targetWordWidth - sourceWordWidth
        const spacer = document.createElement("span")
        spacer.style.display = "inline-block"
        spacer.style.width = spaceWidth + "px"
        interlinearView.appendChild(spacer)
    }
}

function splitText (text) {
    let parts = []
    const whitespaceExp = /^[\s]+/
    const wordExp = /^[^\s]+/
    
    while (text.length > 0) {
        if (whitespaceExp.test(text)) {
            // The remaining part of the text begins with whitespace
            const whitespace = whitespaceExp.exec(text)[0]          // Get the whitespace
            parts.push({ type:"whitespace", content: whitespace })  // Add the whitespace to the parts list
            text = text.substring(whitespace.length)                // Remove the whitespace from the beginning of the string
        } else {
            // The remaining part of the text begins with a word
            const word = wordExp.exec(text)[0]                      // Get the wor
            parts.push({ type:"word", content: word })              // Add the word to the parts list
            text = text.substring(word.length)                      // Remove the word from the beginning of the string
        }
    }
    
    return parts
}

async function getTranslatedTextParts (source, target, text) {
    // Get all parts from a text (words + whitespace)
    let textParts = splitText(text)
    
    // Get a list of words from the parts list
    let words = []
    textParts.forEach(part => {
        if (part.type === "word") words.push(part.content)
    })
    
    // Translate all words
    const translatedWords = await electronAPI.translateAll(source, target, words)
    
    // Update the text parts list to include the translated words
    let wordIndex = 0;
    for (let partIndex = 0; partIndex < textParts.length; partIndex ++) {
        // No need to update if the text part isn't a word
        if (textParts[partIndex].type !== "word") continue
        
        // If the text part is a word, then get the translated word
        const translatedWord = translatedWords[wordIndex]
        const ogWord = words[wordIndex]
        
        // Then add the translated word to the text parts list
        textParts[partIndex].content = { original: ogWord, translated: translatedWord }
        
        // Update the word index for the next translated word
        wordIndex ++
    }
    
    // Return the updated list of text parts
    return textParts
}