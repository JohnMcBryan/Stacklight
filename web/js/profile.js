$(function () {
    $.ajax({
        type: "GET",
        url: backendUrl + "/usersEmail/" + localStorage.getItem("email"),
        success: function (result) {
            console.log("User check sent");
            $("#name").append("<div>&nbsp;&nbsp;&nbsp;&nbsp;" + result.mFirstName + " " + result.mLastName + "</div>")
            $("#email").append("<div>&nbsp;&nbsp;&nbsp;&nbsp;" + localStorage.getItem("email") + "</div>")
        },
    });
    $.ajax({
         type: "GET",
         url: backendUrl + "/projects/all/" + localStorage.getItem("email"),
         dataType: "json",
         success: function (result){
            for (var i = 0; i < result.mProjectData.length; ++i) {
                       $("#projects").append("<div>&nbsp;&nbsp;&nbsp;&nbsp;" + result.mProjectData[i].mName + "</div>");
            }
         },
    });
});