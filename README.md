# Quizlet Set Converter
A simple web extension that allows you to easily convert a Quizlet set into a Vocabustudy set

[Read the Blog Post](https://blog.vocabustudy.org/posts/quizlet-converter-concept/)


## Main Features

1. Going to https://vocabustudy.org/quizlet/12345678/view/ will bring up a temporary set that has the same terms as the Quizlet set. No login required for Quizlet or Vocabustudy!
2. Going to https://vocabustudy.org/quizlet/12345678/edit/ will bring up the set editor with the quizlet set prefilled. You can edit the set and save it as a Vocabustudy set from there
3. Going to https://quizlet.com/12345678/slug/vocabustudy/ will redirect to #1
4. Clicking the extension action redirects to #1


## Development

**Loading the extension**: Run `./scripts.sh dev firefox|chrome` to generate the dev build. Load it from the `build/firefox|chrome` directory.
The dev build is set up to use `http://localhost:5173` instead of `https://vocabustudy.org`.

**Packaging for release**: Run `./scripts.sh package` to generate the release ZIPs.
