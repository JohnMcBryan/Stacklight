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
import java.util.Date;
import java.text.SimpleDateFormat;

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



public class App {
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
        } catch (IOException e) {
            System.out.println(e);
        }
        //Route for uploading a file
        Spark.post("/file/sub/:pid", (request, response) -> {
            response.status(200);
            response.type("application/json");
            request.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement("/temp"));
            int suc = 0;
            String pidString = request.raw().getParameter("mPid");
            int pid = Integer.parseInt(pidString);
            String fileName = request.raw().getParameter("mFileName");
            String id = "Error";
            FileRet file = null;

            if (fileName == null) {
                System.out.println("File Name Null");
                fileName = "Error";
            }
            try (InputStream is = request.raw().getPart("mFile").getInputStream()) {
                // Use the input stream to create a file
                file = uploadFile(is, fileName);
                id = file.id;
                System.out.println("File Uploaded Successfully");
            } catch (Exception e) {
                System.out.println("Failure: " + e);
            }
            String timeStamp = new SimpleDateFormat("MM.dd.yyyy.HH.mm").format(new Date());
            boolean newId = db.insertSubFile(fileName, id,pid,timeStamp);

            if (!newId) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "", null));
            }
        });

        //Route For getting one parents sub files
        Spark.get("/file/:pid", (request, response) -> {

            response.status(200);
            response.type("application/json");
            String id = request.params("pid");
            int pid = Integer.parseInt(id);
            return gson.toJson(new StructuredResponse("ok", null, db.selectSubFiles(pid)));

        });

        //Route for uploading a file
        Spark.post("/file", (request, response) -> {
            response.status(200);
            response.type("application/json");
            request.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement("/temp"));
            int suc = 0;
            String fileName = request.raw().getParameter("mFileName");
            String id = "Error";
            FileRet file = null;

            if (fileName == null) {
                System.out.println("File Name Null");
                fileName = "Error";
            }
            try (InputStream is = request.raw().getPart("mFile").getInputStream()) {
                // Use the input stream to create a file
                file = uploadFile(is, fileName);
                id = file.id;
                System.out.println("File Uploaded Successfully");
            } catch (Exception e) {
                System.out.println("Failure: " + e);
            }
            boolean newId = db.insertFile(fileName, id);
            if (!newId) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "", null));
            }
        });

        //Route for downloading a google drive file, given its unique id
        Spark.get("/download/:id", (request, response) -> {
            //SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            String id = request.params("id");
            response.status(200);
            response.type("image/png");
            Drive service;
            try {
                service = GDrive.getDriveService();
                OutputStream outputStream = new ByteArrayOutputStream();
                String mimeType = service.files().get(id).execute().getMimeType();
                System.out.println("Mime Type: " + mimeType);
                response.type(mimeType);
                service.files().get(id)
                        .executeMediaAndDownloadTo(outputStream);
                ByteArrayOutputStream bos = (ByteArrayOutputStream) outputStream;
                response.raw().getOutputStream().write(bos.toByteArray());
                response.raw().getOutputStream().flush();
                response.raw().getOutputStream().close();
            } catch (GoogleJsonResponseException e) {
                System.out.println("Google Drive Connection Failure " + e);
                GoogleJsonError error = e.getDetails();
                System.out.print(error);
            }
            return response.raw();
        });

        //Route for getting all of the file objects
        Spark.get("/file", (request, response) -> {
            response.status(200);
            response.type("application/json");
            return gson.toJson(new StructuredResponse("ok", null, db.selectAllFiles()));

        });

        //Select All Sub Files
        Spark.get("/file/sub", (request, response) -> {
            response.status(200);
            response.type("application/json");
            System.out.println("Spark Called");
            return gson.toJson(new StructuredResponse("ok", null, db.selectAllSubFiles()));
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
     * @envar The name of the environment variable to get.
     * @defaultVal The integer value to use as the default if envar isn't found
     * @returns The best answer we could come up with for a value for envar
     */
    static int getIntFromEnv(String envar, int defaultVal) {
        ProcessBuilder processBuilder = new ProcessBuilder();
        if (processBuilder.environment().get(envar) != null) {
            return Integer.parseInt(processBuilder.environment().get(envar));
        }
        return defaultVal;
    }

    //Code for Uploading a file to our google drive
    //This first looks at the file name to figure out the MiMe type, then converts the contents to a File,
    //Next it uploads the file to Google Drive
    //Finally, it returns the name of the file and the unique file id
    public static FileRet uploadFile(InputStream in, String fileName) throws IOException {
        Drive service;
        String id = "error";
        int size = 0;
        String mimeFull = "image/png";
        FileRet ret = new FileRet(id, fileName);
        try {
            service = GDrive.getDriveService();

            String[] parts = fileName.split("\\.");
            String name = parts[0];
            String mime = parts[1];
            System.out.println(name + " " + mime);
            File body = new File();
            body.setTitle(name);
            body.setDescription("Description");
            if (mime.equals("png") || mime.equals("jpeg")) {
                mimeFull = "image/" + mime;
            }
            else if(mime.equals("txt")){
                mimeFull = "text/plain";
            }
            else if (mime.equals("pdf")) {
                mimeFull = "application/pdf";
            }
            body.setMimeType(mime);

            File file = service.files().insert(body,
                    new InputStreamContent(
                            mimeFull,
                            new ByteArrayInputStream(
                                    IOUtils.toByteArray(in)))).setFields("id").execute();
            id = file.getId();
            fileName = file.getTitle();

            System.out.println("INPUT ID: " + id + "FileName: " + fileName);

        } catch (GoogleJsonResponseException e) {
            System.out.println("Google Drive Connection Failure " + e);
            GoogleJsonError error = e.getDetails();
            System.out.print(error);
            return ret;
        }
        FileList result = service.files().list()
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
        ret.fileName = fileName;
        ret.id = id;

        return ret;
    }

}



