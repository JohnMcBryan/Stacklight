// Prevent compiler errors when using jQuery.  "$" will be given a type of
// "any", so that we can use it anywhere, and assume it has any fields or
// methods, without the compiler producing an error.
var $: any;

const backendUrl = "https://stacklight.herokuapp.com";

class AppHelper{
    public getUrlParameter(sParam: String) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                var name: String;
                name = sParameterName[1];
                name = name.replace('+',' ');
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }
}
