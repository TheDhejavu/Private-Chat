import HttpServiceInstance from "../helpers/services/HttpService";
import searchListTemplate from "../views/templates/searchList.hbs";
import PubSubInstance from '../utils/pubSub';
import ChatController from './chatController';

export default class FindController extends ChatController{
    constructor(object){
        super(object);

        this.selectedList = [];
        this.search = document.querySelector(".js-search");
        this.searchDropDown = document.querySelector(".js-search-drop-down");
        this.searchListUL = document.querySelector(".js-search-lists");
        this.findListWrapper = document.querySelector(".js-find-list-wrapper");

        this.onHandleSearchBound = this.onHandleSearch.bind(this);

        const list = document.querySelector(".list");
        const sendToManyBtn = document.querySelector(".js-send-to-many-button");

        sendToManyBtn.addEventListener("click", (e)=>{
            e.preventDefault();
            this.broadCast(e, this.selectedList);
        });

        this.addEventListeners();
    }
    show(){
        this.searchDropDown.classList.add("drop-down--visible")
    }
    hide(){
        this.searchDropDown.classList.remove("drop-down--visible")
    }
    onHandleSearch(e){
        const param = e.target.value;
        if(param === "") {
            this.hide();
            return;
        }
        HttpServiceInstance().then(( httpService )=>{

            httpService.findUsers({search: param}).then(( results )=>{
                if(results.length < 1 ){
                    this.hide();
                    return;
                }
                this.show();
                var compiledTemplate = "";

                for(var key in results){
                        const data = results[key];
                        compiledTemplate +=
                        `<li class="dropdown-frds-list js-search-list" data-usx="${data.nickname},${data._id}, ${data.image},${data.lastSeen}, ${data.online}">
                            <a href="#" class="flex">
                                <img src="/dist/files/${data.image}">
                                <div class="dropdown-frds-content">
                                    <h5>${data.nickname}</h5>
                                    <p>@ ${data.nickname}</p>
                                </div>
                            </a>
                        </li>`


                }

                this.searchListUL.innerHTML = compiledTemplate;
                const self = this;
                const searchListElem = document.querySelectorAll(".js-search-list");

                for(var elem =0; elem < searchListElem.length; elem++){
                    searchListElem[elem].addEventListener("click", function(e){
                         self.onClickList(this);
                    })
                }


            });

         })

    }
    onClickList(e){
       const data = e.getAttribute("data-usx").split(",");
       const nickname = data[0];
       const id = data[1];
       const image = data[2];
       const lastSeen = data[3];

       for(var i =0; i < this.selectedList.length; i++){
         if(this.selectedList[i]._id === id){
            return;
         }
       }

       const obj = {
           _id: id,
           nickname: nickname,
           image: image,
           lastSeen: lastSeen,

       }
       this.selectedList.push(obj);

       const childElem = document.createElement("a");
       childElem.href =      `/chat/@${nickname}`;
       childElem.textContent = nickname;
       childElem.className = "list";
       this.findListWrapper.appendChild(childElem);
    }
    addEventListeners(){
      this.search.addEventListener("keyup", this.onHandleSearchBound);
      this.searchDropDown.addEventListener("click", (e)=>{
        e.stopPropagation();
      })
      document.body.addEventListener("click", (e)=>{
          this.hide();
      })
    }
    removeEventListeners(){

    }
}