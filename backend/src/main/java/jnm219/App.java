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

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

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
import jnm219.InsertUser;



public class App {

    private static final HttpTransport transport = new NetHttpTransport();
    private static final JsonFactory jsonFactory = new JacksonFactory();

    public static GoogleIdToken validateGoogleToken(final String idTokenString) {
        System.out.println("validating: "+idTokenString);
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory).setAudience(Collections.singletonList("1080316803619-flf753te3n99rv3mh90movqrs3eujk3v.apps.googleusercontent.com")).build();
        // Our CLIENT_ID: 1080316803619-flf753te3n99rv3mh90movqrs3eujk3v.apps.googleusercontent.com
        GoogleIdToken googleIdToken = null;
        try{
            googleIdToken = verifier.verify(idTokenString);
        } catch(GeneralSecurityException | IOException e){
            System.out.println("Exception: "+e);
        }
        if (googleIdToken != null) {
            return googleIdToken;
        } else {
            System.out.println("Invalid ID token.");
            return null;
        }
    }

    public static void main(String[] args) {
        // Get the port on which to listen for requests
        Spark.port(getIntFromEnv("PORT", 4567));

        String static_location_override = System.getenv("STATIC_LOCATION");
        if (static_location_override == null) {
            Spark.staticFileLocation("/web");
        } else {
            Spark.staticFiles.externalLocation(static_location_override);
        }


        final String acceptCrossOriginRequestsFrom = "*";
        final String acceptedCrossOriginRoutes = "GET,PUT,POST,DELETE,OPTIONS";
        final String supportedRequestHeaders = "Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin";
        enableCORS(acceptCrossOriginRequestsFrom, acceptedCrossOriginRoutes, supportedRequestHeaders);

        final Gson gson = new Gson();
        Database db = Database.getDatabase(2);
        Taskbase tb = Taskbase.getTaskbase(2);
        Projectbase pb = Projectbase.getProjectbase(2);
        Subtaskbase stb = Subtaskbase.getSubtaskbase(2);
        Messagebase mb = Messagebase.getMessagebase(2);

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

        //Route For getting one parents sub files
        Spark.get("/file/:taskID", (request, response) -> {

            response.status(200);
            response.type("application/json");
            int taskID = Integer.parseInt(request.params("taskID"));
            return gson.toJson(new StructuredResponse("ok", null, db.selectTaskFiles(taskID)));

        });
        Spark.post("/file/star", (request, response) -> {
            response.status(200);
            response.type("application/json");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            int fileID = req.mFileId;
            System.out.println("App File: "+fileID);
            return gson.toJson(new StructuredResponse("ok", null, db.starFile(fileID)));

        });

        //Route for uploading a file
        Spark.post("/file", (request, response) -> {
            response.status(200);
            response.type("application/json");
            request.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement("/temp"));
            int suc = 0;
            String fileName = request.raw().getParameter("mFileName");
            int taskID = Integer.parseInt(request.raw().getParameter("mTaskID"));
            String id = "Error";
            FileRet file = null;
            System.out.println("File: "+fileName);
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
            boolean newId = db.insertFile(fileName,id,taskID);
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

        Spark.get("/", (req, res) -> {
            res.redirect("/index.html");  //index.html Mira
            return "";
        });

        Spark.get("/tasks",(req,res) -> {
            res.redirect("/project.html");
           return "";
        });

        Spark.get("/tasks/addForm",(req,res) -> {
            res.redirect("/tasksAddForm.html");
            return "";
        });

        Spark.get("/tasks/all",(req,res) -> {
            res.status(200);
            res.type("application/json");
            System.out.println("Spark Called");
            return gson.toJson(new StructuredTask("ok", null, tb.selectAllTasks()));
        });

        Spark.get("/tasks/:projectID",(req,res) -> {
            res.status(200);
            res.type("application/json");
            int projectID = Integer.parseInt(req.params("projectID"));
            System.out.println("Project ID: "+projectID);
            return gson.toJson(new StructuredTask("ok", null, tb.selectTasks(projectID)));
        });

        Spark.get("/completedTasks/:projectID",(req,res) -> {
            res.status(200);
            res.type("application/json");
            int projectID = Integer.parseInt(req.params("projectID"));
            System.out.println("Completed Tasks for Project: "+projectID);
            return gson.toJson(new StructuredTask("ok", null, tb.selectCompletedTasks(projectID)));
        });

        Spark.get("/backlog/:projectID",(req,res) -> {
            res.status(200);
            res.type("application/json");
            int projectID = Integer.parseInt(req.params("projectID"));
            System.out.println("Backlog Tasks for: "+projectID);
            return gson.toJson(new StructuredTask("ok", null, tb.selectBacklogTasks(projectID)));
        });

        Spark.post("/tasks/complete",(request,res) -> {
            System.out.println("Completeing a Task");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");
            int taskId = req.mTaskId;
            System.out.println("Complete Task: "+taskId);
            boolean complete = tb.completeTask(taskId);
            return gson.toJson(new StructuredResponse("ok", complete + " "+ taskId, null));
        });

        Spark.post("/tasks/uncomplete",(request,res) -> {
            System.out.println("Uncompleteing a Task");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");
            int taskId = req.mTaskId;
            System.out.println("Uncomplete Task: "+taskId);
            boolean complete = tb.uncompleteTask(taskId);
            return gson.toJson(new StructuredResponse("ok", complete + " "+ taskId, null));
        });

        Spark.post("/tasks/backlog",(request,res) -> {
            System.out.println("Backlogging a Task");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");
            int taskId = req.mTaskId;
            System.out.println("Backlog Task: "+taskId);
            boolean complete = tb.backlogTask(taskId);
            return gson.toJson(new StructuredResponse("ok", complete + " "+ taskId, null));
        });

        Spark.get("/task/:taskID",(req,res) -> {
            res.status(200);
            res.type("application/json");
            int taskID = Integer.parseInt(req.params("taskID"));
            System.out.println("Task ID: "+taskID);
            return gson.toJson(new StructuredTask("ok", null, tb.selectTask(taskID)));
        });
        Spark.get("/subtasks/:taskID",(req,res) -> {
            res.status(200);
            res.type("application/json");
            int taskID = Integer.parseInt(req.params("taskID"));
            System.out.println("Task ID: "+taskID);
            return gson.toJson(new StructuredSubtask("ok", null, stb.selectSubtasks(taskID)));
        });

        Spark.post("/subtasks", (request, res) -> {
            System.out.println("Adding a subtask....");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");

            int taskId = req.mTaskId;
            String name = req.mName;
            int status = req.mStatus;

            boolean newSubTask = stb.addSubtask(taskId,name,status);
            if (!newSubTask) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "" + newSubTask, null));
            }
        });


        Spark.get("/projects/all/:email",(req,res) -> {
            res.status(200);
            res.type("application/json");
            System.out.println("Spark Called");
            return gson.toJson(new StructuredProject("ok", "", pb.selectAllProjects(req.params("email"))));
        });

        Spark.post("/tasks", (request, res) -> {
            System.out.println("Adding a task....");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");

            int projectId = Integer.parseInt( req.mProjectId );
            String taskName = req.mTaskname;
            String description = req.mDescription;
            int priority = Integer.parseInt( req.mPriority );
            String assignee = req.mAssignee;
            String assigner = req.mAssigner;

            boolean newTask = tb.addTask(projectId,taskName,description,
                    priority,assignee,assigner);
            if (!newTask) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "" + newTask, null));
            }
        });

        Spark.post("/tasks/edit", (request, res) -> {
            System.out.println("Editing a task....");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");
            int id = req.mId;
            String taskName = req.mTaskname;
            String description = req.mDescription;
            int priority = Integer.parseInt( req.mPriority );
            String assignee = req.mAssignee;
            String assigner = req.mAssigner;
            System.out.println("ID: "+id+" Task: "+taskName);

            boolean newTask = tb.editTask(id,taskName,description,
                    priority,assignee,assigner);
            if (!newTask) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "" + newTask, null));
            }
        });

        Spark.post("/projects", (request, res) -> {
            System.out.println("Adding a project....");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");

            String name = req.mName;
            String description = req.mDescription;
            String owner = req.mOwner;
            String organization = req.mOrganization;

            boolean newProject = pb.addProject(name,description, owner,organization);
            if (!newProject) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {

                return gson.toJson(new StructuredResponse("ok", "" + newProject, pb.checkIndex(name)));
            }
        });

        Spark.post("/projects/users", (request, res) -> {
            System.out.println("Adding users");
            AddUserToProject[] req = gson.fromJson(request.body(), AddUserToProject[].class);
            res.status(200);
            res.type("application/json");

            String email;
            int id;
            for(int i = 0; i < req.length; i++) {
                email = req[i].mEmail;
                id = req[i].mId;
                boolean newUser = pb.addUser(email, id);
                if (!(newUser)) {
                    return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
                }
            }
            return gson.toJson(new StructuredResponse("ok", "", null));
        });

        Spark.post("/projects/user", (request, res) -> {
            System.out.println("Adding user");
            AddUserToProject req = gson.fromJson(request.body(), AddUserToProject.class);
            res.status(200);
            res.type("application/json");

            String email = req.mEmail;
            int id = req.mId;
            boolean newUser = pb.addUser(email, id);
                if (!(newUser)) {
                    return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
                }
            return gson.toJson(new StructuredResponse("ok", "", null));
        });

        Spark.get("/hello", (request, response) -> {
            return "Hello World!";
        });

        Spark.post("/tokensignin/:token", (request, response) -> {
            String token = request.params("token");
            System.out.println(token);
            GoogleIdToken ret = validateGoogleToken(token);

            Payload payload = ret.getPayload();
            String name = (String) payload.get("name");
            System.out.println("name = " + name);
            return gson.toJson(new StructuredResponse("ok", null, db.selectUser(1)));
        });

        Spark.post("/users", (request, response) -> {
            response.status(200);
            response.type("application/json");
            System.out.println(request.body().toString());
            InsertUser incoming = gson.fromJson(request.body(), InsertUser.class);

            boolean existingUser = db.checkUser(incoming.mEmail);

            if (!(existingUser)) {
                System.out.println(incoming.mFirstName);
                boolean newId = db.insertUser(incoming.mFirstName, incoming.mLastName, incoming.mEmail);
                if (!(newId)) {
                    System.out.println("ERROR");
                    return gson.toJson(new StructuredResponse("error", "error", null));
                } else {
                    System.out.println("OK");
                    return gson.toJson(new StructuredResponse("ok", "", null));
                }
            }
            else
            {
                System.out.println("User exists");
                return gson.toJson(new StructuredResponse("ok", "", null));
            }
        });

        Spark.get("/users/:id", (request, response) -> {
            response.status(200);
            response.type("application/json");
            int id = Integer.parseInt(request.params("id"));
            return gson.toJson(new StructuredResponse("ok", null, db.selectUser(id)));
        });

        Spark.get("/usersEmail/:email", (request, response) -> {
            response.status(200);
            response.type("application/json");
            String email = request.params("email");
            User u = db.selectUserByEmail(email);
            return gson.toJson(u);
        });


        Spark.get("/messages/:projectID",(req,res) -> {
            res.status(200);
            res.type("application/json");
            int projectID = Integer.parseInt(req.params("projectID"));
            System.out.println("Project ID: "+projectID);
            return gson.toJson(new StructuredMessage("ok", null, mb.selectMessages(projectID)));
        });

        Spark.post("/messages", (request, res) -> {
            System.out.println("Adding a message....");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");

            int projectId = Integer.parseInt( req.mProjectId );
            String content = req.mContent;
            String owner = req.mOwner;

            boolean newMessage = mb.addMessage(projectId,content,owner);
            if (!newMessage) {
                return gson.toJson(new StructuredResponse("error", "error performing insertion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "" + newMessage, null));
            }
        });

        Spark.delete("/messages", (request, res) -> {
            System.out.println("Deleting a message....");
            SimpleRequest req = gson.fromJson(request.body(), SimpleRequest.class);
            res.status(200);
            res.type("application/json");

            int projectId = Integer.parseInt( req.mProjectId );

            boolean deleteMessage = mb.deleteMessage(projectId);
            if (!deleteMessage) {
                return gson.toJson(new StructuredResponse("error", "error performing deletion", null));
            } else {
                return gson.toJson(new StructuredResponse("ok", "" + deleteMessage, null));
            }
        });

    }

    /**
     * Set up CORS headers for the OPTIONS verb, and for every response that the
     * server sends.  This only needs to be called once.
     *
     * @param origin The server that is allowed to send requests to this server
     * @param methods The allowed HTTP verbs from the above origin
     * @param headers The headers that can be sent with a request from the above
     *                origin
     */
    private static void enableCORS(String origin, String methods, String headers) {
        // Create an OPTIONS route that reports the allowed CORS headers and methods
        Spark.options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }
            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }
            return "OK";
        });

        // 'before' is a decorator, which will run before any
        // get/post/put/delete.  In our case, it will put three extra CORS
        // headers into the response
        Spark.before((request, response) -> {
            response.header("Access-Control-Allow-Origin", origin);
            response.header("Access-Control-Request-Method", methods);
            response.header("Access-Control-Allow-Headers", headers);
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
            System.out.println("Uploading File....");
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



