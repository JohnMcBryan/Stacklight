// Run some configuration code when the web page loads
const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var taskList: TaskList;
var newtaskform: NewTaskForm;
var helper: Helper;
var projectID: any;

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
            $("#taskList").append("<tr><td>"+data.mTaskData[i].mId+". </td><td> <b> " +data.mTaskData[i].mName+" :</b></td><td> " +data.mTaskData[i].mDescription+"</td><td><div id = task-"+data.mTaskData[i].mId+" name = tasksLink></div></td><tr>");
            if(data.mTaskData[i].mPriority == 1)
            {
                $("#task-"+data.mTaskData[i].mId).closest('tr').css('background-color','#F53');
            }
            if(data.mTaskData[i].mPriority == 2)
            {
                $("#task-"+data.mTaskData[i].mId).closest('tr').css('background-color','#FF7');
            }
            if(data.mTaskData[i].mPriority == 3)
            {
                $("#task-"+data.mTaskData[i].mId).closest('tr').css('background-color','#072');
            }

            $("#task-"+data.mTaskData[i].mId).replaceWith("<form action= 'https://stacklight.herokuapp.com/taskPage.html' id = 'TID'><input type='submit' value='To Task Page' /><input type='hidden' name='taskID' value='"+data.mTaskData[i].mId+"' /> <input type='hidden' name='priority' value='"+data.mTaskData[i].mPriority+"'/> </form>");
        }
    }
}
class NewTaskForm{
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
            data: JSON.stringify({ mProjectId: projectID, mTaskname: taskname,
                mDescription: description, mPriority: priority, mAssignee: assignee,
            mAssigner: assigner }),
            success: newtaskform.onSubmitResponse,
            error: newtaskform.onSubmitResponse
        });
    }
    back(){
        console.log("Task Add Cancelled");
        taskList.refreshProject();
        window.location.replace("https://stacklight.herokuapp.com/tasks.html?projectID="+projectID);
    }

    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            console.log("Task Added Sucessfully!");
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
        console.log("sPageURL: " + sPageURL);

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            console.log("sParameterName: "+sParameterName);
    
            if (sParameterName[0] === sParam) {
                console.log("sParameterName[0]: "+sParameterName[0] + " === " + "sParam: "+sParam);
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
    $("#PID").replaceWith("<input type= 'hidden' name= 'projectID' id = 'PID'value = '"+projectID+"'/>")    
    taskList.refreshProject();
});