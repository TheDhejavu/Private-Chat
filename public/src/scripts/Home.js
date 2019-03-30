import ChatController from "./controllers/chatController";
import AuthController from "./controllers/AuthController";
import ListController from "./controllers/listController";
import SocketService from "./helpers/services/SocketService";
import HttpServiceInstance from "./helpers/services/HttpService";
import localStorageInstance from "./utils/localStorage";
import helpers from  "./helpers/helpers";
import RouterInstance from "./utils/Router"

class chat{
    constructor(){
        const Authentication = new AuthController();
        this.socket = new SocketService();
        this.Helpers = new helpers();
        this.user = null;
        this.recipient = null;

        window.requestAnimationFrame(()=>{

            this.managePageState();

            Authentication.authLoggedOutResponse( this.socket );
            Authentication.logout( this.socket );
        });
    }
    managePageState(){
        RouterInstance().then(( router )=>{

            router.config({mode: "history"})
            let param = router.getPath().split("/");
            let page = param.shift();
            param = param[0];




            const recipientParams = {
                nickname: param,
                xmlhttp: "Y"
            }


            requestAnimationFrame(()=>{

                HttpServiceInstance().then(( httpService )=>{

                    this.Helpers.getUserData().then(( user )=>{

                        httpService.checkUserExist(recipientParams).then(( recipient )=>{

                            if(user.error){
                                 console.log("user does not exist")
                            }else if(user.nickname == recipient.data.nickname){
                                window.location.href  = "/find";
                            }else{


                                    new ChatController( {
                                        socket: this.socket,
                                        userdata: user,
                                        recipient: recipient.data ,
                                        urlParam: param
                                    });

                                    new ListController( {
                                        socket: this.socket,
                                        userdata: user,
                                        recipient: recipient.data
                                    });


                            }
                        })

                    })
                    })
                })
            })
    }
}


new chat();