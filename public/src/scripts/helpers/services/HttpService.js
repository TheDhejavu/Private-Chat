import HttpRequestInstance from '../../libs/HttpRequest';


export default  function HttpServiceInstance () {

    if (typeof window.HttpServiceInstance_ !== 'undefined')
      return Promise.resolve(window.HttpServiceInstance_);

    window.HttpServiceInstance_ = new HttpService();

    return Promise.resolve(window.HttpServiceInstance_);
}

class HttpService{
    constructor(){
        this.http = null;
    }
    static  BASE_URL(){
        return  'http://localhost:8080/'
    }
    login(params){

        return new Promise((resolve, reject)=>{
            HttpRequestInstance().then(( http )=>{
                http.post(`${this.constructor.BASE_URL()}login`, params)
                    .success((response)=> {
                        resolve(response);
                    })
                    .error((error)=>{
                        reject(response);
                    })
            })
        })
    }
    findUsers(params){

        return new Promise((resolve, reject)=>{
            HttpRequestInstance().then(( http )=>{
                http.get(`${this.constructor.BASE_URL()}find`, params)
                    .success((response)=> {
                        resolve(response);
                    })
                    .error((error)=>{
                        reject(response);
                    })
            })
        })

    }
    getMessages(params){

        return new Promise((resolve, reject)=>{
            HttpRequestInstance().then(( http )=>{
                http.get(`${this.constructor.BASE_URL()}chat/${params.nickname}/${params._id}`, params)
                    .success((response)=> {
                        resolve(response);
                    })
                    .error((error)=>{
                        reject(response);
                    })
            })
        })

    }
    checkUserExist(params){

        return new Promise((resolve, reject)=>{
            HttpRequestInstance().then(( http )=>{
                http.get(`${this.constructor.BASE_URL()}chat/${params.nickname}`, params)
                    .success((response)=> {
                        resolve(response);
                    })
                    .error((error)=>{
                        reject(response);
                    })
            })
        })

    }
    logout(params){

        return new Promise((resolve, reject)=>{
            HttpRequestInstance().then(( http )=>{
                http.get(`${this.constructor.BASE_URL()}logout`, params)
                    .success((response)=> {
                        resolve(response);
                    });
            });
        })

    }
}