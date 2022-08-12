const inputText = document.getElementById("input-text")
const translateButton = document.getElementById("translate-button")
const interlinearView = document.getElementById("interlinear-view")

translateButton.onclick = translateInput

async function translateInput () {
    interlinearView.innerHTML = ""
    
    const wordPairs = await getTranslatedWordPairs("ru", "en", inputText.value.toString())
    console.log(wordPairs)
    wordPairs.forEach(wordPair => {
        interlinearView.appendChild(wordPairToElem(wordPair))
        const spaceChar = document.createElement("span")
        spaceChar.textContent = " "
        interlinearView.appendChild(spaceChar)
    });
}

function wordPairToElem (wordPair) {
    const wordPairElem = document.createElement("span")
    wordPairElem.className = "wordPairElem"
    
    const sourceWordElem = document.createElement("span")
    sourceWordElem.textContent = wordPair[0]
    sourceWordElem.className = "sourceLangWord"
    
    const targetWordElem = document.createElement("span")
    targetWordElem.textContent = wordPair[1]
    targetWordElem.className = "targetLangWord"
    
    wordPairElem.appendChild(sourceWordElem)
    wordPairElem.appendChild(targetWordElem)
    
    return wordPairElem
}

function getWords (text) {
    return text.split(RegExp("[\\s]+"))
}

async function getTranslatedWordPairs (source, target, text) {
    const words = getWords(text)
    const translatedWords = await electronAPI.translateAll(source, target, words)
    return words.map((word, i) => [word, translatedWords[i]])
}