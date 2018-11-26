package jnm219;


/**
 * Holds necessary info for a file
 */
public class User{
    public final String mFirstName;
    public final String mLastName;
    public final String mEmail;

    User(String firstName, String lastName, String email){
        this.mEmail = email;
        this.mFirstName = firstName;
        this.mLastName = lastName;
    }
    User(String firstName, String lastName){
        this.mEmail = null;
        this.mFirstName = firstName;
        this.mLastName = lastName;
    }
}