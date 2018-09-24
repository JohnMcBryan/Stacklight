"use strict";
// Run some configuration code when the web page loads
var backendUrl = "https://stacklight.herokuapp.com";
var $;
var taskList;
var newtaskform;
var helper;
var projectID;
var TaskList = /** @class */ (function () {
    function TaskList() {
    }
    TaskList.prototype.refresh = function () {
        $.ajax({
            type: "GET",
            url: backendUrl + "/tasks/all",
            dataType: "json",
            success: taskList.update
        });
    };
    TaskList.prototype.refreshProject = function () {
        $.ajax({
            type: "GET",
            url: backendUrl + "/tasks/" + projectID,
            dataType: "json",
            success: taskList.update
        });
    };
    TaskList.prototype.update = function (data) {
        $("#taskList").html("<table>");
        console.log(data);
        for (var i = 0; i < data.mTaskData.length; ++i) {
            $("#taskList").append("<tr><td>" + data.mTaskData[i].mId + ". </td><td> <b> " + data.mTaskData[i].mName + " :</b></td><td> " + data.mTaskData[i].mDescription + "</td><td><div id = task-" + data.mTaskData[i].mId + " name = tasksLink></div></td><tr>");
            $("#task-" + data.mTaskData[i].mId).replaceWith("<form action= 'https://stacklight.herokuapp.com/taskPage.html' id = 'TID'><input type='submit' value='To Task Page' /><input type= 'hidden' name= 'taskID' value='" + data.mTaskData[i].mId + "' /></form>");
        }
    };
    return TaskList;
}());
var NewTaskForm = /** @class */ (function () {
    function NewTaskForm() {
        $("#addButton").click(this.submitForm);
        $("#addCancel").click(this.back);
    }
    NewTaskForm.prototype.submitForm = function () {
        var taskname = "" + $("#taskname").val();
        var description = "" + $("#description").val();
        var priority = $('input[name=priority]:checked').val();
        var assignee = "" + $("#assignee").val();
        var assigner = "" + $("assigner").val();
        if (taskname === "" || description === "") {
            window.alert("Error: Task is not valid");
            return;
        }
        console.log("Priority: " + priority);
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
    };
    NewTaskForm.prototype.back = function () {
        console.log("Task Add Cancelled");
        taskList.refreshProject();
        window.location.replace("https://stacklight.herokuapp.com/tasks.html?projectID=" + projectID);
    };
    NewTaskForm.prototype.onSubmitResponse = function (data) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            console.log("Task Added Sucessfully!");
            taskList.refreshProject();
            window.location.replace("https://stacklight.herokuapp.com/tasks.html?projectID=" + projectID);
        }
        // Handle explicit errors with a detailed popup message
        else if (data.mStatus === "error") {
            window.alert("The server replied with an error:\n" + data.mMessage);
        }
        // Handle other errors with a less-detailed popup message
        else {
            window.alert("Unspecified error " + data.mStatus);
        }
    };
    return NewTaskForm;
}());
var Helper = /** @class */ (function () {
    function Helper() {
    }
    Helper.prototype.getUrlParameter = function (sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)), sURLVariables = sPageURL.split('&'), sParameterName, i;
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };
    return Helper;
}());
$(document).ready(function () {
    console.log("Loading Tasks Page.......");
    taskList = new TaskList();
    newtaskform = new NewTaskForm();
    helper = new Helper();
    projectID = helper.getUrlParameter('projectID');
    console.log("Project ID: " + projectID);
    $("#PID").replaceWith("<input type= 'hidden' name= 'projectID' id = 'PID'value = '" + projectID + "'/>");
    taskList.refreshProject();
});
