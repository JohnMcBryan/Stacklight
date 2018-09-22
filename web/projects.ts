// Run some configuration code when the web page loads
const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var projectList: ProjectList;
var newprojectform: NewProjectForm;

class ProjectList {
    refresh() {
        $.ajax({
            type: "GET",
            url: backendUrl + "/projects/all",
            dataType: "json",
            success: projectList.update
        });
    }
    private update(data: any) {
        $("#projectList").html("<table>");
        console.log(data);
        for (let i = 0; i < data.mProjectData.length; ++i) {
            $("#projectList").append("<tr><td>"+data.mProjectData[i].mId+". </td><td> <b> " +data.mProjectData[i].mName+" :</b></td><td> " +data.mProjectData[i].mDescription+"</td><td><div id = project-"+data.mProjectData[i].mId+" name = tasksLink></div></td><tr>");
            
            $("#project-"+data.mProjectData[i].mId).replaceWith("<form action= 'https://stacklight.herokuapp.com/tasks.html' id = 'PID'><input type='submit' value='To Task Page' /><input type= 'hidden' name= 'projectID' value='"+data.mProjectData[i].mId+"' /></form>");
        }
    }
}
class NewProjectForm{
    constructor() {
        $("#addButton").click(this.submitForm);
    }
    submitForm() {
        let name = "" + $("#name").val();
        let description = "" + $("#description").val();
        let owner = $("#owner").val();
        let organization = "" + $("#organization").val();

        if (name === "" || description === "") {
            window.alert("Error: Project is not valid");
            return;
        }
        // set up an AJAX post.  When the server replies, the result will go to
        // onSubmitResponse
        $.ajax({
            type: "POST",
            url: backendUrl + "/projects",
            dataType: "json",
            data: JSON.stringify({  mName: name, mDescription: description,
            mOwner: owner, mOrganization: organization}),
            success: newprojectform.onSubmitResponse,
            error: newprojectform.onSubmitResponse
        });
    }

    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            console.log("Project Added Sucessfully!");
            projectList.refresh();
            window.location.replace("https://stacklight.herokuapp.com/");
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
    console.log("Loading Projects Page.......");
    
    projectList = new ProjectList();
    newprojectform = new NewProjectForm();
    
    projectList.refresh();
});