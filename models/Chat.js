const DB = require("./DB");
const bcrypt = require("bcryptjs");
const Schema = DB.Schema;

const dbMessageSchema = new Schema({
  sendToId:{
    type:String
  },
  sendById:{
    type:String
  },
  body:{
    type:String
  },
  date:{
    type:Date
  },
})

const dbMessage = module.exports = DB.model("messages", dbMessageSchema);

module.exports.saveMessage = function(newMessage){
  return newMessage.save();
}
module.exports.insertManyMessage = function(newMessages){
  return dbMessage.insertMany( newMessages );
}
module.exports.getMessages = function(userId, sendToId){

   const query = {
          $or:[
                { $and:[
                      {
                        "sendToId": sendToId
                      },{
                        "sendById": userId
                    }
                  ]
                },
                { $and:[
                      {
                        "sendToId":  userId
                      },{
                        "sendById": sendToId
                    }
                ]
             },
        ]
   }

   return dbMessage.find(query).exec();
}


module.exports.removeMessage = function(messageId){
  const query = {_id: messageId};
  return dbMessage.findOneAndRemove(query).exec();
}
