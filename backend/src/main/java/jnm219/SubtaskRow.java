package jnm219;

public class SubtaskRow {

    public final int mId;
    public int mTaskId;
    public String mName;
    public int mStatus;

    SubtaskRow(int id, int taskId, String name, int status) {
        mId = id;
        mTaskId = taskId;
        mName = name;
        mStatus = status;
    }

    public String toString() {
        return mId + " " + mTaskId+" "+ mName+" "+mStatus;
    }

}