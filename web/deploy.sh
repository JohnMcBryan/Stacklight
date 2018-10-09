#!/usr/bin/env bash
# deploy script for the web front-end

# This file is responsible for preprocessing all TypeScript files, making sure
# all dependencies are up-to-date, and copying all necessary files into the
# web deploy directory.

# This is the resource folder where maven expects to find our files
TARGETFOLDER=../backend/src/main/resources

# This is the folder that we used with the Spark.staticFileLocation command
WEBFOLDERNAME=web

# step 1: make sure we have someplace to put everything.  We will delete the
#         old folder tree, and then make it from scratch
rm -rf $TARGETFOLDER
mkdir $TARGETFOLDER
mkdir $TARGETFOLDER/$WEBFOLDERNAME

# there are many more steps to be done.  For now, we will just copy an HTML file
cp index.html $TARGETFOLDER/$WEBFOLDERNAME
cp tasks.html $TARGETFOLDER/$WEBFOLDERNAME
cp tasksAddForm.html $TARGETFOLDER/$WEBFOLDERNAME
cp taskPage.html $TARGETFOLDER/$WEBFOLDERNAME
cp app.css $TARGETFOLDER/$WEBFOLDERNAME
cp style.css $TARGETFOLDER/$WEBFOLDERNAME
cp node_modules/jquery/dist/jquery.min.js $TARGETFOLDER/$WEBFOLDERNAME
cp allProjectsPage.html $TARGETFOLDER/$WEBFOLDERNAME
cp allProjectsPage.js $TARGETFOLDER/$WEBFOLDERNAME
cp googleSignIn.js $TARGETFOLDER/$WEBFOLDERNAME
cp Images/logo.png $TARGETIMAGEFOLDER/$WEBFOLDERNAME
cp Images/logoWhite.png $TARGETIMAGEFOLDER/$WEBFOLDERNAME
cp Images/uploadwhite.png $TARGETIMAGEFOLDER/$WEBFOLDERNAME
cp Images/add-list.png $TARGETIMAGEFOLDER/$WEBFOLDERNAME
cp Images/newproject.png $TARGETIMAGEFOLDER/$WEBFOLDERNAME
cp Images/project.png $TARGETIMAGEFOLDER/$WEBFOLDERNAME

#Put Client Secret Doc into Resources Folder
cp ../backend/StoplightCS.json ../backend/src/main/resources/StoplightCS.json

# step 4: compile TypeScript files
node_modules/.bin/tsc app.ts --strict --outFile $TARGETFOLDER/app.js
node_modules/.bin/tsc tasks.ts --strict --outFile $TARGETFOLDER/tasks.js
node_modules/.bin/tsc files.ts --strict --outFile $TARGETFOLDER/files.js


# step 4: compile TypeScript files
node_modules/typescript/bin/tsc app.ts --strict --outFile $TARGETFOLDER/$WEBFOLDERNAME/app.js
node_modules/typescript/bin/tsc tasks.ts --strict --outFile $TARGETFOLDER/$WEBFOLDERNAME/tasks.js
node_modules/typescript/bin/tsc task.ts --strict --outFile $TARGETFOLDER/$WEBFOLDERNAME/task.js
node_modules/typescript/bin/tsc files.ts --strict --outFile $TARGETFOLDER/$WEBFOLDERNAME/files.js
node_modules/typescript/bin/tsc projects.ts --strict --outFile $TARGETFOLDER/$WEBFOLDERNAME/projects.js
