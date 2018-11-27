///<reference path="app.ts" />

// The 'this' keyword does not behave in JavaScript/TypeScript like it does in
// Java.  Since there is only one NewEntryForm, we will save it to a global, so
// that we can reference it from methods of the NewEntryForm in situations where
// 'this' won't work correctly.
var FileUpload: fileUpload;
var fileList: FileList2;
var subFileList: SubFileList;
var taskId: any;        // assigned in refresh()

class SubFileList{
    refresh() {
        $.ajax({
            type: "GET",
            url: backendUrl + "/file/sub",
            dataType: "json",
            success: subFileList.update
        });
    }
    private update(data: any) {
        $("#subFileList").html("<table>");
        for (let i = 0; i < data.mData.length; ++i) {
            let sub = "sub-"+data.mData[i].mId;
            $("#subFileList").append("<tr><td>ID: " + data.mData[i].mId +" </td><td>PID: "+data.mData[i].mpid+" </td><td> File Name: "+data.mData[i].mfileName+" </td><td> File ID: "+data.mData[i].mfileId+" </td><td><a href= \"https://stacklight.herokuapp.com/download/"+data.mData[i].mfileId+"\" download = \""+data.mData[i].mfileName+"\">Export</a></td>");
        }
    }
}

class FileList2 {
    private download(data:String){
        alert("Infunction");
    }
    refresh(id: any) {
        taskId = id;        // save for update()
        $.ajax({
            type: "GET",
            url: backendUrl + "/file/"+taskId,
            dataType: "json",
            success: fileList.update
        });
    }
    /**
     * update is the private method used by refresh() to update fileList
     */
    private update(data: any) {
        $("#fileList").html("<table>");

        for (let i = 0; i < data.mData.length; ++i) {
            let f=data.mData[i];        // next file
            let sub = "sub-"+f.mId;
            let star = f.mStatus;
            console.log("File: "+f.mfileName+" Star: "+star);

            $("#fileList").append(
            "<tr>"
                +"<td>mId: " + f.mId +" </td>"
                +"<td>File Name: " +f.mfileName +" </td>"
                +"<td>mfileId: " +f.mfileId +" </td>"
                +"<td><a href= \"https://stacklight.herokuapp.com/download/"+f.mfileId +"\" download = \""
                    +f.mfileName+"\">Export</a></td>"
                +"<td><div id = star-" +f.mId +" name = starButton></div></td>"
            +"</tr>");
            $("#star-"+f.mId).replaceWith("<input type='submit' value='Star' id='starButton' onClick='starFile("+f.mId+")'/>");
        }
        
        /*
        $(".upload").click( function(this:HTMLButtonElement){
            let pid = "" + this.id;
            alert(pid);
            let file = $("#upload-"+pid)[0].files[0];
            //let fileName = $("#fileName").val();
            var formData = new FormData();
            var fileName = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '');
            console.log("fileName:" + fileName);
            formData.append('mFile', file);
            formData.append('mFileName',fileName);
            formData.append('mPid',pid);
            let url = "/file/sub/"+pid;
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
        */
    }
    private updateSub(data: any) {
        let pid = data.mData.mpid;
        $("#sub-"+pid).html("<table>");
        //alert("#sub-"+pid);
        for (let i = 0; i < data.mData.length; ++i) {
            let sub = "sub-"+data.mData[i].mId;
            $("#fileList").append("<tr><td>ID: " + data.mData[i].mId +" </td><td>PID: "+data.mData[i].mpid+" </td><td> File Name: "+data.mData[i].mfileName+" </td><td> File ID: "+data.mData[i].mfileId+" </td><td><a href= \"https://stacklight.herokuapp.com/download/"+data.mData[i].mfileId+"\" download = \""+data.mData[i].mfileName+"\">Export</a></td>");
        }
    }
    
}
function starFile(fileID: any){
    $.ajax({
        type: "POST",
        url: backendUrl + "/file/star",
        dataType: "json",
        data: JSON.stringify({mFileId: fileID}),
        success: fileList.refresh(taskId),
    });

}

class fileUpload{

    constructor() {
        $("#addFile").click(this.upload);
    }

    private upload(data:any)
    {
        let file = $("#fileUpload")[0].files[0];
        var formData = new FormData();
        formData.append('mFile', file);
        formData.append('mFileName',file.name);
        formData.append('mTaskID',taskId);
        //console.log(formData);
        $.ajax({
            type: "POST",
            url: backendUrl + "/file",
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
            fileList.refresh(taskId);
        }
}
