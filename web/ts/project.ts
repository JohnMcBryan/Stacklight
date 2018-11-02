///<reference path="app.ts" />
var helper: AppHelper;
var taskList: TaskList;
var newTaskForm: NewTaskForm;
var projectID: any;
var projectName: any;

class TaskList {

    refresh() {
        $.ajax({
            type: "GET",
            //url: backendUrl + "/tasks/all",
            url: backendUrl + "/tasks/" + projectID,
            dataType: "json",
            success: taskList.update
        });
    }

    // todo: handle backlogged tasks when status == 2
    private compare(a: any, b: any)
    {
        // 0, 1, 2, 3
        // 3 == undefined

        // sort incomplete before complete

        if (a.mStatus == "1" && b.mStatus == "1")
        {
            // both are complete
            if (a.mName < b.mName)        // minor sort
                return -1;
            else if (a.mName > b.mName)
                return 1;
            else
                return 0;
        }
        if (a.mStatus == "1")
            return 1;   // b is not complete
        if (b.mStatus == "1")
            return -1;  // a is not complete

        // neither task is complete
        if (a.mPriority == 3 && b.mPriority == 3)       // 3 is undefined
        {
            if (a.mName < b.mName)        // minor sort
                return -1;
            else if (a.mName > b.mName)
                return 1;
            else
                return 0;
        }
        if (a.mPriority < b.mPriority)
            return -1;
        if (a.mPriority > b.mPriority)
            return 1;

        // same priority
        if (a.mName < b.mName)        // minor sort
            return -1;
        else if (a.mName > b.mName)
            return 1;
        return 0;
    }

    private update(data: any) {
        //console.log(data);
        data.mTaskData.sort(taskList.compare);
        console.log(data);
        $("#projectHeader").html("<h2>Project: " + projectName + "</h2>");

        var cards: any;
        cards = "";
        cards += "<div class='bs-component'>\
            <div class='card text-white bg-primary mb-3'>\
                 <div class='card-header'>\
                     Task Name\
                 </div>\
                 <div class='card-body'>\
                     <h4 class='card-title'>Task Name</h4>\
                     <p class='card-text'>Task details</p>\
                     <div class='progress'>\
                        <div class='progress-bar bg-info' role='progressbar' style='width: 50%' aria-valuenow='50' aria-valuemin='0' aria-valuemax='100'>\
                     </div>\
                 </div>\
            </div></div>";

        for (let i = 0; i < data.mTaskData.length; ++i)
        {
            var task: any;
            task = data.mTaskData[i];

            var color: any;
            if (task.mStatus == /*incomplete*/"0" && task.mPriority == 0)
                color = 'danger';
            else if (task.mStatus == "0" && task.mPriority == 1)
                color = 'warning';
            else if (task.mStatus == "0" && task.mPriority == 2)
                color = 'success';
            else if (task.mStatus == "0")   // no priority set
                color = 'light';
            else
                color = 'secondary';          // complete

            cards += "<div class='bs-component'>\
                <div class='card text-white border-" + color + " mb-3'>\
                    <div class='card-header text-" + color + "'><h4>" + task.mName + "</h4></div>\
                    <div class='card-body'>\
                        <div class='row'>\
                            <div class='col-md-8'>\
                                <p class='card-text'><i class='fas fa-2x fa-angle-right'></i> " + task.mDescription + "</p></div>\
                                <div class='col-md-4'>\
                                    <div class='float-right'>\
                                    <a href='/taskPage.html?taskId=" + task.mId + "'><button class='btn btn-primary'>See details";
                                        if (task.mSubtasks > 0)
                                            cards += " (" + task.mSubtasks + ")";
                                        cards += "</button></a>";
                                    if (task.mStatus == /*incomplete*/"0")
                                    {
                                        cards += "<button class='btn btn-primary' onclick='completeTask(" + task.mId + ")'>Complete</button>";
                                    }
                                    else if (task.mStatus == /*complete*/"1")
                                    {
                                        cards += "<button class='btn btn-primary' onclick='uncompleteTask(" + task.mId + ")'>Un-complete</button>";
                                    }
                cards += "</div></div></div></div></div></div></div>";
        }
        $("#miraList").html(cards);

        var table: any;
        table = "<table width='100%'>\
            <tr>\
                <th>&nbsp;</th>\
                <th>Task</th>\
                <th>Description</th>\
                <th>&nbsp;</th>\
            </tr>";
        for (let i = 0; i < data.mTaskData.length; ++i)
        {
            var task: any;
            task = data.mTaskData[i];

            var color: any;
            if (task.mStatus == /*incomplete*/"0" && task.mPriority == 0)
                color = '#F53';         // todo: include style='background-color:
            else if (task.mStatus == "0" && task.mPriority == 1)
                color = '#FF7';
            else if (task.mStatus == "0" && task.mPriority == 2)
                color = '#072';
            else
                color = '#fff';     // todo: omit style attribute altogether

            table += "<tr><td class='priorityCol' style='background-color:" + color + ";'>&nbsp;</td>\
                <td class='taskCol'><b>" + task.mName + "</b></td>\
                <td class='descCol'>" + task.mDescription + "</td>\
                <td class='buttonCol'>\
                    <form action='https://stacklight.herokuapp.com/taskPage.html'><input type='submit' value='See details";
                    if (task.mSubtasks > 0)
                        table += " (" + task.mSubtasks + ")";
                    table += "' /><input type='hidden' id='taskID' name='taskID' value='" + task.mId + "' /></form>";
            if (task.mStatus == /*incomplete*/"0")
            {
                table += "<input type='submit' value='Complete' onClick='completeTask(" + task.mId + ")'/>";
            }
            else if (task.mStatus == /*complete*/"1")
            {
                table += "<input type='submit' value='Un-complete' onClick='uncompleteTask(" + task.mId + ")'/>";
            }
            // todo: don't display backlog button is task is already backlogged.
            // input type='submit' value='Backlog' id='backlogButton' onClick='backlogTask(" + task.mId + ")'/>
            table += "\
                </td>\
                </tr>";
        }
        table += "</table>";

        $("#taskList").html(table);
    }
}

function completeTask(taskID: any){
    console.log("completeTask "+taskID);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/complete",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskID}),
        success: taskList.refresh,
    });

}

function uncompleteTask(taskID: any){
    console.log("uncompleteTask "+taskID);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/uncomplete",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskID}),
        success: taskList.refresh,
    });

}
function backlogTask(taskID: any){
    console.log("backlogTask "+taskID);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/backlog",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskID}),
        success: taskList.refresh
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
            window.alert("Task name and task description cannot be black.");
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
            success: newTaskForm.onSubmitResponse,
            error: newTaskForm.onSubmitResponse
        });
    }
    back(){
        console.log("Task Add Cancelled");
        taskList.refresh();
        window.location.replace("https://stacklight.herokuapp.com/tasks.html?projectID="+projectID);
    }

    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            console.log("Task Added Sucessfully!");
            taskList.refresh();
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

$(document).ready(function () {
    helper = new AppHelper();
    taskList = new TaskList();
    newTaskForm = new NewTaskForm();
    projectID = helper.getUrlParameter('projectID');
    projectName = helper.getUrlParameter('projectName');
    $('.login').text(localStorage.getItem("email"));


    console.log("Project ID: "+projectID);
    $("#PID").replaceWith("<input type= 'hidden' name= 'projectID' id = 'PID'value = '"+projectID+"'/>")
    taskList.refresh();
});