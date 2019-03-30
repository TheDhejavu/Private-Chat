
export default class listController{
    constructor( object){
        this.socketService = object.socket || null;
        this.userdata = object.userdata || null;
        this.recipient = object.recipient || null;
        this.messengers = [];
        this.from = [];
        this.messengerListUL = document.querySelector(".js-messengers-lists");


        this.socketService.incomingNotification( data=>{
           this.setIncomingNotification(data);
        });

        this.socketService.newMessenger( data=>{
            this.appendMessengers(data);
        });

        this.socketService.getMessengerList( this.userdata.messengers ).then((data)=>{
            this.messengers = data;
            this.populateList();
        });

        if(this.recipient){
            const data = {
                sendTo: this.userdata,
                sendBy: this.recipient,
                count:0,
            }
            this.socketService.updateNotification( data);
        }
    }
    status( lastSeen, online){
        return (online)? "online" : moment(lastSeen).fromNow();
    }
    setIncomingNotification( data ){

        const guid = data.id;
        const fromName = data.fromName;
        const count = data.count;

        if(this.recipient && this.recipient.nickname == fromName){

            //update notification in DB if the user is currently chatting with
            //the recipient...
            const data = {
                sendTo: this.userdata,
                sendBy: this.recipient,
                count:0,
            }
            this.socketService.updateNotification( data);

        }else{
            //update incoming notification...
            document.querySelector("[data-name="+fromName+"]").removeAttribute("hidden");
            document.querySelector("[data-name="+fromName+"]").innerHTML = count;
        }

    }


    appendMessengers( lists){
        //re-arrange the messenger list to foster better ways
        //of checking for existing messengers.....
        for(var x in this.messengers){
            const name = this.messengers[x].nickname;
            this.from[name] = [];
            this.from[name].push({});
        }
        //check if incoming messenger exist already...
        for(var i in lists){
            const data = lists[i];

            if(this.from[data.nickname]) continue;
               this.render(data);
        }

    }

    render( data ){
        //add the new messenger to existing ones..
        this.messengers.push(data);

        //render messenger
        let list = document.createElement("li");
        list.className = "frds-list js-messengers-list";
        let html =
            `<a href="/chat/@${data.nickname}" class="flex">
                <img src="/dist/files/${(data.image).replace(/ /g, "")}">
                <div class="frds-content">
                    <h4>${data.nickname}</h4>
                    <p>${ this.status(data.lastSeen, data.online)}</p>
                </div>`
            if(data.count){
              html +=`<span class="msg-notification" data-name="${data.nickname}">${data.count}</span>`
            }
        html +=`</a>`;

        list.innerHTML = html;
        this.messengerListUL.appendChild(list);
    }
    getNotification(data){
        //get notification from DB of the user messenger
        const obj = {
            sendTo: this.userdata,
            sendBy: data,
            count:0,
        }
        //use socket service to get notification from server..
        this.socketService.getNotification( obj);

    }
    populateList(){
        var lists = "";
        for(var i in this.messengers){
            var data = this.messengers[i];
               this.getNotification(data);
                lists +=
                `<li class="frds-list js-messengers-list" >
                    <a href="/chat/@${data.nickname}" class="flex">
                        <img src="/dist/files/${data.image}">
                        <div class="frds-content">
                            <h4>${data.nickname}</h4>
                            <p>${ this.status(data.lastSeen, data.online)}</p>
                        </div>
                   <span class="msg-notification" data-name="${data.nickname}" hidden></span>
                </a>
                </li>`

        }

        this.messengerListUL.innerHTML = lists;

        this.socketService.responseNotification( (values)=>{
            if(values){
                if(values.count === 0) return;
                //set notification of messengers respectively....
                document.querySelector("[data-name="+values.fromName+"]").removeAttribute("hidden");
                document.querySelector("[data-name="+values.fromName+"]").innerHTML = values.count;
            }
        })

    }

}

