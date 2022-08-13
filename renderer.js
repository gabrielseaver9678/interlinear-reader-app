const inputText = document.getElementById("input-text")
const translateButton = document.getElementById("translate-button")
translateButton.onclick = translateInput
const interlinearView = document.getElementById("interlinear-view")

const langSourceSelect = document.getElementById("lang-source")
function addLangOption (code, langName, selected) {
    // Add a language option to the source languages dropdown
    const sourceOpt = document.createElement("option")
    sourceOpt.text = langName
    sourceOpt.value = code
    if (selected) { sourceOpt.selected = "selected" }
    langSourceSelect.appendChild(sourceOpt)
}
addLangOption("zh", "Chinese")
addLangOption("ko", "Korean")
addLangOption("ru", "Russian", true)
addLangOption("es", "Spanish")

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
        spaceChar.textContent = " "
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