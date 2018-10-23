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


public class Messagebase {
    /**
     * The connection to the database.  When there is no connection, it should
     * be null.  Otherwise, there is a valid open connection
     */
    private Connection mConnection;

    /**
     * A prepared statement for getting all messages
     */
    private PreparedStatement mSelectMessages;
    private PreparedStatement mAddMessage;

    private PreparedStatement mCheckIndex;
    private PreparedStatement mCheckMessages;

    /**
     * Give the Database object a connection, fail if we cannot get one
     * Must be logged into heroku on a local computer to be able to use mvn heroku:deploy
     */
    private static Connection getConnection() throws URISyntaxException, SQLException {

        String dbUrl = System.getenv("JDBC_DATABASE_URL"); // Url for heroku database connection
        Connection conn = DriverManager.getConnection(dbUrl);
        return DriverManager.getConnection(dbUrl);
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

    static Messagebase getMessagebase(int connectionType) {
        Messagebase mb = new Messagebase();

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
            mb.mConnection = conn;
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
            mb.mSelectMessages = mb.mConnection.prepareStatement("SELECT * FROM messages where projectId = ?");
            mb.mAddMessage = mb.mConnection.prepareStatement("INSERT INTO messages Values (default,?,?,?)");


        } catch (SQLException e) {
            System.err.println("Error creating prepared statement");
            e.printStackTrace();
            mb.disconnect();
            return null;
        }
        return mb;
    }

    /**
     * Returning arraylist of projects which displays all the messages ever made
     */
    ArrayList<MessageRow> selectMessages(int projectId) {
        ArrayList<MessageRow> res = new ArrayList<MessageRow>();
        try {
            mSelectMessages.setInt(1, projectId);
            ResultSet rs = mSelectMessages.executeQuery();
            //System.out.println("SubFiles Are Here");

            //System.out.println("IN SELECT ALL PROJECTS");
            while (rs.next()) {
                    MessageRow Messagerow = new MessageRow(rs.getInt("id"), rs.getInt("projectId"), rs.getString("content"), rs.getString("owner"));
                    res.add(Messagerow);

            }
            rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
        return res;
    }
    //Method for adding a new Message
    boolean addMessage(int projectId, String content, String owner) {
        int rs=0;

        try {
            System.out.println("Adding Message: " + content);
            mAddMessage.setInt(1,projectId);
            mAddMessage.setString(2,content);
            mAddMessage.setString(3,owner);
            rs +=mAddMessage.executeUpdate();
        } catch (SQLException e)
        {
            e.printStackTrace();
            return false;
        }
        return true;
    }


}