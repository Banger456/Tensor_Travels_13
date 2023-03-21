const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: {type: String, required: true,unique:true,},
    password:{type:String, required:true} ,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        enum:['user','admin'],
        ref: "Role"
      }
    ]
  })
);

module.exports = User;