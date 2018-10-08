package jnm219;

/**
 * SimpleRequest provides a format for clients to present title and message
 * strings to the server.
 *
 * NB: since this will be created from JSON, all fields must be public, and we
 *     do not need a constructor.
 */
public class SimpleRequest {
    /**
     * The title being provided by the client.
     */
    public int mId;

    /**
     * The message being provided by the client.
     */
    public String mName;

    public String mProjectId;
    public String mTaskname;
    public String mDescription;
    public String mPriority;
    public String mAssignee;
    public String mAssigner;

    public String mOwner;
    public String mOrganization;

    public int mStatus;
    public int mTaskId;

}