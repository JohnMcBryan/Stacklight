#assume in web foler

sh deploy.sh

cd ..
cd backend
mvn package; mvn heroku:deploy

cd ..
cd web
