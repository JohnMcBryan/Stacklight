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
});