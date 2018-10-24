// Run some configuration code when the web page loads
const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var projId = 0;
var projectList: ProjectList;
var projects: ProjectList;
var newprojectform: NewProjectForm;

class ProjectList {
    refresh() {
        $('#loginBar').text(localStorage.getItem("email"));
        $.ajax({
            type: "GET",
            url: backendUrl + "/projects/all/" + localStorage.getItem("email"),
            dataType: "json",
            success: projects.update
        });
        $('#loginBar').text(localStorage.getItem("email"));
    }
    private update(data: any) {
        console.log(data);
        for (let i = 0; i < data.mProjectData.length; ++i) {
            $("#projects").append("<div class='col-sm-3'> <form action= 'https://stacklight.herokuapp.com/tasks.html' id='PID'> <div class='well project'> <img src='Images/project.png' class='center' alt='Project'> <input type='submit' value='"+data.mProjectData[i].mName+"'/> </div><input type='hidden' name='projectID' value='"+data.mProjectData[i].mId+"'/></form></div>");
        }
        //for (let i = 0; i < data.mProjectData.length; ++i) {
        //    $("#projectList").append("<tr><td>"+data.mProjectData[i].mId+". </td><td> <b> " +data.mProjectData[i].mName+" :</b></td><td> " +data.mProjectData[i].mDescription+"</td><td><div id = project-"+data.mProjectData[i].mId+" name = projectsLink></div></td><tr>");

        //    $("#project-"+data.mProjectData[i].mId).replaceWith("<form action= 'https://stacklight.herokuapp.com/tasks.html' id='PID'><input type='submit' value='T' /><input type= 'hidden' name= 'projectID' value='"+data.mProjectData[i].mId+"' /></form>");
        //}
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

        $("#member").each(() => {
            $.ajax({
                type: "POST",
                url: backendUrl + "/projects/user",
                dataType: "json",
                data: JSON.stringify({  mId: projId, mEmail: $(this).val()})
            });
        });
    }

    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            projId = data.mData;
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


/*
$(".project").each(function(index) {
    $(this).closest("form").on("click", function(){
        console.log("here");
        $(this).closest("form").submit();
    });
});
*/
