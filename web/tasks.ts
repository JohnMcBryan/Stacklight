// Run some configuration code when the web page loads
const backendUrl = "https://stoplight-test.herokuapp.com";
var $: any;
var taskList: TaskList;

class TaskList {
    refresh() {
        $.ajax({
            type: "GET",
            url: backendUrl + "/tasks/all",
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

$(document).ready(function () {
    console.log("Loading Tasks Page......."); 
    
    taskList = new TaskList();

    taskList.refresh();
});