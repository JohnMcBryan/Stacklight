// Run some configuration code when the web page loads
const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var subtaskList: SubtaskList;
var newSubtaskform: NewSubtaskForm;
var helper: Helper;
var taskID: any;

class SubtaskList {
    refresh(){
        $.ajax({
            type: "GET",
            url: backendUrl + "/subtasks/"+taskID,
            dataType: "json",
            success: subtaskList.update
        });
    }
    private update(data: any) {
        $("#subtaskList").html("<table>");
        console.log(data);
        for (let i = 0; i < data.mSubtaskData.length; ++i) {
            $("#subtaskList").append("<tr><td> "+i+": "+data.mSubtaskData[i].mName+"</td><tr>");
        }
    }
}
class NewSubtaskForm{
    constructor() {
        $("#addSubtaskButton").click(this.submitForm);
        $("#cancelAdd").click(this.back);
    }

    submitForm() {
        let name = "" + $("#Subtaskname").val();
        let status = 0;
        if (name === "") {
            window.alert("Error: Task is not valid");
            return;
        }
        console.log("Subtask Name: " +name);
        // set up an AJAX post.  When the server replies, the result will go to
        // onSubmitResponse
        $.ajax({
            type: "POST",
            url: backendUrl + "/subtasks",
            dataType: "json",
            data: JSON.stringify({ mTaskId: taskID, mName: name, mStatus:status }),
            success: newSubtaskform.onSubmitResponse,
            error: newSubtaskform.onSubmitResponse
        });
    }
    back(){
        console.log("Task Add Cancelled");
        subtaskList.refresh();
        $("#Subtaskname").val("");
    }

    private onSubmitResponse(data: any) {
        $("#Subtaskname").val("");
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            console.log("Task Added Sucessfully!");
            subtaskList.refresh();
        }
        // Handle explicit errors with a detailed popup message
        else if (data.mStatus === "error") {
            window.alert("The server replied with an error:\n" + data.mMessage);
        }
        // Handle other errors with a less-detailed popup message
        else {
            window.alert("Unspecified error "+data.mStatus);
        }
    }
}

class Helper{
    public getUrlParameter(sParam: String) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }

}

$(document).ready(function () {
    console.log("Loading Subtasks Page......."); 
    
    subtaskList = new SubtaskList();
    newSubtaskform = new NewSubtaskForm();
    helper = new Helper();
    taskID = helper.getUrlParameter('taskID');

    console.log("(Subtask) Task ID: "+taskID);
    subtaskList.refresh();
});