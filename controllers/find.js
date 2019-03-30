const ChatDB = require("../models/chat");
const UserDB = require("../models/Users");

class find{
  constructor(app){
    this.app = app
  }
  findUser(request, response){

    if(request.query.search){

        const nickname = new RegExp(request.query["search"], 'i');
          UserDB.findUsers(nickname, request.user._id)
              .then(( users )=>{
                response.json(users)
              }).catch((err)=>{
                response.json(err)
              });

    }else{
        response.render("find");
    }
  }

}

module.exports = find;
