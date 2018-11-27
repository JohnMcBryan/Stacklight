// Run some configuration code when the web page loads
///<reference path="app.ts" />
var $: any;
var edittaskform: EditTaskForm;
var taskId: any;
var helper: AppHelper;

class EditTaskForm{
    constructor() {
        $("#addButton").click(this.submitForm);
        $("#addCancel").click(this.back);
    }
    fillForm(data:any){
        console.log("Task: "+data.mTaskData.mName);
        $("#identifier").val(data.mTaskData.mId);
        $("#taskname").val(data.mTaskData.mName);
        $("#description").text(data.mTaskData.mDescription);
        var priority = data.mTaskData.mPriority;
        if(priority == 2){
            $("#high").attr('checked', true);
        }
        else if(priority == 1){
            $("#medium").attr('checked', true);
        }
        else{
            $("#low").attr('checked', true);
        }
        $("#assignee").val(data.mTaskData.mAssignee);
        $("#assigner").val(data.mTaskData.mAssigner);
    }

    submitForm() {
        let id = "" + $("#identifier").val();
        let taskname = "" + $("#taskname").val();
        let description = "" + $("#description").val();
        let priority = $('input[name=priority]:checked').val();
        let assignee = "" + $("#assignee").val();
        let assigner = "" + $("#assigner").val();

        if (taskname === "" || description === "") {
            window.alert("Error: Task is not valid");
            return;
        }
        console.log("Assigner: "+ assigner);
        // set up an AJAX post.  When the server replies, the result will go to
        // onSubmitResponse
        $.ajax({
            type: "POST",
            url: backendUrl + "/tasks/edit",
            dataType: "json",
            data: JSON.stringify({ mId: id, mTaskname: taskname,
                mDescription: description, mPriority: priority, mAssignee: assignee,
            mAssigner: assigner }),
            success: edittaskform.onSubmitResponse,
            error: edittaskform.onSubmitResponse
        });
    }
    back(){
        console.log("Task Add Cancelled");
        //window.location.replace("https://stacklight.herokuapp.com/tasks.html?projectID="+projectID);
    }

    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            console.log("Task Edit Sucessfully!");
            //window.location.replace("https://stacklight.herokuapp.com/tasks.html?projectID="+projectID);
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

$(document).ready(function () {
    console.log("Loading Edit Tasks Page.......");

    edittaskform = new EditTaskForm();
    helper = new AppHelper();
    taskId = helper.getUrlParameter('taskId');
    $('.login').text(localStorage.getItem("email"));
    
    $.ajax({
        type: "GET",
        url: backendUrl + "/task/"+taskId,
        dataType: "json",
        success: edittaskform.fillForm
    });
});