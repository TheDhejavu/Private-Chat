import localStorageInstance from "../utils/localStorage";
import HttpServiceInstance from "../helpers/services/HttpService";

export default class Helper{
    constructor(){}
    getUserData(){
        return new Promise((resolve, reject)=>{
             localStorageInstance().then( LStorage=>{

                 LStorage.get("current_u").then( ( name )=>{

                     const senderParams = {
                         nickname: name,
                         xmlhttp: "Y"
                     }

                     HttpServiceInstance().then(( httpService )=>{

                         httpService.checkUserExist(senderParams).then(( results )=>{
                             resolve( results.data );
                         });

                     });

                 });
             });

        })
    }
}

