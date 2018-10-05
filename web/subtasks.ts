// Run some configuration code when the web page loads
const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var taskList: SubtaskList;
var newtaskform: NewSubtaskForm;
var helper: Helper;
var projectID: any;

class SubtaskList {

    refresh(){
        $.ajax({
            type: "GET",
            url: backendUrl + "/tasks/"+projectID,
            dataType: "json",
            success: taskList.update
        });
    }
    private update(data: any) {
        $("#taskList").html("<table>");
        console.log(data);
        for (let i = 0; i < data.mSubtaskData.length; ++i) {
            $("#taskList").append("<tr><td>"+data.mSubtaskData[i].mId+". </td><td> <b> " +data.mSubtaskData[i].mName+" :</b></td><td> " +data.mSubtaskData[i].mDescription+"</td><td><div id = task-"+data.mSubtaskData[i].mId+" name = tasksLink></div></td><tr>");
        }
    }
}
class NewSubtaskForm{
    constructor() {
        $("#addButton").click(this.submitForm);
        $("#addCancel").click(this.back);
    }

    submitForm() {
        let taskname = "" + $("#taskname").val();
        let description = "" + $("#description").val();
        let priority = $('input[name=priority]:checked').val();
        let assignee = "" + $("#assignee").val();
        let assigner = "" + $("assigner").val();

        if (taskname === "" || description === "") {
            window.alert("Error: Subtask is not valid");
            return;
        }
        console.log("Priority: "+ priority);
        // set up an AJAX post.  When the server replies, the result will go to
        // onSubmitResponse
        $.ajax({
            type: "POST",
            url: backendUrl + "/tasks",
            dataType: "json",
            data: JSON.stringify({ mProjectId: projectID, mSubtaskname: taskname,
                mDescription: description, mPriority: priority, mAssignee: assignee,
            mAssigner: assigner }),
            success: newtaskform.onSubmitResponse,
            error: newtaskform.onSubmitResponse
        });
    }
    back(){
        console.log("Subtask Add Cancelled");
        taskList.refreshProject();
        window.location.replace("https://stacklight.herokuapp.com/tasks.html?projectID="+projectID);
    }

    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            console.log("Subtask Added Sucessfully!");
            taskList.refreshProject();
            window.location.replace("https://stacklight.herokuapp.com/tasks.html?projectID="+projectID);
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
    
    taskList = new SubtaskList();
    newtaskform = new NewSubtaskForm();
    helper = new Helper();
    projectID = helper.getUrlParameter('projectID');

    console.log("Project ID: "+projectID);
    $("#PID").replaceWith("<input type= 'hidden' name= 'projectID' id = 'PID'value = '"+projectID+"'/>")    
    taskList.refreshProject();
});