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
            success: projects.update,
            error: projects.update
        });
        //$('#loginBar').text(localStorage.getItem("email"));   // why again? -Mira
    }
    private update(data: any) {
        var list: any;
        list = "";
        list += '<div style="display:inline-block;">\
                    <form>\
                    <button type="button" class="btn btn-primary btn-lg">\
                        <div data-toggle="modal" data-target="#createProject">\
                            <img src="Images/newproject.png" class="center" alt="Create Project">\
                            <p><h3>Create Project</h3></p>\
                        </div>\
                    </div>\
                    </form>\
                 </div>';
        if (data)
        {
            for (let i = 0; i < data.mProjectData.length; ++i) {
                list += "<div style='display:inline-block;'>\
                    <form action='/project.html' method='get' id='PID'>\
                        <button type='submit' class='btn btn-primary btn-lg'>\
                            <img src='Images/project.png' class='center' alt='Project'>\
                            <p><h3>" + data.mProjectData[i].mName + "</h3></p>\
                        </button>\
                        <input type='hidden' name='projectID' value='" + data.mProjectData[i].mId + "'/>\
                        <input type='hidden' name='projectName' value='" + data.mProjectData[i].mName + "'/>\
                    </form>\
                </div>&nbsp;";
            }
            $("#projectList").html(list);
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

        if (name === "") {
            window.alert("Project name is required");
            return;
        }
        if (description === "") {
            window.alert("Description is required");
            return;
        }
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(owner))
        {
            // ignore
        }
        else
        {
            window.alert("A valid email is required");
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
            $.ajax({
                 type: "POST",
                 url: backendUrl + "/projects/user",
                 dataType: "json",
                 data: JSON.stringify({  mId: projId, mEmail: $("input#owner.form-control").val()})
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
