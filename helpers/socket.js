const path = require('path');
const ChatDB = require("../models/chat");
const UserDB = require("../models/Users");
const NotificationDB = require("../models/Notifications");

class Socket{

	constructor(socket){
		this.io = socket;
		this.connections = [];
	}
	getMessengers( data ){

		return new Promise((resolve, reject)=>{
			let condition = [];

			for(var i =0; i < data.length; i++){
				const obj = { _id: data[i] };
				condition.push(obj);
			}

			let query = { $or: condition };
			UserDB.getUsersWithQuery(query).then(( messengerData )=>{

				resolve(messengerData);

			}).catch(( error )=>{

				reject(error.errmsg)

			})

		})

	}

	addBroadcast( new_data, socket ){
		let newMessages = [];
		let listId = [];

		for(var i =0; i < new_data.broadCastTo.length; i++){
			var data = {
				sendToId: new_data.broadCastTo[i]._id,
				sendById: new_data.sendBy._id,
				body: new_data.body,
				date: Date.now()
			}
			var id = new_data.broadCastTo[i]._id;
			newMessages.push(data);
			listId.push(id);
		}

		ChatDB.insertManyMessage( newMessages).then(( data )=>{

			for(var i =0; i <  new_data.broadCastTo.length; i++){
				const nickname = new_data.broadCastTo[i].nickname;

				var noteData = {
					sendTo: new_data.broadCastTo[i],
					sendBy: new_data.sendBy,
					body: new_data.body,
					date: Date.now()
				}

				this.setNotification( noteData ).then( NotificationData =>{
					new_data.sendBy.count = NotificationData.count;

					if(this.connections[nickname]){
						this.connections[nickname].forEach(toSocketId => {

						const  obj = {
							result:data[0],
							recipient: new_data.sendBy
						};
							this.io.sockets.connected[toSocketId].emit(`add-broadcast-response`,obj);
							this.io.sockets.connected[toSocketId].emit(`new-messenger-response`, {to: new_data.sendBy});
							this.io.sockets.connected[toSocketId].emit(`incoming-notification`, NotificationData);
						});


					}
			   })

			}

			socket.emit(`add-broadcast-response`,data[0]);
			//update messenger list of all

			UserDB.updateMessengerList(new_data.sendBy._id, listId).then(( results )=>{
				//set messenger for user
				socket.emit(`new-messenger-response`, new_data.broadCastTo)
			})
		})
	}
	updateNotification(data){
		const fromId = data.sendBy._id;
		const toId = data.sendTo._id;
		const count = data.count;
		NotificationDB.updateNotification( fromId, toId, count).then( results =>{});

	}
	getNotification(data){

		const fromId = data.sendBy._id;
		const toId = data.sendTo._id;

		return new Promise((resolve, reject)=>{
			NotificationDB.getNotification(fromId, toId).then( data =>{
				resolve(data);
			});
	   })
	}
	setNotification(new_data ){

		const fromId = new_data.sendBy._id;
		const toId = new_data.sendTo._id;
		const fromName = new_data.sendBy.nickname;
		const toName = new_data.sendTo.nickname;

		const newNotification = new NotificationDB({
			fromId: fromId,
			toId: toId,
			fromName:fromName,
			toName: toName,
			count: 1
		});
		return new Promise((resolve, reject)=>{
			NotificationDB.getNotification(fromId, toId).then( data =>{

				if(data){
					var count = data.count +1 ;

					NotificationDB.updateNotification( fromId, toId, count).then( results =>{
						results.count = count;
						resolve(results);
					})
				}else{

					NotificationDB.saveNotification(newNotification).then(( results )=>{
						resolve(results)
					})
				}


			})
		})

	}
	addMessages( new_data, socket ){
		const newMessage = new ChatDB({
			sendToId: new_data.sendTo._id,
			sendById: new_data.sendBy._id,
			body: new_data.body,
			date: Date.now()
		});
		ChatDB.saveMessage( newMessage).then(( data )=>{
			let list = [ new_data.sendTo._id ];

			this.setNotification( new_data).then( NotificationData =>{

				if(this.connections[new_data.sendTo.nickname]){

					this.connections[new_data.sendTo.nickname].forEach(toSocketId => {

						const  obj = {
							result:data,
							recipient: new_data.sendBy
						};
						new_data.sendBy.count = NotificationData.count;
						//emit message back to recipient
						this.io.sockets.connected[toSocketId].emit(`add-message-response`,obj);
						//messenger if new
						this.io.sockets.connected[toSocketId].emit(`new-messenger-response`, {to: new_data.sendBy});
						//emit notifications

						this.io.sockets.connected[toSocketId].emit(`incoming-notification`, NotificationData);
					});

				}
			})


				//add message response
				socket.emit(`add-message-response`,data);

				//update messenger list of all
				UserDB.updateMessengerList(new_data.sendBy._id, list).then(( results )=>{
					//set messenger for user
					socket.emit(`new-messenger-response`, {to: new_data.sendTo})
				});


		})
	}
	logout( data , socket){
		if(!this.connections[data]) return;

		this.connections[data].forEach(socketId => {
		    if(socketId == socket.id) return;
            this.io.sockets.connected[socketId].emit("logout-response",{
				logout: true,
				message: "You are logged out Now"
			});
		});
	}
	socketEvents(){

		this.io.on('connection', (socket) => {

			const name = socket.request._query['name'];
			this.onConnect(name, socket)


			socket.on('get-messenger-list', (data) => {

				this.getMessengers( data ).then((messengers)=>{

					socket.emit(`get-messenger-list-response`, messengers);

				}).catch((error)=>{

					console.log(error);

				})

			});

			socket.on('add-broadcast', (new_data) => {
				this.addBroadcast(new_data, socket)
			});

			socket.on('add-message', ( new_data ) => {
				this.addMessages( new_data, socket);
			})

			socket.on('update-notification', (data) => {
				this.updateNotification( data)
			});

			socket.on('get-notification', (data) => {
				this.getNotification( data).then(( results )=>{
					socket.emit("get-notification-response", results);
				})
			});

			socket.on('logout', (data) => {
				this.logout( data, socket )
			});


            socket.on("disconnect", ()=>{
				this.onDisconnect(socket, name)
			});

        })
	}
	onDisconnect(socket, name){
		console.log("1 DISCONNECTED:",name);

		this.connections[name] = this.connections[name].filter(( socketID)=>{
			return socket.id !== socketID;
		})

		if(Object.keys(this.connections[name]).length == 0){
			const condition = { nickname: name };
			const query =  {
					online: false,
					lastSeen: Date.now()
			}
		    UserDB.update(condition, query).then(()=>{})
		}

        console.log("AVAILABLE CONNECTIONS:", this.connections)
	}
	onConnect(name, socket){

		const userSocket = socket.id
		const condition = { nickname: name };
		const query =  {
			online: true,
			lastSeen: Date.now()
		}

		UserDB.update(condition, query).then((updated)=>{});

		 if(!this.connections[name])
			this.connections[name] = [];

			this.connections[name].push(userSocket);

            console.log("JUST CONNECTED:" , socket.id, "with Name:", name);
            console.log("ALL CONNECTIONS:", this.connections);
	}
	socketConfig(){
       this.socketEvents();
	}
}
module.exports = Socket;
