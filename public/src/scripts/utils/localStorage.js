
export default function localStorageInstance () {

    if (typeof window.localStorageInstance_ !== 'undefined')
      return Promise.resolve(window.localStorageInstance_);

    window.localStorageInstance_ = new localStorage();

    return Promise.resolve(window.localStorageInstance_);
}

class localStorage{
    set(key , value){
        if(typeof value === "object"){
             const items = JSON.stringify(value);
             return Promise.resolve(window.sessionStorage.setItem(key, items))
        }else{
            return Promise.resolve(window.localStorage.setItem(key, value))
        }
    }
    get(key){
        if(typeof value === "object"){
            const items = JSON.parse(window.localStorage.getItem(key));
            return Promise.resolve(items);
       }else{
           return Promise.resolve(window.localStorage.getItem(key))
       }
    }
    unset(key){
        return Promise.resolve(window.localStorage.removeItem(key))
    }
}