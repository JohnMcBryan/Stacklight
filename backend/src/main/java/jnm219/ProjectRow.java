package jnm219;

public class ProjectRow {

    public final int mId;
    public String mName;
    public String mDescription;
    public String mOwner;
    public String mOrganization;

    ProjectRow(int id, String name, String description, String owner, String organization) {
        mId = id;
        mName = name;
        mDescription = description;
        mOwner = owner;
        mOrganization = organization;
    }

    public String toString() {
        return mId + " " + mName+" "+mDescription;
    }

}