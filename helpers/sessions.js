class sessions{
  set(req, id){
      let set;
      req.session.userId = id;
      if(req.session.userId){
         set = true;
      }else{
        set = false;
      }
    return Promise.resolve(set);
  }
  unset(req){
   return new Promise((resolve, reject)=>{
     req.session.destroy(function(err) {
       if(err) {
         reject(err);
       } else {
        resolve(true);
       }
      });
   })
  }
  check(req, callback){
    if (req.session && req.session.userId) {
         return Promise.resolve(req.session.userId);
    }else{
        return Promise.reject(false);
    }
  }
}

module.exports = new sessions;
