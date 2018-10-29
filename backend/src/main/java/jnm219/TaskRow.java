package jnm219;

public class TaskRow {

    public final int mId;
    public int mProjectId;
    public String mName;
    public String mDescription;
    public int mPriority;
    public String mAssignee;
    public String mAssigner;
    public int mStatus;
    public int mSubtasks;       // a count

    TaskRow(int id, int projectId, String name, String description, int priority, String assignee, String assigner, int status, int subtasks) {
        mId = id;
        mProjectId = projectId;
        mName = name;
        mDescription = description;
        mPriority = priority;
        mAssignee = assignee;
        mAssigner = assigner;
        mStatus = status;           // 10/29/18 Mira added
        mSubtasks = subtasks;       // 10/29/18 Mira added
    }
    TaskRow(int id, int projectId, String name, String description, int priority, String assignee, String assigner, int status) {   // 10/29/18 Mira added alternate constructor
        this(id, projectId, name, description, priority, assignee, assigner, status, 0);
    }

    public String toString() {
        return mId + " " + mProjectId+" "+ mName+" "+mDescription;
    }

}