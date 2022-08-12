const { net } = require("electron")
const lingvaScraper = require("lingva-scraper")

module.exports = { translate, translateAll }

async function translate (source, target, text) {
    return lingvaScraper.getTranslationText(source, target, text)
}

async function translateAll (source, target, textsJSON) {
    const texts = JSON.parse(textsJSON)
    return JSON.stringify(await Promise.all(texts.map(text => translate(source, target, text))))
}

function define () {
    
}

async function postReq (hostname, path, bodyObj) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(bodyObj)
        
        const request = net.request({
            method: "POST",
            protocol: "https:",
            headers: {
                "Content-Type": "application/json",
            },
            hostname,
            path,
        })
        
        request.on("response", (response) => {
            responseData = ""
            
            response.on("data", (chunk) => {
                responseData += chunk.toString()
            })
            
            response.on("end", () => {
                resolve(responseData)
            })
        })
        
        request.on("error", () => {
            reject()
        })
        
        request.write(body)
        request.end()
    })
}