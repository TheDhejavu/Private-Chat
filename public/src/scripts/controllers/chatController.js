import Controller from './Controller';
import HttpServiceInstance from "../helpers/services/HttpService";
import localStorageInstance from '../utils/localStorage';

export default class ChatController extends Controller{
    constructor( object ){
        super();
        this.messages = {};
        this.socketService = object.socket || null;
        this.sender = object.userdata || null;
        this.recipient = object.recipient || null;
        this.urlParam = object.urlParam || null;

        this.message = document.querySelector(".js-message");
        this.chatPanel = document.querySelector(".js-chat-interface-panel");

        this.socketService.recieveMessage( data=>{
            if(data.recipient && this.recipient && this.recipient.nickname !== data.recipient.nickname)
            return;

            this.recipient = (data.recipient)? data.recipient : this.recipient;
            const result = (data.result)? data.result : data;
            this.appendMessage(result);
        });

        this.socketService.recieveBroadCast( data=>{
            if(data.recipient && this.recipient && this.recipient.nickname !== data.recipient.nickname)
            return;

            this.recipient = (data.recipient)? data.recipient : this.recipient;
            const result = (data.result)? data.result : data;
            this.appendMessage(result);
        });


        this.manageChatState();
    }
    static makeID () {
        var id = '';
        for (var i = 0; i < 20; i++) {
          id += Number(Math.floor(Math.random() * 20)).toString(20);
        }
        return id
    }

    appendMessage( data ){
        const elem = document.createElement("div");
        let message = "";

        if(data.sendById !== this.sender._id){
        message +=
        `<div class="chat-container transparent-in">
            <div class="chat flex">
            <img src="/dist/files/${this.recipient.image}">
                    <div class="chat-main">
                        <p class="name" >${this.recipient.nickname}</p>
                        <div class="chat-content">${data.body}</div>
                        <p class="date float-right" hidden>${moment(data.date).fromNow()}</p>
                </div>
            </div>
       </div>
        `
    }else{
        message +=
        `<div class="chat-container transparent-in">
         <div class="chat flex float-right">
                <div class="chat-main">
                    <div class="name-right-container">
                        <p class="name name-right" >${this.sender.nickname}</p>
                    </div>
                    <div class="chat-content">${data.body}</div>
                    <p class="date" hidden>${moment(data.date).fromNow()}</p>
                </div>
                <img src="/dist/files/${this.sender.image}">
        </div>
        </div>`
    }

    elem.innerHTML = message;
    this.chatPanel.appendChild(elem);
    this.chatPanel.scrollTop = this.chatPanel.scrollHeight + 60;
    }
    broadCast(e, selectedList){
        const messageval = this.message.value;

        if(messageval === '') {
			alert(`Message can't be empty.`);
		}else if(!selectedList.length >= 1){
            alert(`No user selected`);
        }else{

            const data = {
                broadCastTo:selectedList,
                sendBy: this.sender,
                body: messageval
            }


           this.socketService.sendBroadcast(data);
           this.message.value = "";
        }
    }
    sendMessage(e){
        const messageval = this.message.value;

        if(messageval === '' ) {
			alert(`Message can't be empty.`);
		}else{
            const data = {
                sendTo: this.recipient,
                sendBy: this.sender,
                body: messageval,
            }


           this.socketService.sendMessage(data);
           this.message.value = "";

        }
    }
    populateMessages( ){
        let message = "";
        for(var i in this.messages ){

            if(this.messages[i].sendById !== this.sender._id){
                message +=
                `<div class="chat-container transparent-in">
                    <div class="chat flex">
                        <img src="/dist/files/${this.recipient.image}">
                            <div class="chat-main">
                                <p class="name" >${this.recipient.nickname}</p>
                                <div class="chat-content">${this.messages[i].body}</div>
                                <p class="date float-right" hidden>${moment(this.messages[i].date).fromNow()}</p>
                        </div>
                    </div>
            </div>
                `

            }else{
                message +=
                `<div class="chat-container transparent-in">
                <div class="chat flex float-right">
                        <div class="chat-main">
                            <div class="name-right-container">
                            <p class="name name-right" >${this.sender.nickname}</p>
                            </div>
                            <div class="chat-content">${this.messages[i].body}</div>
                            <p class="date" hidden>${moment(this.messages[i].date).fromNow()}</p>
                        </div>
                    <img src="/dist/files/${this.sender.image}">
                </div>
                </div>`
            }

        }


        this.chatPanel.innerHTML = message;
        this.chatPanel.scrollTop = this.chatPanel.scrollHeight;

        setTimeout(function(){

            var chats = document.querySelectorAll(".chat-container");
            for(var l=0; l< chats.length; l++){
              chats[l].classList.remove("transparent-in");
            }

        }, 1000);
    }
    populateRecipientDetails(){
         const nickname = document.querySelector(".js-nickname");
         nickname.innerHTML = this.recipient.nickname;
    }
    manageChatState(){
        if(this.recipient == null) return;

        const messageParams = {
            nickname: this.urlParam,
            _id: ChatController.makeID()
        }

        this.populateRecipientDetails();

        this.addEventListeners();
        HttpServiceInstance().then(( httpService )=>{

            httpService.getMessages(messageParams).then(( results )=>{
                this.messages = results
                this.populateMessages();
           });

        })




    }

    addEventListeners(){
       const sendButton = document.querySelector(".js-send-button");

        sendButton.addEventListener("click", (e)=>{
            e.preventDefault();
            this.sendMessage(e);
        });

    }
}