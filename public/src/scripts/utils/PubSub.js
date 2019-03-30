export default  function PubSubInstance(){
   if(typeof window.PubSubInstance_ !== "undefined")
      return Promise.resolve(window.PubSubInstance_);

       window.PubSubInstance_ = new PubSub();
     return Promise.resolve(window.PubSubInstance_);
}

class PubSub{
    constructor(){
       this.subs = {};
    };
    publish( key , args){
      if(!this.subs[key])
        return;
      this.subs[key].forEach(
          subscriber =>{
              subscriber( args );
          }
      );
    };
    subscribe(key, handler ){
       if(!this.subs[key])
          this.subs[key] = [];

       this.subs[key].push(handler);
    };
    unSubscribe( key ){
      if(!this.subs[key])
      return;

      delete this.subs[key];
    };


}