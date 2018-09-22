// Run some configuration code when the web page loads
const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var taskList: TaskList;
var newtaskform: NewTaskForm;
var helper: Helper;
var projectID: any;

$.getScript("app.js");

class TaskList {
    refresh() {
        $.ajax({
            type: "GET",
            url: backendUrl + "/tasks/all",
            dataType: "json",
            success: taskList.update
        });
    }
    refreshProject(){
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
        for (let i = 0; i < data.mTaskData.length; ++i) {
            $("#taskList").append("<tr><td>"+data.mTaskData[i].mId+". </td><td> <b> " +data.mTaskData[i].mName+" :</b></td><td> " +data.mTaskData[i].mDescription+"</td><tr>");
        }
    }
}
class NewTaskForm{
    constructor() {
        $("#addButton").click(this.submitForm);
    }
    submitForm() {
        let taskname = "" + $("#taskname").val();
        let description = "" + $("#description").val();
        let priority = $('input[name=priority]:checked').val();
        let assignee = "" + $("#assignee").val();
        let assigner = "" + $("assigner").val();

        if (taskname === "" || description === "") {
            window.alert("Error: Task is not valid");
            return;
        }
        console.log("Priority: "+ priority);
        // set up an AJAX post.  When the server replies, the result will go to
        // onSubmitResponse
        $.ajax({
            type: "POST",
            url: backendUrl + "/tasks",
            dataType: "json",
            data: JSON.stringify({ mProjectId: 1, mTaskname: taskname,
                mDescription: description, mPriority: priority, mAssignee: assignee,
            mAssigner: assigner }),
            success: newtaskform.onSubmitResponse,
            error: newtaskform.onSubmitResponse
        });
    }

    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            console.log("Task Added Sucessfully!");
            taskList.refresh();
            window.location.replace("https://stacklight.herokuapp.com/tasks.html");
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
    console.log("Loading Tasks Page......."); 
    
    taskList = new TaskList();
    newtaskform = new NewTaskForm();
    helper = new Helper();
    projectID = helper.getUrlParameter('projectID');

    console.log("Project ID: "+projectID);
    
    taskList.refreshProject();
});