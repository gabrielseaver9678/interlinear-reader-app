const inputText = document.getElementById("input-text")
const translateButton = document.getElementById("translate-button")

translateButton.onclick = translateInput

async function translateInput () {
    alert(await electronAPI.translate("ru", "en", inputText.value.toString()))
}

function getWords (text) {
    return text.split(RegExp("[\\s]+"))
}

async function getTranslatedWordPairs (source, target, text) {
    const words = getWords(text)
    const translatedWords = await electronAPI.translateAll(source, target, words)
    return words.map((word, i) => [word, translatedWords[i]])
}