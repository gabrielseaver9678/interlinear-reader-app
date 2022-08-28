const fs = require("fs")
const lingvaScraper = require("lingva-scraper")

module.exports = { translate, translateWithFormat }

const translationConfig = JSON.parse(fs.readFileSync("./translation-config/config.json"))
translationConfig["languages"].forEach(lang => {
    translationConfig[lang] = JSON.parse(fs.readFileSync(`./translation-config/${lang}.json`))
})

function getTranslationOverride (source, target, text) {
    // Check if the translation override has an entry for the source language
    if (translationConfig[source]) {
        
        const lowercaseBeforeOverride = translationConfig[source]["override"]["lowercase-before-override"]
        if (lowercaseBeforeOverride) text = text.toLowerCase()
        
        // Check for entry in target language under source language
        if (translationConfig[source]["override"][target]) {
            
            // Loop through all entries in the translation override
            for (let i = 0; i < translationConfig[source]["override"][target].length; i ++) {
                
                // If an entry with the given input text is found, return the overridden output text
                if (translationConfig[source]["override"][target][i][0] === text) return translationConfig[source]["override"][target][i][1]
            }
        }
    }
    
    // If any of the above failed, return false to indicate there was no override
    return false
}

async function translate (source, target, text) {
    // Check for a translation override
    const translationOverride = getTranslationOverride(source, target, text)
    
    // If there was no override, perform the translation and return its output
    if (translationOverride === false) return lingvaScraper.getTranslationText(source, target, text)
    
    // Otherwise, there was an override, and return the overridden output
    return Promise.resolve(translationOverride)
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