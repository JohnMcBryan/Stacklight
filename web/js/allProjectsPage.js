var backendUrl = "https://stacklight.herokuapp.com";

$(function () {
    console.log("On page load allProjectsPage.js");
    //gapi.load('auth2', function() { // Ready. });
    //$('.project').click(goToProject);
    $('#loginBar').hide();
    //$('.row').hide();
    $('#projectWindow').hide();
    $('.navbar').click(signOut);
    $(".abcRioButtonContentWrapper").css("left", "75%");
    $('#addMemberButton').click(addMember);
})

//function goToProject() {
    //console.log("in goToProject");
    //location.href = "index.html";
//}

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
    //$('.row').hide();
    $('#projectWindow').hide();
    //$('#loginBar').text("Login");
  }

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  $.ajax({
                   type: "POST",
                   url: backendUrl + "/users",
                   data: JSON.stringify({mFirstName: profile.getGivenName(), mLastName: profile.getFamilyName()
                        , mEmail: profile.getEmail()}),
                  //data: params,
                  success: function (result) {
                      console.log("User check sent");
                  },
              }
      );
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  $('#loginBar').text(profile.getEmail());
  $('#loginBar').show();
  //$('.row').show();
  $('#projectWindow').show();
  $('.g-signin2').hide();
   localStorage.setItem("email", profile.getEmail());
}

function addMember() {
    $('#members').append('<input type="text" class="form-control member">');
}