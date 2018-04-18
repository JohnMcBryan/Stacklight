// Prevent compiler errors when using jQuery.  "$" will be given a type of
// "any", so that we can use it anywhere, and assume it has any fields or
// methods, without the compiler producing an error.
var $: any;

// The 'this' keyword does not behave in JavaScript/TypeScript like it does in
// Java.  Since there is only one NewEntryForm, we will save it to a global, so
// that we can reference it from methods of the NewEntryForm in situations where
// 'this' won't work correctly.
var newEntryForm: NewEntryForm;
var FileUpload: fileUpload;
var fileList: FileList2;

/**
 * NewEntryForm encapsulates all of the code for the form for adding an entry
 */
class NewEntryForm {
    /**
     * To initialize the object, we say what method of NewEntryForm should be
     * run in response to each of the form's buttons being clicked.
     */
    constructor() {
        $("#addCancel").click(this.clearForm);
        $("#addButton").click(this.submitForm);
    }

    /**
     * Clear the form's input fields
     */
    clearForm() {
        $("#newName").val("");
        $("#newMessage").val("");
    }

    /**
     * Check if the input fields are both valid, and if so, do an AJAX call.
     */
    submitForm() {
        // get the values of the two fields, force them to be strings, and check
        // that neither is empty
        let name = "" + $("#newName").val();
        
        if (name === "") {
            window.alert("Error: Name not Valid");
            return;
        }
        // set up an AJAX post.  When the server replies, the result will go to
        // onSubmitResponse
        $.ajax({
            type: "POST",
            url: "/messages",
            dataType: "json",
            data: JSON.stringify({ mName: name}),
            success: newEntryForm.onSubmitResponse
        });
    }

    /**
     * onSubmitResponse runs when the AJAX call in submitForm() returns a
     * result.
     *
     * @param data The object returned by the server
     */
    private onSubmitResponse(data: any) {
        // If we get an "ok" message, clear the form
        if (data.mStatus === "ok") {
            newEntryForm.clearForm();
        }
        // Handle explicit errors with a detailed popup message
        else if (data.mStatus === "error") {
            window.alert("The server replied with an error:\n" + data.mMessage);
        }
        // Handle other errors with a less-detailed popup message
        else {
            window.alert("Unspecified error");
        }
    }
} // end class NewEntryForm

// a global for the main ElementList of the program.  See newEntryForm for
// explanation
var mainList: ElementList;

/**
 * ElementList provides a way of seeing all of the data stored on the server.
 */
class ElementList {
    /**
     * refresh is the public method for updating messageList
     */
    refresh() {
        // Issue a GET, and then pass the result to update()
        $.ajax({
            type: "GET",
            url: "/messages",
            dataType: "json",
            success: mainList.update
        });
    }
    /**
     * update is the private method used by refresh() to update messageList
     */
    private update(data: any) {
        $("#messageList").html("<table>");
        var sizes = ["12", "22","13", "25"]
        
        for (let i = 0; i < data.mData.length; ++i) {
            $("#messageList").append("<tr><td>ID: " + data.mData[i].mId +" </td><td> Name: "+data.mData[i].mName+" </td> <td> Sizes: "+sizes[i]+"</td></tr>");
        }
    }
    /**
     * buttons() doesn't do anything yet
     */
    private buttons(id: string): string {
        return "";
    }
}

class FileList2 {
    private download(data:String){
        alert("Infunction");
    }
    refresh() {
        $.ajax({
            type: "GET",
            url: "/messages/file",
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
            $("#fileList").append("<tr><td>ID: " + data.mData[i].mId +" </td><td> File Name: "+data.mData[i].mfileName+" </td><td> File ID: "+data.mData[i].mfileId+" </td><td><button class = \"download\" id = \""+data.mData[i].mfileId+"\"> Download </button></td>");
        }

        $(".download").click( function(this:HTMLButtonElement){
            let id = "" + this.id;
            if (id === "") {
                window.alert("Error: Name not Valid");
                return;
            }
            var formData = new FormData();
            formData.append('mId', id);
    
            // set up an AJAX post.  When the server replies, the result will go to
            // onSubmitResponse
            $.ajax({
                type: "POST",
                url: "/download",
                dataType: "json",
                data: formData,
                contentType: false,
                processData: false,
                success: fileList.update
            });
        })
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
            url: "/messages/file",
            //url: "https://forums.wholetomato.com/mira/echo.aspx",
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
            mainList = new ElementList();
            mainList.refresh();
        }
}



// Run some configuration code when the web page loads
$(document).ready(function () {
    // Create the object that controls the "New Entry" form
    newEntryForm = new NewEntryForm();
    FileUpload = new fileUpload();
    mainList = new ElementList();
    fileList = new FileList2();

    mainList.refresh();
    fileList.refresh();
});