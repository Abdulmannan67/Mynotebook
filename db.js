require('dotenv').config();

const mongoose = require('mongoose');

const mongoURI = process.env.DB_URI;

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}

const connectToMongo = () => {
    mongoose.connect(mongoURI, connectionParams).then(() => {
        console.log("Connected to Mongo Successfully");
    }).catch((e)=>{
        console.log(e)
    })

}
module.exports = connectToMongo;