const UserDB = require("../models/Users");
const sessions = require("../helpers/sessions");

class authentication{
  constructor(app){
    this.app = app;
  }
  logout(request, response){
    const _userId = request.user._id;
    const nickname =  request.user.nickname;

    let logoutResponse = {};
    sessions.unset(request).then(( unset)=>{

       const condition = { _id: _userId };
       const query =  {
             online: false,
             lastSeen: Date.now()
       }
       if(unset){
         UserDB.update(condition, query).then(()=>{
              logoutResponse.error = false;
              logoutResponse.name = nickname;
              //delete request.user;
              response.json(logoutResponse)
         })

       }
    });
  }
  login(request, response){

    const data = {
				nickname : (request.body.nickname).toLowerCase(),
				password : request.body.password
			};

			let loginResponse = {}

			if(data.nickname === '' || data.nickname === null) {

	            loginResponse.error = true;
	            loginResponse.message = `username cant be empty.`;
	            response.json(loginResponse);

	    }else if(data.password === '' || data.password === null){

	            loginResponse.error = true;
	            loginResponse.message = `password cant be empty.`;
	            response.json(loginResponse);

	    }else{
        UserDB.getUserByNickname(data.nickname).then((user)=>{

          if(!user){
            loginResponse.error = true;
            loginResponse.message = `Unknown user`;
            return response.json(loginResponse);
          }

           UserDB.comparePassword(data.password, user.password, (error, isMatch)=>{
                if(error) throw err;
                if(!isMatch){
                  loginResponse.error = true;
                  loginResponse.message = `Invalid Password`;
                  return response.json(loginResponse);
                }else{
                  sessions.set(request, user._id).then(( isset )=>{
                     if(!isset){
                       loginResponse.error = true;
                       loginResponse.message = `Oops something happen`;
                       response.json(loginResponse);
                     }else{

                       UserDB.setOnline({_id: user._id}).then(()=>{

                        loginResponse.error = false;
                        loginResponse.nickname = user.nickname;

                        response.json(loginResponse);

                       })
                     }
                  })
                  return;
                }
           })
        });
      }

  }
  getLogin(req, res){
   res.render("login")
  }
  getRegister(req, res){
    res.render("register")
  }
  register(request, response){
    const data = {
            nickname : request.body.nickname.toLowerCase(),
            password : request.body.password,
            lastSeen: Date.now(),
            messengers:[],

    };
    let registrationResponse = {}

    if(data.nickname === '') {

          registrationResponse.error = true;
          registrationResponse.message = `nickname can't be empty.`;
          response.status(500).json(registrationResponse);

    }else if(data.password === ''){

	        registrationResponse.error = true;
	        registrationResponse.message = `password can't be empty.`;
	        response.status(412).json(registrationResponse);

	  }else{
          const nickname = data.nickname.toLowerCase();
          // data.nickname = nickname;
          UserDB.getUserByNickname(nickname).then( (user)=>{

            if(user){

              registrationResponse.error = true;
    	        registrationResponse.message = `Nickname already exist`;
    	        response.status(412).json(registrationResponse);

            }else{
              const newUser = new UserDB(data);
              UserDB.createUser(newUser,function(error, user){
                if (error) {
                   //console.log(error);
                   registrationResponse.error = true;
                   registrationResponse.message = `Server error.`;
                   response.status(404).json(registrationResponse);
                 }else{
                    response.redirect("/login");
                }

              })
            }

          })
    }

  }
}

module.exports = authentication;
