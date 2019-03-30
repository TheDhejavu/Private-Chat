import HttpRequestInstance from '../../libs/HttpRequest';
import localStorageInstance from '../../utils/localStorage';

export default  class SocketService{
    constructor(){
        this.http = null;

        localStorageInstance().then( Lstorage =>{
            Lstorage.get("current_u").then( name =>{

                this.socket = io.connect(this.constructor.BASE_URL(), { query: `name=${name}`});

             })
        })
    }
    static  BASE_URL(){
        return  'http://localhost:8080'
    }

    sendMessage(message){
        this.socket.emit('add-message', message);
    }
    recieveMessage( callback ){
		this.socket.on('add-message-response', (data) => {
				 callback(data);
        });
    }
    sendBroadcast(message){
        this.socket.emit('add-broadcast', message);
    }
    recieveBroadCast(callback){
        this.socket.on('add-broadcast-response', (data) => {
            callback(data);
        });
    }

    getMessengerList(data){
        this.socket.emit('get-messenger-list' , data);

        return new Promise((resolve, reject) => {
			this.socket.on('get-messenger-list-response', (data) => {
				resolve(data);
			});
		});
    }

    newMessenger( callback){
        this.socket.on('new-messenger-response', (data) => {
			callback(data);
		});
    }
    getNotification( data ){
        this.socket.emit('get-notification', data);
    }
    responseNotification(callback){
        this.socket.on('get-notification-response', ( data) => {
            callback(data);
       });
    }
    updateNotification( data){
        this.socket.emit('update-notification', data)
    }
    incomingNotification( callback){
        this.socket.on('incoming-notification', (data) => {
            callback(data);
        });
    }

    logout(name){
        return Promise.resolve(this.socket.emit('logout', name))
    }
    logoutResponse(){

        return new Promise((resolve, reject) => {
			this.socket.on('logout-response', (data) => {
                console.log(data);
				resolve(data);
            });
            return () => {
				this.socket.disconnect();
			};
		});
    }

}