const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var helper: HelperTask;
var taskID: any;

var taskInfo: TaskInfo;
class TaskInfo {
    refresh() {
        $.ajax({
            type: "GET",
            url: backendUrl + "/task/"+taskID,
            dataType: "json",
            success: taskInfo.update
        });
    }
    private update(data: any) {
        $("#taskInfo").html("<tr><td>"+data.mTaskData.mId+". </td><td> <b> " +data.mTaskData.mName+" :</b></td><td> " +data.mTaskData.mDescription+"</td>");
        console.log(data);
    }
}
class HelperTask{
    public getUrlParameter(sParam: String) {
        console.log("sParam: " + sParam);
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL: " + sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            console.log("sParameterName: " + sParameterName);
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }

}


$(document).ready(function () {
    console.log("Loading Task Page......."); 
    
    taskInfo = new TaskInfo();
    helper = new HelperTask();
    taskID = helper.getUrlParameter('taskID');

    console.log("Task ID: "+taskID);
    taskInfo.refresh();
});