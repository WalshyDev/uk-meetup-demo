@echo off

IF %#% -eq 0 (
  echo "Usage: ./upload.bat <image>"
  exit 1
)

echo "Uploading %~1..."

SET MIME_TYPE=""

curl -X POST -H "Authorization: uk-london-meetup-2022-04-walshy-demo" -H "Content-Type: %MIME_TYPE%" --data-binary "@%~1" https://uk-meetup.walshy.dev/api/upload
