import Controller from './Controller';
import HttpServiceInstance from "../helpers/services/HttpService";
import localStorageInstance from '../utils/localStorage';

export default class AuthController{
    constructor(){}
    logout( socketService ){
        this.logout = document.querySelector(".js-logout-button");
        this.logout.addEventListener("click", (e)=>{
            e.preventDefault();

            HttpServiceInstance().then(( httpService )=>{

              httpService.logout({}).then(( results )=>{

                 if(!results.error){

                  localStorageInstance().then( LStorage=>{


                    LStorage.unset("current_u").then( ()=>{

                    socketService.logout(results.name).then(()=>{
                        window.location.href = "/login";

                      })

                    })


                  })

                 }
              })

            })
        })
      }
    login(e){
        let isEmpty;

        for(var l =0; l < e.target.length -1 ; l++){
            if(e.target[l].value == ""){
                isEmpty = true;
            }else{
                isEmpty = false;
            }
        }
        if(!isEmpty){
            const values = {
                nickname: e.target[0].value,
                password: e.target[1].value
            }
            HttpServiceInstance().then(( httpService )=>{

                httpService.login(values).then(( results )=>{

                    if(results.error){
                        console.log(results)
                    }else{
                        localStorageInstance().then( LStorage=>{
                            LStorage.set("current_u", results.nickname).then(()=>{
                                window.location.href = "/find";
                            })
                        })
                    }
                })
            });
        }else{
           alert("missing credentials")
        }
    }

    authLoggedOutResponse( socketService ){
        const logoutMsg = document.querySelector(".js-logout-danger");
        const logoutDialog = document.querySelector(".js-logged-out__dialog")



        socketService.logoutResponse( ).then(( response)=>{

                localStorageInstance().then( Lstorage =>{
                    Lstorage.get("current_u").then( name =>{
                        if(!name){
                            logoutMsg.textContent = response.message;
                            logoutMsg.classList.add("danger__msg--visible")
                            logoutDialog.classList.add("logged-out__dialog--visible")

                        }
                    })
                })

            });


    }
}