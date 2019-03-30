import AuthController from "./controllers/AuthController";

class login{
    constructor(){
        const Authentication = new AuthController();

        this.submitButton = document.querySelector(".js-submit-btn");
        this.myForm = document.querySelector(".js-form");

        this.myForm.addEventListener("submit", (e)=>{
            e.preventDefault();
            Authentication.login(e);
        });
    }
}


new login();