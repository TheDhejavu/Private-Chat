const ChatDB = require("../models/chat");
const UserDB = require("../models/Users");

class chat{
  constructor(app){
    this.app = app
  }
  redirectChat(request, response){
    response.redirect("/find");
  }

  checkUserExist(request, response){
    const nickname = request.params.nickname.replace(/@/g, "");
    UserDB.getUserByNickname(nickname).then((user)=>{
       //<== different for different request(ajax || network)
       const responseJson = {};
        if(user){

            if(request.query.xmlhttp == "Y"){

               responseJson.error = false;
               delete user.password;
               responseJson.data = user;
               response.json( responseJson );

            }else{
               response.render("chat");
            }
        }else{
          if(request.query.xmlhttp == "Y"){

            responseJson.error = true;
            responseJson.data = "Unknow User"
            response.json( responseJson );

          }else{
            response.redirect("/find");
          }
        }
    })
  }
  getMessages(request, response){

     const nickname = request.params.nickname.replace(/@/g, "");
     UserDB.getUserByNickname(nickname).then(( recipient )=>{
       if(!recipient) return;

       ChatDB.getMessages(request.user._id, recipient._id).then(( messages )=>{
         response.json(messages);

       })
    });

  }
  saveAndRetrieveMessage(request, response){
    response.json(request.body)
  }

}

module.exports = chat;
