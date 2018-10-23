package jnm219;

public class MessageRow {

    public final int mId;
    public int mProjectId;
    public String mContent;
    public String mOwner;

    MessageRow(int id, int projectId, String content, String owner) {
        mId = id;
        mProjectId = projectId;
        mContent = content;
        mOwner = owner;
    }

    public String toString() { return mId + " " + mProjectId + " " + mContent + " " +mOwner; }

}