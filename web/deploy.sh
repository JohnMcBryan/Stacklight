#!/usr/bin/env bash
# deploy script for the web front-end
# This file is responsible for preprocessing all TypeScript files, making sure
# all dependencies are up-to-date, and copying all necessary files into the
# web deploy directory.

if [[ "$TARGET" == "" ]]
then
    # This is the resource folder where maven expects to find our files
    # assume current directory is a sibling of backend, e.g. web/
    TARGET=../backend/src/main/resources
    echo "Remote deploy"
else
    echo "Local deploy"
fi

# This is the folder that we used with the Spark.staticFileLocation command
WEB=$TARGET/web
IMAGES=$WEB/Images
JS=$WEB
STYLE=$WEB

# step 1: make sure we have someplace to put everything.  We will delete the
#         old folder tree, and then make it from scratch
rm -rf $TARGET/*
mkdir $WEB $IMAGES $JS

# there are many more steps to be done.  For now, we will just copy an HTML file
cp index.html tasks.html taskPage.html tasksAddForm.html projectsAddForm.html allProjectsPage.html $WEB
cp allProjectsPage.js $JS
cp style.css $STYLE

# copy the image files
cp Images/* $IMAGES

# step 2: update our npm dependencies
npm update

# step 3: copy javascript files
cp node_modules/jquery/dist/jquery.min.js $JS

# step 4: compile TypeScript files
node_modules/typescript/bin/tsc app.ts --strict --outFile $JS/app.js
node_modules/typescript/bin/tsc tasks.ts --strict --outFile $JS/tasks.js
node_modules/typescript/bin/tsc task.ts --strict --outFile $JS/task.js
node_modules/typescript/bin/tsc projects.ts --strict --outFile $JS/projects.js
