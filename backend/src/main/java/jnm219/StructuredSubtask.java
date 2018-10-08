package jnm219;

public class StructuredSubtask {
    public String mStatus;
    public String mMessage;
    public Object mSubtaskData;

    public StructuredSubtask(String status, String message, Object data) {
        this.mStatus = status != null ? status : "invalid";
        this.mMessage = message;
        this.mSubtaskData = data;
    }
}