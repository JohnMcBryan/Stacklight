var backendUrl = "https://stacklight.herokuapp.com";
$(function () {
    console.log("On page load allProjectsPage.js");
    //gapi.load('auth2', function() { // Ready. });
    //$('.project').click(goToProject);
    $('#loginBar').hide();
    //$('.row').hide();
    $('#projectWindow').hide();
    $('#signOutButton').click(signOut);
    if (localStorage.getItem("out") != null){
        $('.g-signin2').show();
        $('#loginBar').hide();
        $('#projectWindow').hide();
    }
    $(".abcRioButtonContentWrapper").css("left", "75%");
    $('#addMemberButton').click(addMember);
})

//function goToProject() {
    //console.log("in goToProject");
    //location.href = "index.html";
//}

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
  var auth2 = gapi.auth2.getAuthInstance();
  localStorage.setItem("auth", auth2);
  $.ajax({
      type: "POST",
      url: backendUrl + "/users",
      data: JSON.stringify({mFirstName: profile.getGivenName(), mLastName: profile.getFamilyName(),
          mEmail: profile.getEmail()}),
      success: function (result) {
          console.log("User check sent");
       },
  });
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    $('#loginBar').text(profile.getEmail());
    $('#loginBar').show();
    //$('.row').show();
    $('#projectWindow').show();
    $('.g-signin2').hide();
    localStorage.setItem("email", profile.getEmail());
    $("#nameProfile").append("<div>&nbsp;&nbsp;&nbsp;&nbsp;" + profile.getGivenName() + " " + profile.getFamilyName() + "</div>")
    $("#email").append("<div>&nbsp;&nbsp;&nbsp;&nbsp;" + profile.getEmail() + "</div>")
    $.ajax({
            type: "GET",
            url: backendUrl + "/projects/all/" + profile.getEmail(),
            dataType: "json",
            success: function (result){
               for (var i = 0; i < result.mProjectData.length; ++i) {
                          $("#projects").append("<div>&nbsp;&nbsp;&nbsp;&nbsp;" + result.mProjectData[i].mName + "</div>");
               }
            },
       });
       if (localStorage.getItem("out") != null){
            localStorage.removeItem("out");
            signOut();
       }
}

function addMember() {
    $('#members').append('<input type="text" class="form-control member">');
}