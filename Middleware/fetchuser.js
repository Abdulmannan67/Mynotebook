require('dotenv').config();

var jsonwebtoken = require("jsonwebtoken");
const secret = process.env.SECRET;


const fetchuser=(req,res,next)=>{
    const tokenn = req.header("auth-token");
    if(!tokenn){
        res.status(401).send("Please authenticate using a valid token")
    }
    try{
    const data = jsonwebtoken.verify(tokenn,secret);
    //agr hm khali data ko req.user k brabr krte to ye aese aata { user: { id: '63275523e5df606c0e5407b9' }, iat: 1663524004 }
    req.user= data.user;
    next();
    }catch(error){
        res.status(401).send("Please authenticate using a valid token")
    }

}

module.exports = fetchuser;