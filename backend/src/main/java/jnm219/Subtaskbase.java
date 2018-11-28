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


public class Subtaskbase {
    /**
     * The connection to the database.  When there is no connection, it should
     * be null.  Otherwise, there is a valid open connection
     */
    private Connection mConnection;

    /**
     * A prepared statement for getting all messages
     */
    private PreparedStatement mSelectSubTasks;

    private PreparedStatement mAddSubtask;

    private PreparedStatement mCompleteSubtask;
    /**
     * Give the Database object a connection, fail if we cannot get one
     * Must be logged into heroku on a local computer to be able to use mvn heroku:deploy
     */
    private static Connection getConnection() throws URISyntaxException, SQLException {

        String dbUrl = System.getenv("JDBC_DATABASE_URL"); // Url for heroku database connection
        Connection conn = DriverManager.getConnection(dbUrl);
        return DriverManager.getConnection(dbUrl);
    }

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

    static Subtaskbase getSubtaskbase(int connectionType) {
        Subtaskbase stb = new Subtaskbase();

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
            stb.mConnection = conn;
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
            stb.mSelectSubTasks = stb.mConnection.prepareStatement("SELECT * FROM Subtasks WHERE taskId = ?");
            stb.mAddSubtask = stb.mConnection.prepareStatement("INSERT INTO Subtasks VALUES(default,?,?,?)");
            stb.mCompleteSubtask = stb.mConnection.prepareStatement("UPDATE Subtasks SET status = 1 WHERE id = ?");

        } catch (SQLException e) {
            System.err.println("Error creating prepared statement");
            e.printStackTrace();
            stb.disconnect();
            return null;
        }
        return stb;
    }


    ArrayList<SubtaskRow> selectSubtasks(int taskId) {
        ArrayList<SubtaskRow> res = new ArrayList<SubtaskRow>();
        try {
            mSelectSubTasks.setInt(1,taskId);
            ResultSet rs = mSelectSubTasks.executeQuery();
            System.out.println("Selecting All Subtasks for task "+taskId);
            while (rs.next()) {
                SubtaskRow subtaskrow = new SubtaskRow(rs.getInt("id"),rs.getInt("taskId"),rs.getString("name"),
                        rs.getInt("status"));
                res.add(subtaskrow);
            }
            rs.close();
            return res;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    //Method for adding a new task
    boolean addSubtask(int taskId,String name,int status) {
        int rs=0;

        try {
            mAddSubtask.setInt(1,taskId);
            mAddSubtask.setString(2,name);
            mAddSubtask.setInt(3,status);
            rs +=mAddSubtask.executeUpdate();
        } catch (SQLException e)
        {
            e.printStackTrace();
            return false;
        }
        return true;
    }
    //Status 0 = Uncomplete
    //Status 1 = Complete
    boolean completeSubtask(int id){
        try{
            mCompleteSubtask.setInt(1,id);
            mCompleteSubtask.executeUpdate();
        }catch (SQLException e)
        {
            e.printStackTrace();
            return false;
        }
        return true;
    }

}