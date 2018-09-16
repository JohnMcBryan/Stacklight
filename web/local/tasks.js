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
        console.log(data);
        for (var i = 0; i < data.mTaskData.length; ++i) {
            $("#taskList").append("<tr><td>" + data.mTaskData[i].mId + ". </td><td> <b> " + data.mTaskData[i].mName + " :</b></td><td> " + data.mTaskData[i].mDescription + "</td><tr>");
        }
    };
    return TaskList;
}());
$(document).ready(function () {
    console.log("Loading Tasks Page.......");
    taskList = new TaskList();
    taskList.refresh();
});
