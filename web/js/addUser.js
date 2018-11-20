$(function () {
    $('#addFormButton').click(addUser);
    $('#addUserButton').click(submit);
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