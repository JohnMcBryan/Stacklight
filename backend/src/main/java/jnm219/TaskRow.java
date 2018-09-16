package jnm219;

public class TaskRow {

    public final int mId;
    public int mProjectId;
    public String mName;
    public String mDescription;
    public int mPriority;
    public String mAssignee;
    public String mAssigner;

    TaskRow(int id, int projectId, String name, String description, int priority, String assignee, String assigner) {
        mId = id;
        mProjectId = projectId;
        mName = name;
        mDescription = description;
        mPriority = priority;
        mAssignee = assignee;
        mAssigner = assigner;
    }

    public String toString() {
        return mId + " " + mProjectId+" "+ mName+" "+mDescription;
    }

}