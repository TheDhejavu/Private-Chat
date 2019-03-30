//AUTHENTICATION.......
const express = require("express");
const router = express.Router();
const UserDB = require("../models/Users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

router.get("/login", isAuthenticated, (req, res)=>{
    res.render("login");
});
function isAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    res.redirect("/")
  }else{
      return next()
  }
}

passport.use(new LocalStrategy(
  function(nickname, password, done) {
    UserDB.getUserByNickname(nickname).then((user)=>{

      if(!user){
        return done(null, false, {message: "unknown nickname"});
      }

       UserDB.comparePassword(password, user.password, (err, isMatch)=>{
            if(err) throw err;
            if(isMatch){
              return done(null, user)
            }else{
              return done(null,false, {message: "invalid password"})
            }
       })
    }).catch((err)=>{
      if(err) throw err;
    })
  }
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  UserDB.getUserById(id).then(function(user) {
    done(null, user);
  }).catch(function(err){
    done(err, "oops something went wrong");
  });
});



router.post("/login" , passport.authenticate('local', {failureRedirect: "/login", failureFlash: true }),
(req,res, next)=>{
    res.redirect("/");
});

router.get("/logout", (req, res)=>{
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
})


router.get("/register",isAuthenticated, (req, res)=>{
    res.render("register");
});

router.post("/register", validateRequest, (req, res)=>{
    req.checkBody("nickname|password", "All fields are required").empty();
    const error = req.validationErrors();
    if(error){
        res.render("register", {
          error: error,
          body: req.body
        });
    }else{
      const nickname = req.body.nickname;
      UserDB.getUserByNickname(nickname).then( (user)=>{

        if(user){
          res.render("register", {
            error: "Nickname exist already",
            body: req.body
          });
        }else{
          const newUser = new UserDB({
              nickname: req.body.nickname,
              password: req.body.password,
              lastSeen:null,
          });

          UserDB.createUser(newUser,function(err, user){
                   if(err) throw errr;
                       res.redirect("login");
          })
        }


      })


    }

});

function validateRequest(req, res, next){
     var error = true;
     var notEmpty;
     var fieldArray
     req.checkBody = function(field, errorMessage){

       this.done = function(message, success){
           if(success){
             error = false;
           }else{
             error = message
           }

       }

       this.empty = function(){
          fieldArray = field.split("|");
          for( var x =0; x < fieldArray.length;  x++){
            if(req.body[fieldArray[x]] == ''){
              notEmpty = false;
              this.done(errorMessage, false);
              break;
            }else{
              notEmpty = true;
              this.done(null, true);
            }
          }
           return this;
         }

       return this;
     }


     req.validationErrors = function(){
       return error;
     }

   next();
}
module.exports = router;

//CHAT.....................
const express = require("express");
const router = express.Router();
const ChatDB = require("../models/chat");
const UserDB = require("../models/Users");

router.get("/", isAuthenticated,  function(req, res){
   res.redirect("find");
});
router.get("/:nickname", isAuthenticated,  function(req, res){
    const nickname = req.params.nickname.replace(/@/g, "");

    UserDB.getAllUser().then(( members)=>{

       UserDB.getUserByNickname(nickname).then((recipient)=>{
           if(recipient){

             ChatDB.getChats(nickname, req.user.nickname).then(( chats)=>{

               res.render("chat", {members: members,
                                   recipient: recipient,
                                   chats: chats
                                 });
             })

           }else{
               res.redirect("/");
           }

       })


    })
});
router.post("/:nickname", isAuthenticated,  function(req, res){
  const nickname = req.params.nickname.replace(/@/g, "");
  UserDB.getAllUser().then(( members)=>{

     UserDB.getUserByNickname(nickname).then((recipient)=>{
         if(recipient){

           const newChat = new ChatDB({
             sendBy:req.user,
             sendTo:recipient,
             text: req.body.message
           })
           ChatDB.saveChat(newChat).then(()=>{
             res.redirect("/chat/@"+recipient.nickname);
           })
         }else{
             res.redirect("/");
         }

     })


  })
});



function isAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }else{
    req.flash("error", "Oops!! you need to login")
    res.redirect("/login")
  }
}

module.exports = router;

//FIND...........................

const express = require("express");
const router = express.Router();
const UserDB = require("../models/Users");

router.get("/", isAuthenticated,  function(req, res){
    const nickname = new RegExp(req.query["nick"], 'i');

    UserDB.getAllUser().then((members )=>{

          if(req.query["nick"]){
            UserDB.getUsers(nickname).then(( users )=>{
               res.render("find", {users: null, members: members});

            }).catch((err)=>{
              if(err) throw err;
            });
          }else{
            res.render("find", {users: null, members: members});
          }

    }).catch((err)=> {if(err) throw err});
});

function isAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }else{
    req.flash("error", "Oops!! you need to login")
    res.redirect("/login")
  }
}

module.exports = router;
