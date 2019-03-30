const express = require("express");
const socket = require("socket.io");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require('http');
const flash = require("connect-flash");
const session = require("express-session");
const UserDB = require("./models/Users");
const exphbs  = require('express-handlebars');

class Server{
  constructor(){
       this.port =  process.env.PORT || 8080;
       this.host = `localhost`;

       this.app = express();
  }
  appConfig(){
    const urlencodedParser = bodyParser.urlencoded({ extended: true });
    const jsonParser = bodyParser.json();

    this.app.use(urlencodedParser);
    this.app.use(jsonParser);
    //view engine
    // Set handlebars as the templating engine
    const HBS_CONFIG ={
      defaultLayout: 'main',
      extname:'.hbs',
      layoutDir:  path.join(__dirname, "views", "layouts"),
      partialsDir:  path.join(__dirname, "views", "partials"),
      helpers:{}
    }
    this.app.engine('.hbs', exphbs(HBS_CONFIG));
    this.app.set('view engine', 'hbs');
    //static files
    this.app.use(express.static("public"));

    //express session
    this.app.use(session({
      secret:'secret',
      saveUninitialized: false,
      resave:true
    }));

    this.app.use(function(req, res, next){
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, content-Type, Accept");
      next()
    })

    //passport
    // this.app.use(passport.initialize());
    // this.app.use(passport.session());
    //user session data
    this.app.use(function(req, res, next) {
      if (req.session && req.session.userId) {
        UserDB.getUserById(req.session.userId).then(function(user) {
            if(user){
              req.user = user;
            }
           next();
        })
      } else {
        next();
      }
    });

    // //flash messages
    this.app.use(flash());

    this.app.use(function(req, res, next){
      res.locals.success_msg = req.flash('success_msg');
      res.locals.error_msg = req.flash('error_msg');
      res.locals.error = req.flash('error');
      res.locals.user = req.user || null
      next();
    });



  }
  appRoutes(){
    // routes controllers
    const  chatRoutes = require('./routes/chat');
    const  findRoutes = require('./routes/find');
    const  authRoutes = require('./routes/authentication');
    const socketioEventRoutes = require("./routes/socketioRoutes");

    this.app.use("/", authRoutes);
    this.app.use("/find",findRoutes);
    this.app.use("/chat", chatRoutes);

    new socketioEventRoutes(this.io).routesConfig();
  }
  appEvents(){
    const socketEvents = require('./helpers/socket');
    new socketEvents(this.io).socketConfig();
  }
  Execute(){
    this.Server = this.app.listen(this.port, this.host, () => {
        console.log(`Listening on http://${this.host}:${this.port}`);
     });

    this.io = socket.listen(this.Server);

    this.appConfig();
    this.appRoutes();
    this.appEvents();
  }
}

const app = new Server();
app.Execute();
