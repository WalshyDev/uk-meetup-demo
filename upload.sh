#!/bin/bash

if [ $# -eq 0 ]; then
  echo 'Usage: ./upload.sh <image>'
  exit 1
fi

echo "Uploading $1..."

MIME_TYPE=$(file --mime-type -b "$1")

curl -X POST \
    -H 'Authorization: uk-london-meetup-2022-04-walshy-demo' \
    -H "Content-Type: $MIME_TYPE" \
    --data-binary "@$1" \
    https://uk-meetup.walshy.dev/api/upload
