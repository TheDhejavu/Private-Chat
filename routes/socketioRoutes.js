'use strict';

class SocketioRoutes{

	constructor(socket){
		this.io = socket;
	}

	socketRouteEvents(){

		this.io.on('connection', (socket) => {

            socket.on('/broadcast', (data) => {

            })

        })
  }
  routesConfig(){
       this.socketRouteEvents();
   }
}
module.exports = SocketioRoutes;
