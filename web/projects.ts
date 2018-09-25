// Run some configuration code when the web page loads
const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var projects: ProjectList;
var newprojectform: NewProjectForm;

class ProjectList {
    refresh() {
        $.ajax({
            type: "GET",
            url: backendUrl + "/projects/all",
            dataType: "json",
            success: projects.update
        });
    }
    private update(data: any) {
        console.log(data);
        for (let i = 0; i < data.mProjectData.length; ++i) {
            $("#projects").append("<a href='https://stacklight.herokuapp.com/?id=1'> <div class='col-sm-3'> <div class='well project'> <img src='Images/project.png' class='center' alt='Project'> <div class='name'>" + data.mProjectData[i].mName + "</div> </div> <input type= 'hidden' name= 'projectID' value='"+data.mProjectData[i].mId+ "'/>" + " </div></a>");
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
            projects.refresh();
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
    
    projects = new ProjectList();
    newprojectform = new NewProjectForm();
    
    projects.refresh();
});

