package jnm219;


/**
 * Holds necessary info for a file
 */
public class SubFileRow {
    /**
     * The unique identifier associated with this element.  It's final, because
     * we never want to change it.
     */
    public final int mId;

    /**
     * What the name of the file is
     */
    public String mfileName;
    //What the Unique file Id is to look for inside of the google drive
    public String mfileId;

    public final int mpid;

    public String mTime;

    /**
     * Create a new DataRow with the provided id and title/content, and a
     * creation date based on the system clock at the time the constructor was
     * called
     *
     * @param id The id to associate with this row.  Assumed to be unique
     *           throughout the whole program.
     *
     * @param title The title string for this row of data
     *
     * @param content The content string for this row of data
     */
    SubFileRow(int id, String fileName, String fileId, int pid, String time) {
        mId = id;
        mfileName = fileName;
        mfileId = fileId;
        mpid = pid;
        mTime = time;
    }

}