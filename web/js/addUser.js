$(function () {
    $('#addFormButton').click(addUser);
    $('#addUserButton').click(submit);
    $('#signOutButton').click(signOut);
    projectID = getUrlParameters.getUrlParameter('projectID');
})

function addUser() {
    $('#members').append('<input type="text" class="formMember">');
}
function submit(){
    $(".formMember").each(function () {
                $.ajax({
                    type: "POST",
                    url: backendUrl + "/projects/user",
                    dataType: "json",
                    data: JSON.stringify({ mId: projectID, mEmail: $(this).val() })
                });
            });
}
function signOut(){
    localStorage.setItem("out", true);
    window.location.href = "https://stacklight.herokuapp.com/index.html";
}