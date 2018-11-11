#!/usr/bin/env bash
# deploy script for the web front-end

# This file is responsible for preprocessing all TypeScript files, making sure
# all dependencies are up-to-date, and copying all necessary files into the
# web deploy directory.

# This is the resource folder where maven expects to find our files
if [ -z "$TARGET" ]
then
    TARGET=../backend/src/main/resources
fi

# This is the folder that we used with the Spark.staticFileLocation command
WEB=$TARGET/web
IMAGE=Images
JS=js
VIEW=hbs        # templates
STYLE=css

# step 1: make sure we have someplace to put everything.  We will delete the
#         old folder tree, and then make it from scratch
rm -rf $TARGET
mkdir $TARGET $WEB $WEB/$IMAGE $WEB/$JS $WEB/$VIEW $WEB/$STYLE

# copy only known/needed files to the respective deployment directories.
# test files will remain local.

for html in index.html project.html taskDetail.html tasksAddForm.html taskEdit.html
do
    cp $html $WEB
done
for css in style.css bootstrap.css
do
    cp $STYLE/$css $WEB/$STYLE
done
for image in logo.png logoWhite.png uploadwhite.png add-list.png newproject.png project.png
do
    cp $IMAGE/$image $WEB/$IMAGE
done
for script in googleSignIn.js allProjectsPage.js handlebars-v4.0.12.js
do
    cp $JS/$script $WEB/$JS
done
cp node_modules/jquery/dist/jquery.min.js $WEB/$JS      # special case because jquery is not in js subdirectory
for view in allProjects.js
do
    cp $VIEW/$view $WEB/$VIEW
done

# compile TypeScript files
retVal=0
for ts in app index project taskDetail taskFiles messages
do
    node_modules/typescript/bin/tsc ts/${ts}.ts --strict --outFile $WEB/$JS/${ts}.js
    retVal=$(($retVal + $?))
done

cp ../backend/StoplightCS.json ../backend/src/main/resources/StoplightCS.json
#cp StacklightLocalhostServiceKey.json ../backend/src/main/resources/StoplightCS.json

exit $retVal
