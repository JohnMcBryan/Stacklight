$(function () {
    console.log("On page load for all projects page");
    $('.project').click(goToProject);
});

function goToProject() {
    console.log("in goToProject");
    location.href = "index.html";
}