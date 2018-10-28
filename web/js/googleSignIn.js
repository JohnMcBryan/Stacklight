$(function () {
    gapi.load('auth2', function() {
      auth2 = gapi.auth2.init({
        client_id: '797190126682-g4g57tc49te2j0dt30k3hjldhc9u0jhd.apps.googleusercontent.com',
        fetch_basic_profile: false,
        scope: 'profile'
      });

      // Sign the user in, and then retrieve their ID.
      auth2.signIn().then(function() {
      var profile = auth2.currentUser.get().getBasicProfile();
      $('#loginBar').text(profile.getEmail());
      });
    });
});