# Interlinear Reader
This app is intended to function as a generator, reader, and editor of digital interlinear texts. There aren't many existing free resources to read interlinear
texts, let alone generate them automatically. The translations may not be perfect, but the general purpose of an interlinear text (or at least the purpose best
aligned with this app) is to learn a new language, which doesn't require perfect translations of each word in context but instead needs a "head-start" at reading
texts written in foreign languages.

## JSON Input and Output Format
After a text stored in the JSON format is translated, it will look like this:
```
{
    "sections" : [
        {
            "original" : [
                "Меня", " ", "зовут", " ", "Габриэль", "\n"
            ],
            "translated" : [
                "Me", " ", "name is", " ", "Gabriel", "\n"
            ],
            "isWhitespace" : [
                false, true, false, true, false, true
            ]
        }
    ]
}
```
The object will contain a `sections` attribute, containing a list of sections. Each section will contain three required fields: `original`, `translated`,
and `isWhitespace`. The `original` field is a the original text, split up between words and whitespace. `isWhitespace` corresponds one-to-one with `original`,
and defines which words should be considered whitespace and which words are considered real text. The `translated` field is a list containing all original text,
translated to the target language. Words marked as whitespace with `isWhitespace` will not be translated, and will be preserved when added to the `translated` list.
So, the three lists (`original`, `translated`, and `isWhitespace`) will all have the same length.  

Additionally, other fields can be added to the section objects, depending on the input to the `translateWithFormat` function. The only field the `translateWithFormat` function adds is `translated`, so all other fields must be correctly formatted before being passed as input into `translateWithFormat`.