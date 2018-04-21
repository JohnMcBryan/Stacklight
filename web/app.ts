// Prevent compiler errors when using jQuery.  "$" will be given a type of
// "any", so that we can use it anywhere, and assume it has any fields or
// methods, without the compiler producing an error.
var $: any;

// The 'this' keyword does not behave in JavaScript/TypeScript like it does in
// Java.  Since there is only one NewEntryForm, we will save it to a global, so
// that we can reference it from methods of the NewEntryForm in situations where
// 'this' won't work correctly.
var FileUpload: fileUpload;
var fileList: FileList2;
var subFileList: SubFileList;

class SubFileList{
    refresh() {
        $.ajax({
            type: "GET",
            url: "/file/sub",
            dataType: "json",
            success: subFileList.update
        });
    }
    private update(data: any) {
        $("#subFileList").html("<table>");
        for (let i = 0; i < data.mData.length; ++i) {
            let sub = "sub-"+data.mData[i].mId;
            $("#subFileList").append("<tr><td>ID: " + data.mData[i].mId +" </td><td>PID: "+data.mData[i].mpid+" </td><td> File Name: "+data.mData[i].mfileName+" </td><td> File ID: "+data.mData[i].mfileId+" </td><td><a href= \"https://stoplight-test.herokuapp.com/download/"+data.mData[i].mfileId+"\" download = \""+data.mData[i].mfileName+"\">Export</a></td>");
        }
    }


}
class FileList2 {
    private download(data:String){
        alert("Infunction");
    }
    refresh() {
        $.ajax({
            type: "GET",
            url: "/file",
            dataType: "json",
            success: fileList.update
        });
    }
    /**
     * update is the private method used by refresh() to update messageList
     */
    private update(data: any) {
        $("#fileList").html("<table>");

        for (let i = 0; i < data.mData.length; ++i) {
            let sub = "sub-"+data.mData[i].mId;
            $("#fileList").append("<tr><td>ID: " + data.mData[i].mId +" </td><td> File Name: "+data.mData[i].mfileName+" </td><td> File ID: "+data.mData[i].mfileId+" </td><td><a href= \"https://stoplight-test.herokuapp.com/download/"+data.mData[i].mfileId+"\" download = \""+data.mData[i].mfileName+"\">Export</a></td><td><input type= \"file\" id= \"upload-"+data.mData[i].mfileId+"\" /></td><td><button class = \"upload\" id = \""+data.mData[i].mId+"\">Upload</button></td></tr><tr><td><div id = \""+sub+"\"></div></td></tr><tr></tr>");
            /*
            $.ajax({
                type: "GET",
                url: "/file/"+data.mData[i].mId,
                dataType: "json",
                success: fileList.updateSub
            });
            */
        }
        
        $(".upload").click( function(this:HTMLButtonElement){
            let pid = "" + this.id;
            alert(pid);
            let file = $("#upload-"+pid)[0].files[0];
            //let fileName = $("#fileName").val();
            var formData = new FormData();
            var fileName = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '');
            formData.append('mFile', file);
            formData.append('mFileName',fileName);
            formData.append('mPid',pid);
            let url = "/file/sub/"+pid;
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                data: formData,
                contentType: false,
                processData: false,
                success: fileList.update
            });
        });
    }
    private updateSub(data: any) {
        let pid = data.mData.mpid;
        $("#sub-"+pid).html("<table>");
        //alert("#sub-"+pid);
        for (let i = 0; i < data.mData.length; ++i) {
            let sub = "sub-"+data.mData[i].mId;
            $("#fileList").append("<tr><td>ID: " + data.mData[i].mId +" </td><td>PID: "+data.mData[i].mpid+" </td><td> File Name: "+data.mData[i].mfileName+" </td><td> File ID: "+data.mData[i].mfileId+" </td><td><a href= \"https://stoplight-test.herokuapp.com/download/"+data.mData[i].mfileId+"\" download = \""+data.mData[i].mfileName+"\">Export</a></td>");
        }
    }
    
}

class fileUpload{

    constructor() {
        $("#addFile").click(this.upload);
    }

    private upload(data:any)
    {
        let file = $("#fileUpload")[0].files[0];
        //let fileName = $("#fileName").val();
        var formData = new FormData();
        var fileName = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '')
        formData.append('mFile', file);
        formData.append('mFileName',fileName);

        $.ajax({
            type: "POST",
            url: "/file",
            dataType: "json",      // dataType of response to POST
            data: formData,
            contentType: false,
            processData: false,
            success: fileUpload.onSubmitResponse
        });
    }
    /**
         * onSubmitResponse runs when the AJAX call in submitForm() returns a 
         * result.
         * 
         * @param data The object returned by the server
         */
        private static onSubmitResponse(data: any) {
            fileList = new FileList2();
            fileList.refresh();
        }
}



// Run some configuration code when the web page loads
$(document).ready(function () {
    // Create the object that controls the "New Entry" form
    FileUpload = new fileUpload();
    fileList = new FileList2();
    subFileList = new SubFileList();

    fileList.refresh();
    subFileList.refresh();
});