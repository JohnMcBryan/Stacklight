# local deploy script for the web front-end

# This file is responsible for preprocessing all TypeScript files, making
# sure all dependencies are up-to-date, copying all necessary files into a
# local deploy directory, and starting a web server

export TARGET=./local
sh deploy.sh
node_modules/.bin/http-server $TARGET/web
