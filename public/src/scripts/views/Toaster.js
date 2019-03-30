export default function ToasterInstance(){
  if (typeof window.ToasterInstance_ !== 'undefined')
    return Promise.resolve(window.ToasterInstance_);

  window.ToasterInstance_ = new Toaster( );

  return Promise.resolve(window.ToasterInstance_);
}

class Toaster{
    constructor(){
       this.toaster = document.querySelector(".js-toaster");
       this.hideBound = this.hide.bind(this);
       this.setTimeout = null;
    };
    toast(message){

        this.toaster.textContent = message;
        this.toaster.classList.add("toaster-view--visible");
        this.toaster.style.transform = "translateX(0px)";
        this.toaster.style.transitionDuration = "500ms";

        clearTimeout(this.setTimeout);
        this.setTimeout = setTimeout(this.hideBound, 2000);
    };
    hide(){

       this.toaster.style.transform = "translateX(-200px)";
       this.toaster.style.transitionDuration= "";
       this.toaster.classList.remove("toaster-view--visible");
    }
}