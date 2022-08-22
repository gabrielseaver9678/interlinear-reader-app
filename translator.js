const { net } = require("electron")
const lingvaScraper = require("lingva-scraper")

module.exports = { translate, translateAll, translateWithFormat }

async function translate (source, target, text) {
    return lingvaScraper.getTranslationText(source, target, text)
}

async function translateAll (source, target, textsJSON) {
    const texts = JSON.parse(textsJSON)
    return JSON.stringify(await Promise.all(texts.map(text => translate(source, target, text))))
}

async function translateWithFormat (source, target, textJSON) {
    // Gets JSON representing the original text
    let text = JSON.parse(textJSON)
    
    // Loop through all sections of the text, translating each one independently
    for (let sectI = 0; sectI < text.sections.length; sectI ++) {
        // Create a new list for the translated words
        let translatedWords = []
        
        // Loop through words in section to translate them
        for (let wordI = 0; wordI < text.sections[sectI].original.length; wordI ++) {
            
            
            if (text.sections[sectI].isWhitespace[wordI] == false) {
                
                // If the word is not whitespace, begin translating it and add the translation to the translatedWords list
                translatedWords.push(translate(source, target, text.sections[sectI].original[wordI]))
            } else {
                
                // If the word is whitespace, preserve it when adding it to the translatedWords list
                translatedWords.push(Promise.resolve(text.sections[sectI].original[wordI]))
            }
        }
        
        // Once all words have begun translating, wait for them to finish and then append the list to the original object
        text.sections[sectI].translated = await Promise.all(translatedWords)
    }
    
    // Once all sections are translated, return the object (converted back to a string)
    return JSON.stringify(text)
}