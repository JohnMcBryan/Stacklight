const backendUrl = "https://stacklight.herokuapp.com";

$(function () {
    $.ajax({
        type: "GET",
        url: backendUrl + "/usersEmail/" + localStorage.getItem("email"),
        success: function (result) {
            console.log("User check sent");
            $(".bodyDiv").append("<div>" + result.mFirstName + result.mLastName + "</div>")
            $(".bodyDiv").append("<div>" + localStorage.getItem("email") + "</div>")
        },
    });
    $.ajax({
         type: "GET",
         url: backendUrl + "/projects/all/" + localStorage.getItem("email"),
         dataType: "json",
         success: function (result){
            for (var i = 0; i < result.mProjectData.length; ++i) {
                       $(".projects").append("<div>" + result.mProjectData[i].mName + "</div>");
            }
         },
    });
});