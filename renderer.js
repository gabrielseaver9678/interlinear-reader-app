const inputText = document.getElementById("input-text")
const translateButton = document.getElementById("translate-button")
translateButton.onclick = translateInput
const interlinearView = document.getElementById("interlinear-view")

const textSelectionMenu = document.getElementById("text-selection-menu")

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

// Whenever the user stops pressing the pointer, check if a text selection menu should be displayed
interlinearView.onpointerup = () => {
    const selection = window.getSelection()
    const range = selection.getRangeAt(0), contents = range.cloneContents()
    const text = getInterlinearViewSelectedText(selection, range, contents)
    
    // Check that text is selected before showing dialog box
    if (text === "") return
    
    // Check that the selected text is all contained within the interlinear view
    // If the selection both begins and ends in the interlinear view box then the selection
    // must be entirely within the interlinear box
    if (!(interlinearView.contains(selection.anchorNode) && interlinearView.contains(selection.focusNode))) return
    
    // Reposition the text selection menu
    const sRect = range.getBoundingClientRect()
    const mRect = textSelectionMenu.getBoundingClientRect()
    textSelectionMenu.style.top = window.scrollY +  sRect.top - 30 + "px"
    textSelectionMenu.style.left = window.scrollX + sRect.left + sRect.width/2 - mRect.width/2 + "px"
    
    // Make the text selection menu visible
    textSelectionMenu.style.visibility = "visible"
}

function getInterlinearViewSelectedText (selection, range, contents) {
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
            console.log(ele)
            if (ele.className === "sourceLangWhitespace") {
                // If the element is whitespace from the source language, add its contents directly to the text field
                text += ele.textContent
            } else if (ele.className === "wordPairElem") {
                // If the element is a word pair, add the first node contained (which will be
                // the word from the original language) to the text field
                text += ele.firstElementChild.textContent
            }
        }
    }
    
    return text
}

// When the user clicks, stop showing the text selection menu
document.onpointerdown = () => {
    textSelectionMenu.style.visibility = "hidden"
}

async function translateInput () {
    // Reset the interlinear book view
    interlinearView.innerHTML = ""
    
    // Generate translated words and pair them
    const wordPairs = await getTranslatedWordPairs(langSourceSelect.value, "en", inputText.value.toString())
    
    wordPairs.forEach(wordPair => {
        // For each pair of original words and translated words, create the html element to represent both
        makeWordPairElem(wordPair)
        
        // Create a space character to separate words
        const spaceChar = document.createElement("span")
        spaceChar.innerHTML = "&nbsp;"
        spaceChar.className = "sourceLangWhitespace"
        interlinearView.appendChild(spaceChar)
    });
}

function makeWordPairElem (wordPair) {
    // Create the span which holds both the source word (original) and target word (translated)
    const wordPairElem = document.createElement("span")
    wordPairElem.className = "wordPairElem"
    
    // Create the source word
    const sourceWordElem = document.createElement("span")
    sourceWordElem.textContent = wordPair[0]
    sourceWordElem.className = "sourceLangWord"
    
    // Create the target word
    const targetWordElem = document.createElement("span")
    targetWordElem.textContent = wordPair[1]
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

function getWords (text) {
    // Split apart text into words separated by whitespace
    return text.split(RegExp("[\\s]+"))
}

async function getTranslatedWordPairs (source, target, text) {
    // Get all words from a text
    const words = getWords(text)
    
    // Translate all words
    const translatedWords = await electronAPI.translateAll(source, target, words)
    
    // Return a pairing of all original source words with the translated target words
    return words.map((word, i) => [word, translatedWords[i]])
}