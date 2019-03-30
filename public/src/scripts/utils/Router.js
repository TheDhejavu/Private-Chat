
export default function RouterInstance () {

  if (typeof window.RouterInstance_ !== 'undefined')
    return Promise.resolve(window.RouterInstance_);

  window.RouterInstance_ = new Router();

  return Promise.resolve(window.RouterInstance_);
}

class Router {

  constructor () {
    this.routes = {};
    this.mode = null;
    this.currentPath = this.getPath();
    this.root = "/";

    window.addEventListener('hashchange', (e) => {
        this.listen();
    });


  };
  config( options ){
      this.mode = (options && options.mode && options.mode == "history" && (history.pushState))
                     ? "history" : "hash";
      this.root = (options && options.root) ? "/"+ this.clearSlashes(options.root)+"/" : "/";
      return this;
  };
  clearSlashes(path){
    return path.replace(/\/$/, '').replace(/^\//, '');
  };
  getPath( ){
        var path = '';
        if(this.mode === 'history') {
            path = this.clearSlashes(decodeURI(location.pathname));
            path = path.replace(/\?(.*)$/, '');
        } else {
            var match = window.location.href.match(/#(.*)$/);
            path = match ? match[1] : '';
        }

        return this.clearSlashes(path);
  };
  add( path , callHandler){
      var path, callHandler;

       if(typeof path === "function"){
           callHandler = path;
           path = this.currentPath;
       }else{
           path = (path == "/") ? path : this.clearSlashes(path);
       }

       if (this.routes[path] || !path)
            return this;

        this.routes[path] = {
          handler: callHandler
        };

        return this;
  };
  remove(path){
      var path = (path == "/") ? path : this.clearSlashes(path);

     if (!this.routes[path])
            return this;

     delete this.routes[path];
        return this;
  };
  flush(){
     this.routes = {};
     this.mode = null;
     this.root = '/';
        return this;
  };
  onManageState( path ){
        if(path !== ""){
            path = (typeof path !== "undefined")? this.clearSlashes(path) : this.currentPath;
        }else{
             path = "/";
        }

        if (!this.routes[path])
            return ;
       var routeKeys = Object.keys(this.routes);

       var pathParts = path.split('/');
       var root = pathParts.shift();
       var data = pathParts.join('/');

       this.routes[path].handler(data);
       return this;
   };
   go (path) {
      var path = (path && path !== "/") ? path : '';

    if (path === window.location.pathname)
      return this;

      if(this.mode == "history"){
           window.history.pushState(undefined, null, path);
      }else{
         window.location.href = window.location.href.replace(/#(.*)$/, '') + "#"+ path;
      }

     requestAnimationFrame(() => {
        this.onManageState(path);
     });
      return this;
  }
  listen(){
        let currentAction = this.currentPath;
        const fn = function(){

            if(currentAction != this.getPath() ) {

                currentAction = this.getPath();
                this.onManageState(currentAction);

            }
        }

        clearInterval(this.interval);
        this.interval = setInterval(fn.bind(this), 50);
        return this;
  };

}