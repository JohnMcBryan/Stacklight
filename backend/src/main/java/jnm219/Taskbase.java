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


public class Taskbase {
    /**
     * The connection to the database.  When there is no connection, it should
     * be null.  Otherwise, there is a valid open connection
     */
    private Connection mConnection;

    /**
     * A prepared statement for getting all messages
     */
    private PreparedStatement mSelectAllTasks;
    private PreparedStatement mSelectTasks;

    private PreparedStatement mAddTask;

    private PreparedStatement mSelectTask;
    private PreparedStatement mSelectCompletedTasks;

    private PreparedStatement mCompleteTask;
    private PreparedStatement mUncompleteTask;
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

    static Taskbase getTaskbase(int connectionType) {
        Taskbase tb = new Taskbase();

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
            tb.mConnection = conn;
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
            tb.mSelectAllTasks = tb.mConnection.prepareStatement("SELECT * FROM Tasks");
            tb.mAddTask = tb.mConnection.prepareStatement("INSERT INTO Tasks Values (default,?,?,?,?,?,?,default)");
            tb.mSelectTasks = tb.mConnection.prepareStatement("SELECT * FROM Tasks WHERE projectId = ? AND status = 0");
            tb.mSelectCompletedTasks = tb.mConnection.prepareStatement("SELECT * FROM Tasks WHERE projectId = ? AND status = 1");
            tb.mSelectTask = tb.mConnection.prepareStatement("SELECT * FROM Tasks WHERE id = ?");
            tb.mCompleteTask = tb.mConnection.prepareStatement("UPDATE Tasks SET status = 1 WHERE id = ?");
            tb.mUncompleteTask = tb.mConnection.prepareStatement("UPDATE Tasks SET status = 0 WHERE id = ?");


        } catch (SQLException e) {
            System.err.println("Error creating prepared statement");
            e.printStackTrace();
            tb.disconnect();
            return null;
        }
        return tb;
    }

    /**
     * Returning arraylist of tasks which displays all the tasks ever made
     */
    ArrayList<TaskRow> selectAllTasks() {
        ArrayList<TaskRow> res = new ArrayList<TaskRow>();
        try {
            ResultSet rs = mSelectAllTasks.executeQuery();
            System.out.println("IN SELECT ALL TASKS");
            while (rs.next()) {
                TaskRow taskrow = new TaskRow(rs.getInt("id"),rs.getInt("projectId"),rs.getString("taskname"),
                        rs.getString("description"),rs.getInt("priority"),rs.getString("assignee"),
                        rs.getString("assigner"));
                System.out.println(taskrow);
                res.add(taskrow);
            }
            rs.close();
            return res;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    ArrayList<TaskRow> selectTasks(int projectId) {
        ArrayList<TaskRow> res = new ArrayList<TaskRow>();
        try {
            mSelectTasks.setInt(1,projectId);
            ResultSet rs = mSelectTasks.executeQuery();
            while (rs.next()) {
                TaskRow taskrow = new TaskRow(rs.getInt("id"),rs.getInt("projectId"),rs.getString("taskname"),
                        rs.getString("description"),rs.getInt("priority"),rs.getString("assignee"),
                        rs.getString("assigner"));
                System.out.println(taskrow);
                res.add(taskrow);
            }
            rs.close();
            return res;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
    ArrayList<TaskRow> selectCompletedTasks(int projectId) {
        ArrayList<TaskRow> res = new ArrayList<TaskRow>();
        try {
            mSelectCompletedTasks.setInt(1,projectId);
            ResultSet rs = mSelectCompletedTasks.executeQuery();
            System.out.println("Selecting Completed Tasks.....");
            while (rs.next()) {
                TaskRow taskrow = new TaskRow(rs.getInt("id"),rs.getInt("projectId"),rs.getString("taskname"),
                        rs.getString("description"),rs.getInt("priority"),rs.getString("assignee"),
                        rs.getString("assigner"));
                System.out.println(taskrow);
                res.add(taskrow);
            }
            rs.close();
            return res;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
    TaskRow selectTask(int taskId) {
        try {
            mSelectTask.setInt(1,taskId);
            ResultSet rs = mSelectTask.executeQuery();
            System.out.println("Selecting Task: "+taskId);
            TaskRow taskrow = null;
            while (rs.next()) {
                 taskrow = new TaskRow(rs.getInt("id"),rs.getInt("projectId"),rs.getString("taskname"),
                        rs.getString("description"),rs.getInt("priority"),rs.getString("assignee"),
                        rs.getString("assigner"));
                System.out.println(taskrow);
            }
            rs.close();
            return taskrow;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
    //Method for adding a new task
    boolean addTask(int projectId,String taskname,String description,
                          int priority, String assignee, String assigner) {
        int rs=0;

        try {
            System.out.println(projectId + "Adding: " + taskname);
            mAddTask.setInt(1,projectId);
            mAddTask.setString(2,taskname);
            mAddTask.setString(3,description);
            mAddTask.setInt(4,priority);
            mAddTask.setString(5,assignee);
            mAddTask.setString(6,assigner);
            rs +=mAddTask.executeUpdate();
        } catch (SQLException e)
        {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    boolean completeTask(int taskId){
        try {
            mCompleteTask.setInt(1, taskId);
            mCompleteTask.executeUpdate();

            return true;
        } catch (SQLException e){
            e.printStackTrace();
            return false;
        }
    }

    boolean uncompleteTask(int taskId){
        try {
            mUncompleteTask.setInt(1, taskId);
            mUncompleteTask.executeUpdate();

            return true;
        } catch (SQLException e){
            e.printStackTrace();
            return false;
        }
    }


}