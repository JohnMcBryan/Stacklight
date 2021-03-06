///<reference path="app.ts" />
var helper: AppHelper;
var taskList: TaskList;
var newTaskForm: NewTaskForm;
var projectID: any;
var projectName: any;
var savedTaskId: any;        // todo: make subtasks/ return taskId and eliminate this hack

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
        data.mTaskData.sort(taskList.compare);
        //console.log(data);
        $("#projectHeader").html("<h2>Project: " + projectName + "</h2>");

        var cards: any;
        cards = "";

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

            cards += "<div class='bs-component' taskId='" + task.mId + "'>\
                <div class='card text-white border-" + color + " mb-3'>\
                    <div class='card-header text-" + color + "'><h4>" + task.mName + "</h4></div>\
                    <div class='card-body'>\
                        <div class='row'>\
                            <div class='col-md-12'>\
                                <p class='card-text'>\
                                    <button class='btn btn-primary btn-sm' onclick='onDetail(this, " + task.mId + ")' title='Toggle detail'><i class='fas fa-lg fa-angle-right'></i></button>&nbsp;"
                                    + task.mDescription;
                                if (task.mStatus == /*incomplete*/"0")
                                {
                                    cards += "<button class='btn btn-primary btn-sm float-right' onclick='completeTask(" + task.mId + ")' title='Mark task as complete'>Complete</button>";
                                }
                                else if (task.mStatus == /*complete*/"1")
                                {
                                    cards += "<button class='btn btn-primary btn-sm float-right' onclick='uncompleteTask(" + task.mId + ")' title='Mark task as not complete'>Un-complete</button>";
                                }
            cards += "\
                                <a href='/taskEdit.html?taskId=" + task.mId + "'><button class='btn btn-primary btn-sm float-right'>Edit</button></a>\
                                <div id='pSubtasksComplete" + task.mId + "'></div>\
                                </p><p></p>\
                            </div>\
                        </div>";
            cards += "\
                        <div class='row'>\
                            <div class='col-md-12'>\
                                <div id='taskDetail" + task.mId + "' style='display:none'>\
                                    <div id='taskSubtasks" + task.mId + "'>\
                                    </div>\
                                    <p>\
                                        <input type='text' class='form-control-sm col-9' id='addSubtask" + task.mId + "' oninput='onAddSubtaskInput(this, " + task.mId + ")'>\
                                        <button class='btn btn-primary btn-sm float-right' onclick='onAddSubtask(this, " + task.mId + ")'>Add Subtask</button>\
                                        <div id='addSubtaskFeedback" + task.mId + "' class='invalid-feedback' style='display:none;'>Description of subtask is required.</div>\
                                    </p>\
                                    <div id='taskFiles" + task.mId + "'>\
                                    </div>\
                                    <p>\
                                        <input type='file' class='form-control-file' style='display:inline; width:auto;' id='uploadFile" + task.mId + "'>\
                                        <button class='btn btn-primary btn-sm float-right' onclick='onUpload(this, " + task.mId + ")'>Upload</button>\
                                    </p>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>";

            getNCompleteSubtasks(task.mId);
        }
        $("#miraList").html(cards);
    }

    public updateSubtasks(data: any)
    {
        if (data && data.mSubtaskData && data.mSubtaskData.length>0 && data.mSubtaskData[0].mTaskId)     // guard against empty result
        {
            var detail: any;
            detail = "";
            for (let i = 0; i < data.mSubtaskData.length; ++i)
            {
                var subtask: any;
                subtask = data.mSubtaskData[i];
                detail += "<p>" + subtask.mName;
                if (subtask.mStatus == /*incomplete*/"0")
                {
                    detail += "<button class='btn btn-primary btn-sm float-right' onclick='completeSubtask(this, " + subtask.mTaskId + ", " + subtask.mId + ")' title='Mark subtask as complete'>Complete</button>";
                }
                else /*complete*/
                {
                    detail += "<i class='far fa-check-square float-right'></i>";
                }
                detail += "</p><hr>";
            }
            $('#taskSubtasks' + data.mSubtaskData[0].mTaskId).html(detail);   // put subtasks in the DOM
        }
    }

    public countSubtasks(data: any)
    {
        if (data && data.mSubtaskData && data.mSubtaskData.length>0 && data.mSubtaskData[0].mTaskId)     // guard against empty result
        {
            var ncomplete: any;
            var progressbar: String;
            ncomplete = 0;
            progressbar = "";
            for (let i = 0; i < data.mSubtaskData.length; ++i)
            {
                var subtask: any;
                subtask = data.mSubtaskData[i];
                if (subtask.mStatus == /*complete*/"1")
                {
                    ncomplete+=1;
                }
            }
            var percentComplete: any;
            var color: String;
            percentComplete = (ncomplete/data.mSubtaskData.length) * 100;
            if (percentComplete == 0)       // special case because don't want empty progress bar bc hard to see
            {
                progressbar += " <div class='progress'>\
                        <div class='progress-bar bg-danger' role='progressbar' style='width: 16%' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'><font color='white'>Subtasks 0%</font>\
                     </div>";
            }
            else
            {
                if (percentComplete > 0 && percentComplete <= 33)
                    color = "danger";
                else if (percentComplete > 33 && percentComplete <= 66)
                    color = "warning";
                else
                    color = "success";
                progressbar += " <div class='progress'>\
                        <div class='progress-bar bg-" + color + "' role='progressbar' style='width: " + percentComplete + "%' aria-valuenow='" + percentComplete + "' aria-valuemin='0' aria-valuemax='100'>\
                        <font color='white'>Subtasks " + percentComplete + "%</font>\
                     </div>";
             }
            $('#pSubtasksComplete' + data.mSubtaskData[0].mTaskId).html(progressbar);
        }

    }

    private compareFiles(a: any, b: any)
    {
        if (a.mfileName < b.mfileName)
            return -1;
        if (b.mfileName < a.mfileName)
            return 1;
        return 0;
    }

    public updateFiles(data: any)
    {
        console.log(data);
        // {"mStatus":"ok","mData":[{"mId":23,"mfileName":"","mfileId":"Error"},{"mId":24,"mfileName":"","mfileId":"Error"}]}
        // todo: get taskId in response, or GET subtasks and files in one response to one request.

        if (data && data.mData && data.mData.length>0)     // guard against empty result
        {
            data.mData.sort(taskList.compareFiles);

            var detail: any;
            detail = "";
            for (let i = 0; i < data.mData.length; ++i)
            {
                var file: any;
                var name: any;
                file = data.mData[i];
                name = file.mfileName;
                if (!name)
                    name = "mId:" + file.mId + " mfileId:" + file.mfileId; // todo: remove mId when mfileName is not empty
                detail += "<p>" + name; // + " (" + file.mId + ")";     // todo: replace mId with a modification time since mId has no value to user
                detail += "<span class='float-right'>";
                detail += "<span onclick='onStar(" + savedTaskId + "," + file.mId +")'><i class='fa" + (file.mStatus == "1" ? "s" : "r") + " fa-sm fa-star'></i></span>";
                detail += "&nbsp;<a href= \"/download/" + file.mfileId + "\" download=\"" + name + "\">";
                detail += "<button class='btn btn-primary btn-sm' title='Download file'>Download</button></a>";
                detail += "&nbsp;<button class='btn btn-primary btn-sm' title='Delete file'>Delete</button>";
                detail += "</span></p>";
            }
            //console.log(detail);
            $('#taskFiles' + savedTaskId).html(detail);
        }
    }

}

function getSubtasksForSavedId(data: any)
{
    if (data.mStatus == "ok")
        getSubtasks(savedTaskId);
    else if (data.mMessage)
        alert(data.mMessage);
}

function getSubtasks(taskId: any)
{
    if (taskId)     // should never be false
    {
        $.ajax({
            type: "GET",
            url: backendUrl + "/subtasks/" + taskId,
            dataType: "json",
            success: taskList.updateSubtasks,
        });
    }
}
function getNCompleteSubtasks(taskId: any)
{
    if (taskId)     // should never be false
    {
        $.ajax({
            type: "GET",
            url: backendUrl + "/subtasks/" + taskId,
            dataType: "json",
            success: taskList.countSubtasks,
            error: function(){
                //fail silently
            }
        });
    }
}

function onStar(taskId: any, fileId: any)
{
    savedTaskId = taskId;
    $.ajax({
        type: "POST",
        url: backendUrl + "/file/star",
        dataType: "json",
        data: JSON.stringify({mFileId: fileId}),
        success: refreshFiles,
    });
}
function getFiles(taskId: any)
{
    if (taskId)     // should never be false
    {
        savedTaskId = taskId;       // todo: get rid of this
        $.ajax({
            type: "GET",
            url: backendUrl + "/file/" + taskId,
            dataType: "json",
            success: taskList.updateFiles,
        });
    }
}

function refreshFiles(data: any)      // callback for onUpload()
{
    if (data.mStatus == "ok")
        getFiles(savedTaskId);
    else if (data.mMessage)
        alert(data.mMessage);
    $("#uploadFile"+savedTaskId).wrap('<form>').closest('form').get(0).reset(); // clear input file. thank you, stackoverflow.
    $("#uploadFile"+savedTaskId).unwrap();
}

function onDetail(element: any, taskId: any)
{
    $(element).toggleClass('checked');
    if ($(element).hasClass('checked'))
    {
        // show details
        $(element).html("<i class='fas fa-lg fa-angle-down'></i>");     // change icon in button
        $('#taskDetail' + taskId).show();
        getSubtasks(taskId);
        getFiles(taskId);
    }
    else
    {
        // hide details
        $(element).html("<i class='fas fa-lg fa-angle-right'></i>");
        $('#taskDetail' + taskId).hide();
    }
}

function onUpload(element: any, taskId: any)
{
    let file = $("#uploadFile"+taskId)[0].files[0];
    if (file)
    {
        var formData = new FormData();
        formData.append('mFile', file);
        formData.append('mFileName',file.name);
        formData.append('mTaskID',taskId);
        //console.log(formData);
        savedTaskId = taskId;        // todo: get rid of this
        $.ajax({
            type: "POST",
            url: backendUrl + "/file",
            dataType: "json",      // dataType of response to POST
            data: formData,
            contentType: false,
            processData: false,
            success: refreshFiles
        });
    }
}

function onAddSubtaskInput(element: any, taskId: any)
{
    $("#addSubtaskFeedback" + taskId).hide();
}

function onAddSubtask(element: any, taskId: any)
{
    var addSubtask: any;
    addSubtask = $("#addSubtask" + taskId);
    if (addSubtask.val())
    {
        //console.log("valid input");
        savedTaskId = taskId;        // todo: get rid of this
        $.ajax({
            type: "POST",
            url: backendUrl + "/subtasks",
            dataType: "json",
            data: JSON.stringify({ mTaskId: taskId, mName: addSubtask.val(), mStatus: /*incomplete*/0 }),
            //success: getSubtasksForSavedId
            success: function() {
                getSubtasks(taskId);
                getNCompleteSubtasks(taskId);
            }
        });
    }
    else
    {
        $("#addSubtaskFeedback" + taskId).show();
    }
}

function completeSubtask(element:any, taskId:any, subtaskId:any)
{
    $.ajax({
        type: "POST",
        url: backendUrl + "/subtasks/complete",
        dataType: "json",
        data: JSON.stringify({mSubtaskId: subtaskId}),
        //success: taskList.refresh,
        success: function() {
            getSubtasks(taskId);
            getNCompleteSubtasks(taskId);
        }
    });
}

function completeTask(taskId: any)
{
    //console.log("completeTask "+taskId);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/complete",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskId}),
        success: taskList.refresh,
    });
}

function uncompleteTask(taskId: any)
{
    console.log("uncompleteTask "+taskId);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/uncomplete",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskId}),
        success: taskList.refresh,
    });
}

function backlogTask(taskId: any)
{
    console.log("backlogTask "+taskId);

    $.ajax({
        type: "POST",
        url: backendUrl + "/tasks/backlog",
        dataType: "json",
        data: JSON.stringify({mTaskId: taskId}),
        success: taskList.refresh
    });

}

class NewTaskForm
{
    constructor()
    {
        $("#addButton").click(this.submitForm);
    }

    submitForm() {
        let taskname = "" + $("#taskname").val();
        let description = "" + $("#description").val();
        let priority = $('input[name=priority]:checked').val();
        let assignee = "" + $("#assignee").val();
        let assigner = "" + $("#assigner").val();

        
        if (taskname === "" || description === "") {
            window.alert("Task name and task description cannot be blank.");
            return;
        }
        console.log("Assignee: "+ assignee);
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

    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        console.log("----got response from server-----");
        console.log(data);
        console.log(data.mStatus);
        if (data.mStatus === "ok") {
            console.log("Task Added Sucessfully!");
            taskList.refresh();
            // todo: pass the project name or write get method to get name when page loads
            window.location.replace("https://stacklight.herokuapp.com/project.html?projectID="+projectID + "&projectName=" + projectName);
        }
        // Handle explicit errors with a detailed popup message
        else if (data.mStatus === "error") {
            window.alert("The server replied with an error:\n" + data.mMessage);
        }
        // Handle other errors with a less-detailed popup message
        else {
            window.alert("Unspecified error "+data.mStatus);
        }
            //taskList.refresh();
            //window.location.replace("https://stacklight.herokuapp.com/project.html?projectID=" + projectID + "&projectName=" + projectName);
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