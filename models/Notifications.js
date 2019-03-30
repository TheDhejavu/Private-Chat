const DB = require("./DB");
const bcrypt = require("bcryptjs");
const Schema = DB.Schema;

const dbNotificationSchema = new Schema({
  fromId:{
    type:String
  },
  toId:{
    type:String
  },
  fromName:{
      type:String
  },
  toName: {
      type:String
  },
  count:{
    type:Number
  },

})

const dbNotification = module.exports = DB.model("notifications", dbNotificationSchema);

module.exports.saveNotification = function(newNotification){
    return newNotification.save()
}

module.exports.getNotification = function(fromId, toId){

   const query = {
            $and:[
                {
                    "fromId": fromId
                },{
                   "toId": toId
                }
            ]
        }


   return dbNotification.findOne(query).exec();
}


module.exports.updateNotification = function( fromId, toId, count){
    const condition = {
        $and:[
            {
                "fromId": fromId
            },{
               "toId": toId
            }
        ]
    }
    const query = {
        $set: {
            count: count
        }
    }
    return dbNotification.findOneAndUpdate(condition, query);
}
