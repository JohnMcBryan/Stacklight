package jnm219;
/** Basic App.java class used to get a handle of uploading onto AWS */
// Import the Spark package, so that we can make use of the "get" function to
// create an HTTP GET route
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.*;
import spark.Spark;

// Import Google's JSON library
import com.google.gson.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.io.*;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.security.Permission;
import java.sql.Array;
import java.util.Arrays;
import javax.servlet.*;

//Importing the ability to access the database from Postgres
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Map;
import java.util.Hashtable;
import java.util.Enumeration;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import javax.activation.MimetypesFileTypeMap;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.SecretKeyFactory;
import javax.servlet.MultipartConfigElement;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Part;
import java.math.BigInteger;
import java.security.spec.InvalidKeySpecException;
import java.io.IOException;
import java.util.Random;
import java.util.ArrayList;
import java.util.Map;
import java.util.Collections;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.Drive.Files;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import spark.utils.IOUtils;

import java.io.InputStreamReader;
import java.util.List;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;


public class App
{
    public static void main(String[] args) {
        // Get the port on which to listen for requests
        Spark.port(getIntFromEnv("PORT", 4567));

        String static_location_override = System.getenv("STATIC_LOCATION");
        if (static_location_override == null) {
            Spark.staticFileLocation("/web");
        } else {
            Spark.staticFiles.externalLocation(static_location_override);
        }

        final Gson gson = new Gson();
        Database db = Database.getDatabase(2);

        // Give the Database object a connection, fail if we cannot get one
        try {
            String dbUrl = System.getenv("JDBC_DATABASE_URL"); // Url for heroku database connection
            Connection conn = DriverManager.getConnection(dbUrl);

            if (conn == null) {
                System.err.println("Error: DriverManager.getConnection() returned a null object");
            }
            //db.mConnection = conn;
        } catch (SQLException e) {
            System.err.println("Error: DriverManager.getConnection() threw a SQLException");
            e.printStackTrace();
        }

        try {
            // Build a new authorized API client service.
            Drive service = GDrive.getDriveService();
            // Print the names and IDs for up to 10 files.
            FileList result = service.files().list()
                    .setMaxResults(10)
                    //.setFields("nextPageToken, files(id, name)")
                    .execute();
            List<File> files = result.getItems();
            if (files == null || files.size() == 0) {
                System.out.println("No files found.");
            } else {
                System.out.println("Files:");
                for (File file : files) {
                    System.out.printf("%s (%s)\n", file.getTitle(), file.getId());
                }
            }
        }catch(IOException e)
        {
            System.out.println(e);
        }


        // Set up a route for serving the main page
        Spark.get("/messages", (request, response) -> {
            // ensure status 200 OK, with a MIME type of JSON
            response.status(200);
            response.type("application/json");
            return gson.toJson(new StructuredResponse("ok", null, db.selectAllMessages()));
        });

        Spark.post("/messages",(request, response) -> {
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            response.status(200);
            response.type("application/json");
            //System.out.println(request.raw().getParameter("mName"));
            boolean newId = db.insertName(req.mName);
            if (!newId) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "" + newId, null));
            }
        });
        //image tag points to spark route and wraps the return value of get statement
        Spark.post("/messages/file", (request, response) -> {
            //System.out.println("Entering Messages");
            response.status(200);
            response.type("application/json");
            request.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement("/temp"));
            int suc = 0;
            String fileName = request.raw().getParameter("mFileName");
            String id = "Error";
            if(fileName == null)
            {
                System.out.println("File Name Null");
                fileName = "Error";
            }
            try (InputStream is = request.raw().getPart("mFile").getInputStream()) {
                // Use the input stream to create a file
                System.out.println("Input Stream Read");
                id = uploadFile(is, fileName);
                System.out.println("File Uploaded Successfully");
            } catch (Exception e) {
                System.out.println("Failure: " + e);
            }
            boolean newId = db.insertFile(fileName,id);
            if (!newId) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "", null));
            }
        });
        Spark.get("/messages/file", (request, response) -> {
            response.status(200);
            response.type("application/json");
            System.out.println("Spark Called");
            return gson.toJson(new StructuredResponse("ok", null, db.selectAllFiles()));

        });






        Spark.get("/", (req, res) -> {
            res.redirect("/index.html");
            return "";
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

    public static String uploadFile(InputStream in,String filename) throws IOException {
        Drive service;
        String id = "error";
        int size = 0;
        System.out.println("Drive Found. Filename: "+filename);
        String mimeFull = "image/png";
        try {
            service = GDrive.getDriveService();

            String[] parts = filename.split("\\.");
            String name = parts[0];
            String mime = parts[1];
            System.out.println(name+" "+mime);
            File body = new File();
            body.setTitle(name);
            body.setDescription("Description");
            if(mime.equals("png") || mime.equals("jpeg"))
            {
                mimeFull = "image/"+mime;
                body.setMimeType(mime);
            }
            else if (mime.equals("pdf"))
            {
                mimeFull = "application/pdf";
                body.setMimeType(mime);
            }

            File file= service.files().insert(body,
                    new InputStreamContent(
                            mimeFull,
                            new ByteArrayInputStream(
                                    IOUtils.toByteArray(in)))).setFields("id").execute();
            id = file.getId();

            System.out.println("INPUT ID: "+id);

        } catch (GoogleJsonResponseException e){
            System.out.println("Google Drive Connection Failure "+e);
            GoogleJsonError error = e.getDetails();
            System.out.print(error);
            return "Error";
        }
        FileList result = service.files().list()
                .execute();
        List<File> files = result.getItems();
        if (files == null || files.size() == 0) {
            System.out.println("No files found.");
        } else {
            System.out.println("Files:");
            for (File file : files) {
                System.out.printf("%s (%s)\n",file.getTitle(),file.getId());
            }
        }
        return id;
    }
    public static File downloadFile(String id) throws IOException {
        Drive service;
        File file = null;
        try {
            service = GDrive.getDriveService();
            file = service.files().get(id).execute();
            file.getMimeType();
        } catch (GoogleJsonResponseException e){
            System.out.println("Google Drive Connection Failure "+e);
            GoogleJsonError error = e.getDetails();
            System.out.print(error);
        }
        return file;
    }

}


