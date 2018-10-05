
package jnm219;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.net.URISyntaxException;
// Imports for time functionality
import java.security.Timestamp;
import java.sql.Time;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Calendar;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.TimeZone;

import java.util.ArrayList;

import jnm219.User;


public class Database {
    /**
     * The connection to the database.  When there is no connection, it should
     * be null.  Otherwise, there is a valid open connection
     */
    private Connection mConnection;

    /**
     * A prepared statement for getting all messages
     */
    private PreparedStatement mInsertUser;
    private PreparedStatement mSelectUser;
    private PreparedStatement mCheckUser;
    private PreparedStatement mInsertFile;
    private PreparedStatement mSelectAllFiles;
    private PreparedStatement mSelectTaskFiles;

    /**
     * Give the Database object a connection, fail if we cannot get one
     * Must be logged into heroku on a local computer to be able to use mvn heroku:deploy
     */
    private static Connection getConnection() throws URISyntaxException, SQLException {

        String dbUrl = System.getenv("JDBC_DATABASE_URL"); // Url for heroku database connection
        Connection conn = DriverManager.getConnection(dbUrl);
        return DriverManager.getConnection(dbUrl);
    }

    static Database getDatabase(int connectionType) {
        // Create an un-configured Database object
        Database db = new Database();

        // Give the Database object a connection, fail if we cannot get one
        try {
            Connection conn;
            if(connectionType == 1)
            {
                conn = getConnection();
            }
            else if(connectionType == 2)
            {
                conn = getConnection();
            }
            else
            {
                conn = getConnection();
            }
            if (conn == null) {
                System.err.println("Error: DriverManager.getConnection() returned a null object");
                return null;
            }
            db.mConnection = conn;
        } catch (SQLException e) {
            System.err.println("Error: DriverManager.getConnection() threw a SQLException");
            e.printStackTrace();
            return null;
        } catch (URISyntaxException e) {
            System.err.println("Error: DriverManager.getConnection() threw a URISyntaxException");
            e.printStackTrace();
            return null;
        }

        try{

            db.mInsertUser = db.mConnection.prepareStatement("INSERT INTO Users Values (default,?,?,?)");
            db.mSelectUser = db.mConnection.prepareStatement("SELECT firstname, lastname, email from users where userid = ?");
            db.mCheckUser = db.mConnection.prepareStatement("select COUNT(*) as check FROM Users WHERE email = ?");

            db.mSelectAllFiles = db.mConnection.prepareStatement("SELECT * FROM Files");
            db.mSelectTaskFiles = db.mConnection.prepareStatement("SELECT * FROM Files WHERE taskid = ?");
            db.mInsertFile = db.mConnection.prepareStatement("INSERT INTO Files Values (default,?,?,?)");

        } catch (SQLException e) {
            System.err.println("Error creating prepared statement");
            e.printStackTrace();
            db.disconnect();
            return null;
        }
        return db;
    }
    /**
     * Close the current connection to the database, if one exists.
     *
     * NB: The connection will always be null after this call, even if an
     *     error occurred during the closing operation.
     *
     * @return True if the connection was cleanly closed, false otherwise
     */
    boolean disconnect()
    {
        if (mConnection == null) {
            System.err.println("Unable to close connection: Connection was null");
            return false;
        }
        try {
            mConnection.close();
        } catch (SQLException e) {
            System.err.println("Error: Connection.close() threw a SQLException");
            e.printStackTrace();
            mConnection = null;
            return false;
        }
        mConnection = null;
        return true;
    }

    boolean insertFile(String fileName,String fileId,int taskID)
    {
        int rs=0;
        try {
            System.out.println("FileName: "+ fileName);
            mInsertFile.setString(1,fileName);
            mInsertFile.setString(2,fileId);
            mInsertFile.setInt(3,taskID);
            rs +=mInsertFile.executeUpdate();
        } catch (SQLException e)
        {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    ArrayList<FileRow> selectAllFiles() {
        ArrayList<FileRow> res = new ArrayList<FileRow>();
        try {
            ResultSet rs = mSelectAllFiles.executeQuery();
            while (rs.next()) {
                //System.err.println("NAMES: "+rs.getString("name"));
                res.add(new FileRow(rs.getInt("id"),rs.getString("fileName"),rs.getString("fileId")));
            }
            rs.close();
            return res;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
    ArrayList<FileRow> selectTaskFiles(int taskID) {

        ArrayList<FileRow> res = new ArrayList<FileRow>();
        try {
            mSelectTaskFiles.setInt(1,taskID);
            ResultSet rs = mSelectTaskFiles.executeQuery();
            while (rs.next()) {
                res.add(new FileRow(rs.getInt("id"),rs.getString("fileName"),rs.getString("fileId")));
            }
            rs.close();
            return res;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }



    public User selectUser(int id) {
        System.out.println("selectUser");
        try {
            mSelectUser.setInt(1, id);
            ResultSet rs = mSelectUser.executeQuery();
            rs.next();
            //System.err.println("NAMES: "+rs.getString("name"));
            User res = new User(rs.getString("firstname"), rs.getString("lastname"), rs.getString("email"));
            rs.close();
            return res;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    boolean checkUser(String email) {
        System.out.println("checkUser");
        try {
            mCheckUser.setString(1, email);
            ResultSet rs = mCheckUser.executeQuery();
            rs.next();
            int check = rs.getInt("check");
            System.out.println("Check is " + check);
            rs.close();
            if (check == 0)
            {
                return false;
            }
            else {
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    boolean insertUser(String firstName, String lastName, String email) {
        int rs = 0;
        try {
            System.out.println("New Name: "+ firstName);
            mInsertUser.setString(1, firstName);
            mInsertUser.setString(2, lastName);
            mInsertUser.setString(3, email);
            rs += mInsertUser.executeUpdate();
        } catch (SQLException e)
        {
            e.printStackTrace();
            return false;
        }
        return true;
    }

}