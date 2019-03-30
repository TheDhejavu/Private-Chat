import FindController from "./controllers/findController";
import SocketService from "./helpers/services/SocketService";
import AuthController from "./controllers/AuthController";
import listController from "./controllers/listController";
import chatController from "./controllers/chatController";
import helpers from  "./helpers/helpers";

class find{
    constructor(){
        const Authentication = new AuthController();
        this.socket = new SocketService();
        this.Helpers = new helpers();
        this.recipient = null;
        this.user = null;
        this.urlParam = null;

        window.requestAnimationFrame(()=>{

            this.Helpers.getUserData().then(( user )=>{
                this.user = user;

                new FindController( {
                    socket: this.socket,
                    userdata: this.user,
                    recipient: this.recipient,
                    urlParam: this.urlParam
                });

                new listController( {
                    socket: this.socket,
                    userdata: this.user,
                    recipient: this.recipient
                });

            });

            Authentication.authLoggedOutResponse( this.socket );
            Authentication.logout( this.socket );

        });
    }
}


new find();