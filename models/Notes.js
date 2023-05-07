const mongoose=require("mongoose")
const Schema = mongoose.Schema;
const NotesSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type: String,
        require: true,
    },
    description: {
        type: String,
        required: true,
        
    },
   
    date: {
        type: Date,
        default: Date.now
    },
});

const Notes = mongoose.model('note', NotesSchema);
module.exports = Notes;