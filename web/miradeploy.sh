#assume in web folder

sh deploy.sh

if [[ $? == 0 ]]
then
    cd ..
    cd backend
    mvn package; mvn heroku:deploy

    cd ..
    cd web
fi
