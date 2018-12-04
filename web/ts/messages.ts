const backendUrl = "https://stacklight.herokuapp.com";
var $: any;
var helper: HelperTask;
var projectID: any;
var newMessage: NewMessageForm;
var messageInfo: MessageInfo;
var owner: any;
class MessageInfo {
    refresh() {
        $.ajax({
            type: "GET",
            url: backendUrl + "/messages/"+ projectID,
            dataType: "json",
            success: messageInfo.update
        });
    }
    public update(data: any) {
        var list: any;
        list = '<table class="table"><tbody><script src="js/messages.ts"></script>';
        for (let i = 0; i < data.mMessageData.length; ++i) {
            list += '<tr class="table-primary">';
                list += '<th scope="row">' + data.mMessageData[i].mOwner + '</th>';
                list += '<td>' + data.mMessageData[i].mContent + '</td>';
                list += '<td>';
                    list += '<button class="btn btn-primary btn-sm" onclick="messageInfo.deleteMessage(this, ' + data.mMessageData[i].mId + ')" title="Toggle detail"><i class="fas fa-lg fa-times"></i></button>&nbsp;';
                list += '</td>';
            list += '</tr>';
        }
        list += "</tbody></table>";
        $("#messageList").html(list);
        //console.log(data);
    }

    public deleteMessage(element:any, messageId:any) {
        $.ajax({
            type: "DELETE",
            url: backendUrl + "/messages",
            dataType: "json",
            data: JSON.stringify({ mId: messageId}),
            success: messageInfo.refresh,
            error: messageInfo.refresh,
         });
    }
}



class NewMessageForm {
    constructor() {
        $("#addMessage").click(this.submitForm);
    }
    submitForm() {
        let content = "" + $("#message").val();

        if (content === "" ) {
        return;
        }

        $.ajax({
            type: "POST",
            url: backendUrl + "/messages",
            dataType: "json",
            data: JSON.stringify({ mProjectId: projectID, mContent: content,
            mOwner: owner}),
            success: messageInfo.refresh,
            error: messageInfo.refresh
        });
        $("#message").val("");
    }

}

class HelperTask{
    public getUrlParameter(sParam: String) {
        console.log("sParam: " + sParam);
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        console.log("sPageURL: " + sPageURL);
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            console.log("sParameterName: " + sParameterName);

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }

}


$(document).ready(function () {
    console.log("Loading Task Page.......");

    messageInfo = new MessageInfo();
    newMessage= new NewMessageForm();
    helper = new HelperTask();
    projectID = helper.getUrlParameter('projectID');
    $('.login').text(localStorage.getItem("email"));
    owner = localStorage.getItem("email");

    console.log("Owner: "+owner);
    messageInfo.refresh();
});