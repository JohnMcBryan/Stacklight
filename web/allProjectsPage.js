$(function () {
    console.log("On page load for all projects page");
    //gapi.load('auth2', function() { // Ready. });
    $('.project').click(goToProject);
    $('.navbar').click(login);
});

function goToProject() {
    location.href = "index.html";
}
// Utility method for encapsulating the jQuery Ajax Call
function doAjaxCall(method, cmd, params, fcn) {
    $.ajax(
            SERVER + cmd,
            {
                type: method,
                processData: true,
                data: JSON.stringify(params),
                //data: params,
                dataType: "json",
                success: function (result) {
                    fcn(result)
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("params: "+params);
                    console.log("Error: " + jqXHR.responseText);
                    console.log("Error: " + textStatus);
                    console.log("Error: " + errorThrown);
                }
            }
    );
}

function login(){
    /*gapi.auth2.init();
    var auth = gapi.auth2.getAuthInstance();
    var id_token = GoogleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    doAjaxCall("GET", "/tokensignin/1",{},function (result) {
                                                  console.log("result: "+result);
                                                  console.log(result.success);
                                                  console.log(result.outputstream);
                                              });*/
}