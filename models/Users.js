const DB = require("./DB");
const bcrypt = require("bcryptjs");
const Schema = DB.Schema;
const imageNum = Math.floor(Math.random()*10)+1;

const dbUserSchema = new Schema({
  nickname: {
    type:String,
    unique:true,
    trim:true,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  image:{
    type:String,
    default:`avatar${imageNum}.png`
  },
  online:{
    type:Boolean,
    default:false
  },
  lastSeen:{
    type:Date
  },
  messengers:{
    type:Array
  },

})


const dbUser = module.exports = DB.model("Users", dbUserSchema);


module.exports.createUser = function(newUser, cb){
  bcrypt.genSalt(10, (err, salt)=>{
      bcrypt.hash(newUser.password, salt, (err, hash)=>{
          newUser.password = hash;
          newUser.save(cb);
      });
  });
}

module.exports.comparePassword = function(password, hash, cb){
    bcrypt.compare(password, hash, (err, isMatch)=>{
      cb(err, isMatch);
    })
};

module.exports.update = function(condition, query){
  return dbUser.findOneAndUpdate(condition, query);
}

module.exports.setOnline = function(query){
  return dbUser.findOneAndUpdate(query, {"online": true});
}

module.exports.getUserByNickname = function(nick){
    const query = {nickname: nick};
    return dbUser.findOne(query).exec();
}

module.exports.getUserById = function(id){
    return dbUser.findById(id).exec();
}

module.exports.getAllUser = function(){
    return dbUser.find({}).exec();
}

module.exports.getUsersWithQuery = function( query ){
  return dbUser.find(query).exec();
}

module.exports.updateMessengerList = function(sendById, sendToIdList){
  const param = [ sendById ];
  const query1 = {
    $addToSet: {
      messengers: sendToIdList
    }
  }

  const query2 ={
    $addToSet: {
      messengers: param
    }
  }
 return dbUser.findOneAndUpdate({_id: sendById}, query1).then(()=>{
    return dbUser.update({_id: {$in : sendToIdList }}, query2).exec();
 })

}


module.exports.findUsers = function(nick,userId){
  const query = {"nickname": nick};
  return dbUser.find(query)
                .where("_id").ne(userId)
               .sort({"updated_at":-1})
               .sort({"created_at":-1})
               .limit(20)
               .exec();
}
