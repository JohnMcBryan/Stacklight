package jnm219;
/** Basic App.java class used to get a handle of uploading onto AWS */
import spark.Spark;

// Import Google's JSON library
import com.google.gson.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class App
{
    public static void main(String[] args) {
        // Get the port on which to listen for requests
        Spark.port(getIntFromEnv("PORT", 4567));

        // Set up the location for serving static files.  If the STATIC_LOCATION
        // environment variable is set, we will serve from it.  Otherwise, serve
        // from "/web"
        String static_location_override = System.getenv("STATIC_LOCATION");
        if (static_location_override == null) {
            Spark.staticFileLocation("/web");
        } else {
            Spark.staticFiles.externalLocation(static_location_override);
        }

        final Gson gson = new Gson();
        final DataStore dataStore = new DataStore();
        //String db_url = env.get("DATABASE_URL");

        // Give the Database object a connection, fail if we cannot get one
        try {
            Class.forName("org.postgresql.Driver");
            //URI dbUri = new URI(db_url);
            //String username = dbUri.getUserInfo().split(":")[0];
            String user = "lrowbdmdlqbujk";
            //String password = dbUri.getUserInfo().split(":")[1];
            String password = "71032f1501535b6bb36268789eefa18f2e6b9e31acb637363b1e176d58fb1acf";
            //String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();
            String dbUrl = "postgres://lrowbdmdlqbujk:71032f1501535b6bb36268789eefa18f2e6b9e31acb637363b1e176d58fb1acf@ec2-23-21-217-27.compute-1.amazonaws.com:5432/d5um503ki5n8qv";
            Connection conn = DriverManager.getConnection(dbUrl, user, password);
            if (conn == null) {
                System.err.println("Error: DriverManager.getConnection() returned a null object");
            }
            //db.mConnection = conn;
        } catch (SQLException e) {
            System.err.println("Error: DriverManager.getConnection() threw a SQLException");
            e.printStackTrace();
        } catch (ClassNotFoundException cnfe) {
            System.out.println("Unable to find postgresql driver");
        }


        // Set up a route for serving the main page
        Spark.get("/messages", (request, response) -> {
            // ensure status 200 OK, with a MIME type of JSON
            response.status(200);
            response.type("application/json");
            return gson.toJson(new StructuredResponse("ok", null, dataStore.readAll()));
        });

        Spark.get("/", (req, res) -> {
            res.redirect("/index.html");
            return "";
        });
        // PUT route for updating a row in the DataStore.  This is almost
        // exactly the same as POST
        Spark.put("/messages/:id", (request, response) -> {
            // If we can't get an ID or can't parse the JSON, Spark will send
            // a status 500
            int idx = Integer.parseInt(request.params("id"));
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            // ensure status 200 OK, with a MIME type of JSON
            response.status(200);
            response.type("application/json");
            DataRow result = dataStore.updateOne(idx, req.mName);
            if (result == null) {
                return gson.toJson(new StructuredResponse("error", "unable to update row " + idx, null));
            } else {
                return gson.toJson(new StructuredResponse("ok", null, result));
            }
        });

// DELETE route for removing a row from the DataStore
        Spark.delete("/messages/:id", (request, response) -> {
            // If we can't get an ID, Spark will send a status 500
            int idx = Integer.parseInt(request.params("id"));
            // ensure status 200 OK, with a MIME type of JSON
            response.status(200);
            response.type("application/json");
            // NB: we won't concern ourselves too much with the quality of the
            //     message sent on a successful delete
            boolean result = dataStore.deleteOne(idx);
            if (!result) {
                return gson.toJson(new StructuredResponse("error", "unable to delete row " + idx, null));
            } else {
                return gson.toJson(new StructuredResponse("ok", null, null));
            }
        });

        Spark.get("/hello", (request, response) -> {
            return "Hello World!";
        });
    }
    /**
     * Get an integer environment varible if it exists, and otherwise return the
     * default value.
     *
     * @envar      The name of the environment variable to get.
     * @defaultVal The integer value to use as the default if envar isn't found
     *
     * @returns The best answer we could come up with for a value for envar
     */
    static int getIntFromEnv(String envar, int defaultVal) {
        ProcessBuilder processBuilder = new ProcessBuilder();
        if (processBuilder.environment().get(envar) != null) {
            return Integer.parseInt(processBuilder.environment().get(envar));
        }
        return defaultVal;
    }

}


