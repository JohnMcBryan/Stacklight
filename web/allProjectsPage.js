var backendUrl = "https://stacklight.herokuapp.com";

$(function () {
    console.log("On page load for all projects page");
    //gapi.load('auth2', function() { // Ready. });
    $('.project').click(goToProject);
    $('#loginBar').hide();
    $('.navbar').click(signOut);
    $(".abcRioButtonContentWrapper").css("left", "75%");
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
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
    $('.g-signin2').show();
    $('#loginBar').hide();
    $('#loginBar').text("Login");
  }

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  $('#loginBar').text(profile.getEmail());
  $('#loginBar').show();
  $('.g-signin2').hide();

  var formData = new FormData();
  formData.append('mFirstName', profile.getGivenName());
  formData.append('mLastName', profile.getFamilyName());
  fromData.append('mEmail', profile.getEmail());

  $.ajax({
    type: "POST",
    url: backendUrl + "/users",
    dataType: "json",      // dataType of response to POST
    data: formData,
    contentType: false,
    processData: false,
    success: console.log('Sent');
    });
}