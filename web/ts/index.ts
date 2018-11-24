// Run some configuration code when the web page loads
const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var projId = 0;
var projectList: ProjectList;
var projects: ProjectList;
var newprojectform: NewProjectForm;

class ProjectList {
    refresh() {
        // assume logged in
        $('#loginBar').text(localStorage.getItem("email"));
        $.ajax({
            type: "GET",
            url: backendUrl + "/projects/all/" + localStorage.getItem("email"),
            dataType: "json",
            success: projects.update
        });
        //$('#loginBar').text(localStorage.getItem("email"));   // why again? -Mira
    }
    private update(data: any) {
        console.log(data);
        for (let i = 0; i < data.mProjectData.length; ++i) {
            $("#projectList").append("\
                <div style='display:inline-block;'>\
                    <form action='/project.html' method='get' id='PID'>\
                        <div class='well project'>\
                            <img src='Images/project.png' class='center' alt='Project'>\
                            <input type='submit' value='" + data.mProjectData[i].mName + "'/>\
                        </div>\
                        <input type='hidden' name='projectID' value='" + data.mProjectData[i].mId + "'/>\
                        <input type='hidden' name='projectName' value='" + data.mProjectData[i].mName + "'/>\
                    </form>\
                </div>");
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
            projId = data.mData;
            $("input.form-control.member").each((index: number, elem: Element) => {
                        $.ajax({
                            type: "POST",
                            url: backendUrl + "/projects/user",
                            dataType: "json",
                            data: JSON.stringify({  mId: projId, mEmail: $(elem).val()})
                        });
                    });
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
