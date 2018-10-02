# Stoplight
Collaboraters:

Jack McBryan johnmcbryan5@gmail.com
Nicole D'Annibale nid219@lehigh.edu
Mira Straathof mira@straathof.com
Bobby Gould rsg219@lehigh.edu

http://www.cse.lehigh.edu/~spear/cse216_tutorials/

Steps for Merging onto Origin/Master :
(Assuming you are on your branch)
1. Git pull
2. Rebase Current onto Selected (origin/master)
3. Checkout master branch
4. Merge Into Current (Select the branch you want to merge in)
5. Git push

How to Locally Deploy:

To locally deploy, go to the web folder and type the command:

sh ldeploy.sh

This will use the same databases that we are using with the Heroku server


How to Deploy to Heroku:

To deploy to heroku, you first must use this command in the web folder if 
you are making changes to the frontend:

sh deploy.sh

Then in the backend folder use:

mvn package; mvn heroku:deploy

Notes:

- When adding a new html page, make sure that you add the html in the deploy.sh and ldeploy.sh
- When going cloning for the first time, you might have problems