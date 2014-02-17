ffmpeg -f s16le -ac 1 -ar 16000 -i - $2/file.flac > /dev/null 2>&1
wget -q -U "Mozilla/5.0" --post-file $2/file.flac --header "Content-Type: audio/x-flac; rate=16000" -O - "http://www.google.com/speech-api/v1/recognize?lang=$1&client=chromium"
touch $2/file.flac
rm -f $2/file.flac