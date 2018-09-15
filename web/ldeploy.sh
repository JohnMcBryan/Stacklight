# local deploy script for the web front-end

# This file is responsible for preprocessing all TypeScript files, making
# sure all dependencies are up-to-date, copying all necessary files into a
# local deploy directory, and starting a web server

# This is the resource folder where maven expects to find our files
TARGETFOLDER=./local

# step 1: update our npm dependencies
npm update

# step 2: make sure we have someplace to put everything.  We will delete the
#         old folder, and then make it from scratch
rm -rf $TARGETFOLDER
mkdir $TARGETFOLDER

# step 3: copy static html, css, and JavaScript files
cp index.html $TARGETFOLDER
cp app.css $TARGETFOLDER
cp node_modules/jquery/dist/jquery.min.js $TARGETFOLDER

# step 4: compile TypeScript files
node_modules/.bin/tsc app.ts --strict --outFile $TARGETFOLDER/app.js

# step 5: compile tests and copy tests to the local deploy folder
node_modules/.bin/tsc apptest.ts --strict --outFile $TARGETFOLDER/apptest.js
cp spec_runner.html $TARGETFOLDER
cp node_modules/jasmine-core/lib/jasmine-core/jasmine.css $TARGETFOLDER
cp node_modules/jasmine-core/lib/jasmine-core/jasmine.js $TARGETFOLDER
cp node_modules/jasmine-core/lib/jasmine-core/boot.js $TARGETFOLDER
cp node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js $TARGETFOLDER

# step 6: launch the server.  Be sure to disable caching
# (Note: we don't currently use -s for silent operation)
node_modules/.bin/http-server $TARGETFOLDER -c-1