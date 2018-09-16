"use strict";
// Prevent compiler errors when using jQuery.  "$" will be given a type of
// "any", so that we can use it anywhere, and assume it has any fields or
// methods, without the compiler producing an error.
var $;
// The 'this' keyword does not behave in JavaScript/TypeScript like it does in
// Java.  Since there is only one NewEntryForm, we will save it to a global, so
// that we can reference it from methods of the NewEntryForm in situations where
// 'this' won't work correctly.
var FileUpload;
var fileList;
var subFileList;
var backendUrl = "https://stoplight-test.herokuapp.com";
var SubFileList = /** @class */ (function () {
    function SubFileList() {
    }
    SubFileList.prototype.refresh = function () {
        $.ajax({
            type: "GET",
            url: backendUrl + "/file/sub",
            dataType: "json",
            success: subFileList.update
        });
    };
    SubFileList.prototype.update = function (data) {
        $("#subFileList").html("<table>");
        for (var i = 0; i < data.mData.length; ++i) {
            var sub = "sub-" + data.mData[i].mId;
            $("#subFileList").append("<tr><td>ID: " + data.mData[i].mId + " </td><td>PID: " + data.mData[i].mpid + " </td><td> File Name: " + data.mData[i].mfileName + " </td><td> File ID: " + data.mData[i].mfileId + " </td><td><a href= \"https://stoplight-test.herokuapp.com/download/" + data.mData[i].mfileId + "\" download = \"" + data.mData[i].mfileName + "\">Export</a></td>");
        }
    };
    return SubFileList;
}());
var FileList2 = /** @class */ (function () {
    function FileList2() {
    }
    FileList2.prototype.download = function (data) {
        alert("Infunction");
    };
    FileList2.prototype.refresh = function () {
        $.ajax({
            type: "GET",
            url: backendUrl + "/file",
            dataType: "json",
            success: fileList.update
        });
    };
    /**
     * update is the private method used by refresh() to update messageList
     */
    FileList2.prototype.update = function (data) {
        $("#fileList").html("<table>");
        for (var i = 0; i < data.mData.length; ++i) {
            var sub = "sub-" + data.mData[i].mId;
            $("#fileList").append("<tr><td>ID: " + data.mData[i].mId + " </td><td> File Name: " + data.mData[i].mfileName + " </td><td> File ID: " + data.mData[i].mfileId + " </td><td><a href= \"https://stoplight-test.herokuapp.com/download/" + data.mData[i].mfileId + "\" download = \"" + data.mData[i].mfileName + "\">Export</a></td><td><input type= \"file\" id= \"upload-" + data.mData[i].mfileId + "\" /></td><td><button class = \"upload\" id = \"" + data.mData[i].mId + "\">Upload</button></td></tr><tr><td><div id = \"" + sub + "\"></div></td></tr><tr></tr>");
            /*
            $.ajax({
                type: "GET",
                url: backendUrl + "/file/"+data.mData[i].mId,
                dataType: "json",
                success: fileList.updateSub
            });
            */
        }
        $(".upload").click(function () {
            var pid = "" + this.id;
            alert(pid);
            var file = $("#upload-" + pid)[0].files[0];
            //let fileName = $("#fileName").val();
            var formData = new FormData();
            var fileName = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '');
            formData.append('mFile', file);
            formData.append('mFileName', fileName);
            formData.append('mPid', pid);
            var url = "/file/sub/" + pid;
            $.ajax({
                type: "POST",
                url: backendUrl + url,
                dataType: "json",
                data: formData,
                contentType: false,
                processData: false,
                success: fileList.update
            });
        });
    };
    FileList2.prototype.updateSub = function (data) {
        var pid = data.mData.mpid;
        $("#sub-" + pid).html("<table>");
        //alert("#sub-"+pid);
        for (var i = 0; i < data.mData.length; ++i) {
            var sub = "sub-" + data.mData[i].mId;
            $("#fileList").append("<tr><td>ID: " + data.mData[i].mId + " </td><td>PID: " + data.mData[i].mpid + " </td><td> File Name: " + data.mData[i].mfileName + " </td><td> File ID: " + data.mData[i].mfileId + " </td><td><a href= \"https://stoplight-test.herokuapp.com/download/" + data.mData[i].mfileId + "\" download = \"" + data.mData[i].mfileName + "\">Export</a></td>");
        }
    };
    return FileList2;
}());
var fileUpload = /** @class */ (function () {
    function fileUpload() {
        $("#addFile").click(this.upload);
    }
    fileUpload.prototype.upload = function (data) {
        var file = $("#fileUpload")[0].files[0];
        //let fileName = $("#fileName").val();
        var formData = new FormData();
        var fileName = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '');
        formData.append('mFile', file);
        formData.append('mFileName', fileName);
        $.ajax({
            type: "POST",
            url: backendUrl + "/file",
            dataType: "json",
            data: formData,
            contentType: false,
            processData: false,
            success: fileUpload.onSubmitResponse
        });
    };
    /**
         * onSubmitResponse runs when the AJAX call in submitForm() returns a
         * result.
         *
         * @param data The object returned by the server
         */
    fileUpload.onSubmitResponse = function (data) {
        fileList = new FileList2();
        fileList.refresh();
    };
    return fileUpload;
}());
// Run some configuration code when the web page loads
$(document).ready(function () {
    // Create the object that controls the "New Entry" form
    FileUpload = new fileUpload();
    fileList = new FileList2();
    subFileList = new SubFileList();
    fileList.refresh();
    subFileList.refresh();
});
