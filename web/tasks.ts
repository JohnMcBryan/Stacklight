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
        $.ajax({
            type: "GET",
            url: backendUrl + "/completedTasks/"+projectID,
            dataType: "json",
            success: taskList.update2
        });

        $.ajax({
            type: "GET",
            url: backendUrl + "/backlog/"+projectID,
            dataType: "json",
            success: taskList.update3
        });
    }
    private update(data: any) {
        $("#taskListRed").html("</table><table>");
        $("#taskListYellow").html("</table><table>");
        $("#taskListGreen").html("</table><table>");
        $("#taskList").html("</table><table>");
        console.log(data);
        for (let i = 0; i < data.mTaskData.length; ++i) {
            if (data.mTaskData[i].mPriority == 1 || data.mTaskData[i].mPriority == 2 || data.mTaskData[i].mPriority == 3) {
                if(data.mTaskData[i].mPriority == 1)
                {
                    $("#taskListRed").append("<tr><td class='red'>"+data.mTaskData[i].mId+" </td><td> <b> " +data.mTaskData[i].mName+" :</b></td><td> " +data.mTaskData[i].mDescription+"</td><td><div id = task-"+data.mTaskData[i].mId+" name = tasksLink></div></td><td><input type='checkbox'></td><tr>");
                    $(".red").css('background-color','#F53');
                    //$("#task-"+data.mTaskData[i].mId).closest('tr').css('background-color','#F53');
                }
                if(data.mTaskData[i].mPriority == 2)
                {
                    $("#taskListYellow").append("<tr><td class='yellow'>"+data.mTaskData[i].mId+" </td><td> <b> " +data.mTaskData[i].mName+" :</b></td><td> " +data.mTaskData[i].mDescription+"</td><td><div id = task-"+data.mTaskData[i].mId+" name = tasksLink></div></td><td><input type='checkbox'></td><tr>");
                    $(".yellow").css('background-color','#FF7');
                    //$("#task-"+data.mTaskData[i].mId).closest('tr').css('background-color','#FF7');
                }
                if(data.mTaskData[i].mPriority == 3)
                {
                    $("#taskListGreen").append("<tr><td class='green'>"+data.mTaskData[i].mId+" </td><td> <b> " +data.mTaskData[i].mName+" :</b></td><td> " +data.mTaskData[i].mDescription+"</td><td><div id = task-"+data.mTaskData[i].mId+" name = tasksLink></div></td><td><input type='checkbox'></td><tr>");
                    $(".green").css('background-color','#072');
                    //$("#task-"+data.mTaskData[i].mId).closest('tr').css('background-color','#072');
                } else {
                    $("#taskList").append("<tr><td>"+data.mTaskData[i].mId+" </td><td> <b> " +data.mTaskData[i].mName+" :</b></td><td> " +data.mTaskData[i].mDescription+"</td><td><div id = task-"+data.mTaskData[i].mId+" name = tasksLink></div></td><td><input type='checkbox'></td><tr>");
                }
                $("#task-"+data.mTaskData[i].mId).replaceWith("<form action= 'https://stacklight.herokuapp.com/taskPage.html' id = 'TID'><input type='submit' value='To Task Page' /><input type= 'hidden' id = 'taskID' name= 'taskID' value='"+data.mTaskData[i].mId+"' /></form>");
                $("#complete-"+data.mTaskData[i].mId).replaceWith("<input type='submit' value='Complete' id='completeButton' onClick='completeTask("+data.mTaskData[i].mId+")'/>");
                $("#backlog-"+data.mTaskData[i].mId).replaceWith("<input type='submit' value='Backlog' id='backlogButton' onClick='backlogTask("+data.mTaskData[i].mId+")'/>");

                $("#task-"+data.mTaskData[i].mId).replaceWith("<form action= 'https://stacklight.herokuapp.com/taskPage.html' id = 'TID'><input type='submit' value='To Task Page' /><input type='hidden' name='taskID' value='"+data.mTaskData[i].mId+"' /> <input type='hidden' name='priority' value='"+data.mTaskData[i].mPriority+"'/> </form>");
            }
        }
    }
    private update2(data: any) {
        $("#completedTaskList").html("<table>");
        for (let i = 0; i < data.mTaskData.length; ++i) {
            $("#completedTaskList").append("<tr><td>"+data.mTaskData[i].mId+". </td><td> <b> " +data.mTaskData[i].mName+" :</b></td><td> " +data.mTaskData[i].mDescription+"</td><td><div id = task-"+data.mTaskData[i].mId+" name = tasksLink></div></td><td><div id = uncomplete-"+data.mTaskData[i].mId+" name = uncompleteButton></div></td><tr>");

            $("#task-"+data.mTaskData[i].mId).replaceWith("<form action= 'https://stacklight.herokuapp.com/taskPage.html' id = 'TID'><input type='submit' value='To Task Page' /><input type= 'hidden' id = 'taskID' name= 'taskID' value='"+data.mTaskData[i].mId+"' /></form>");
            $("#uncomplete-"+data.mTaskData[i].mId).replaceWith("<input type='submit' value='UnComplete' id='uncompleteButton' onClick='uncompleteTask("+data.mTaskData[i].mId+")'/>");

        }
    }

    private update3(data: any) {
        $("#backlog").html("<table>");
        for (let i = 0; i < data.mTaskData.length; ++i) {
            $("#backlog").append("<tr><td>"+data.mTaskData[i].mId+". </td><td> <b> " +data.mTaskData[i].mName+" :</b></td><td> " +data.mTaskData[i].mDescription+"</td><td><div id = task-"+data.mTaskData[i].mId+" name = tasksLink></div></td><td><div id = backlog-"+data.mTaskData[i].mId+" name = tasksLink></div></td><tr>");

            $("#task-"+data.mTaskData[i].mId).replaceWith("<form action= 'https://stacklight.herokuapp.com/taskPage.html' id = 'TID'><input type='submit' value='To Task Page' /><input type= 'hidden' id = 'taskID' name= 'taskID' value='"+data.mTaskData[i].mId+"' /></form>");
            $("#backlog-"+data.mTaskData[i].mId).replaceWith("<input type='submit' value='To Stack' id='uncompleteButton' onClick='uncompleteTask("+data.mTaskData[i].mId+")'/>");

        }
    }
}
function completeTask(taskID: any){
    console.log("Task ID: "+taskID);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/complete",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskID}),
        success: taskList.refreshProject(),
    });

}
function uncompleteTask(taskID: any){
    console.log("Task ID: "+taskID);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/uncomplete",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskID}),
        success: taskList.refreshProject(),
    });

}
function backlogTask(taskID: any){
    console.log("Task ID: "+taskID);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/backlog",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskID}),
        success: taskList.refreshProject(),
    });

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