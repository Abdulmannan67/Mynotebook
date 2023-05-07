const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    img:
    {
        type: String
    } 
})

const Imageup = mongoose.model("images_users",imageSchema)
module.exports= Imageup;