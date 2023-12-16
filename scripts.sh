#!/bin/bash

# Usage: ./scripts.sh dev firefox|chrome
# ./scripts.sh package

clean () { rm -rf build; }

zip_ext () {
  cd "build/$1"
  zip -qr "../quizlet-set-converter-$1.zip" *
  cd ../..
}

zip_all () {
  zip_ext "firefox"
  zip_ext "chrome"
}

build () {
  mkdir -p "build"
  rm -rf "build/$1"
  cp -r "src/$1" build
  cp -r "src/common" "build/$1"
  cp -r "src/_locales" "build/$1"
}

build_all () {
  build "firefox"
  build "chrome"
}

package () {
  clean
  build_all
  zip_all
}

replace_local () {
  # Replace vocabustudy.org with localhost:5173
  grep -rl "https://vocabustudy.org" "build/$1" | xargs sed -i 's/https:\/\/vocabustudy\.org/http:\/\/localhost:5173/g'
  if [ $1 = "firefox" ]
  then
    # If in firefox, the content-scripts thing for some reason needs to be localhost instead of localhost:5173
    sed -i 's/http:\/\/localhost:5173/http:\/\/localhost/g' "build/$1/manifest.json" # don't ask me why
  fi
}

dev () {
  build $1
  replace_local $1
}

# Check to make sure $1 is a valid function
if declare -f "$1" > /dev/null
then
  # Call function
  "$@"
else
  echo "'$1' is not a valid command" >&2
  exit 1
fi