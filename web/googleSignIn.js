$(function () {
    if (auth2.isSignedIn.get()) {
        var profile = auth2.currentUser.get().getBasicProfile();
        $('#loginBar').text(profile.getEmail());
    }
});