///<reference path="app.ts" />
///<reference path="taskFiles.ts" />

var helper: AppHelper;
var taskId: any;

var task: Task;
class Task{
    refresh() {
        $.ajax({
            type: "GET",
            url: backendUrl + "/task/"+taskId,
            dataType: "json",
            success: task.update
        });
    }
    private update(data: any) {
        $("#task").html("<tr><td>"+data.mTaskData.mId+". </td><td> <b> " +data.mTaskData.mName+" :</b></td><td> " +data.mTaskData.mDescription+"</td>");
        console.log(data);
    }
}

var subtaskList: SubtaskList;
var newSubtaskform: NewSubtaskForm;

class SubtaskList {
    refresh(){
        $.ajax({
            type: "GET",
            url: backendUrl + "/subtasks/"+taskId,
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
            data: JSON.stringify({ mTaskId: taskId, mName: name, mStatus:status }),
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

$(document).ready(function () {
    helper = new AppHelper();
    taskId = helper.getUrlParameter('taskId');

    task = new Task();
    subtaskList = new SubtaskList();
    newSubtaskform = new NewSubtaskForm();

    task.refresh();
    subtaskList.refresh();

    // Create the object that controls the "New Entry" form
    FileUpload = new fileUpload();
    fileList = new FileList2();

    fileList.refresh(taskId);

    $('.login').text(localStorage.getItem("email"));
});
