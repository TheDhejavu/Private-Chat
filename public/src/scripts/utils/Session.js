
export default function SessionInstance () {

    if (typeof window.SessionInstance_ !== 'undefined')
      return Promise.resolve(window.SessionInstance_);

    window.SessionInstance_ = new Session();

    return Promise.resolve(window.SessionInstance_);
}

class Session{
    set(key , value){
       return Promise.resolve(window.sessionStorage.setItem(key, value))
    }
    get(key){
        return Promise.resolve(window.sessionStorage.getItem(key))
    }
    unset(){
        return Promise.resolve(window.sessionStorage.clear())
    }
}