const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//connect to database
mongoose.connect("mongodb://localhost/chat", {
  useMongoClient: true
});

//check for connection status
mongoose.connection
.once("open", ()=>{
    console.log("database connection established.....");
})
.on("error", (error)=>{
     console.log("ERROR:", error);
});

module.exports = mongoose;
