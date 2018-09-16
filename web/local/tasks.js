"use strict";
// Run some configuration code when the web page loads
var backendUrl = "https://stoplight-test.herokuapp.com";
var $;
var taskList;
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
    TaskList.prototype.update = function (data) {
        $("#taskList").html("<table>");
        for (var i = 0; i < data.mTaskData.length; ++i) {
            $("#taskList").append("<tr><td>" + data.mTaskData.mId + "</td><td>Task: " + data.mTaskData.mName + "</td><td>Task: " + data.mTaskData.mDescription + "</td><tr>");
        }
    };
    return TaskList;
}());
$(document).ready(function () {
    console.log("Loading Tasks Page.......");
    taskList = new TaskList();
    taskList.refresh();
});
