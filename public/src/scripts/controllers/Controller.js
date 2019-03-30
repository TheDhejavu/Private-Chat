
export default class Controller{
   constructor(){

   }
   loadScript (url) {

    return new Promise((resolve, reject) => {
      var script = document.createElement('script');
      script.async = true;
      script.src = url;

      script.onload = resolve;
      script.onerror = reject;

      document.body.appendChild(script);

    });

  }


  
}
