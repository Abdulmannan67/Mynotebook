require("dotenv").config();

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
var jsonwebtoken = require("jsonwebtoken");
var fetchuser = require("../Middleware/fetchuser");
const Notes = require("../models/Notes");

//nodrmailer 
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }})

const secret = process.env.SECRET;

//user create into database
router.post(
  "/create-user",
  
  [
    body("name", "Please Enter valid name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password", "Please Enter valid password").isLength({ min: 5 }),
  ],
 
  async (req, res) => {
    let success = false;
   const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    //same email lk liye
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "A user with this email already exists" });
      }

      //for protecting password we generated salt
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

     
    
      // ye database m save krne k liye h
      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      }); // then ek promise h agr data jb databse m save hoga tb ye execute hoga

      //json web token
      let userfind = await User.findOne({ email: req.body.email });
      const data = {
        user: {
          id: userfind.id,
        },
      };

      const token = jsonwebtoken.sign(data, secret);
      success = true;
      res.json({ success, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occurred");
    }
  }
);


// otp vaerfication
router.post("/verify",[body("email", "Enter valid email").isEmail()], async=(req,res)=>{
  
    try {
         
          const otp = Math.floor(Math.random()*10000)
          const mailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: 'Verify Email',
            text: `Your Otp is ${otp} `
          };
    
            transporter.sendMail(mailOptions)
          res.json({status:"Pending", message:"OTP has been sent on your email ",otp:`${otp}`})
         
        } catch (error) {
      res.json({
        status:"error",
        message: error.message
      })
    }
    
    }
)


//forget password

router.post('/forget',[body('email','Enter valid email').isEmail()],async(req,res)=>{
  try {
    let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "A user with this email not exists" });
      }
      const otp = Math.floor(Math.random()*10000)
      const mailOptions = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: 'Verify Email',
        text: `Your Otp for forget password is ${otp} `
      };

        transporter.sendMail(mailOptions)
      res.json({status:"Pending", message:"OTP has been sent on your email ",otp:`${otp}`})
  } catch (error) {
    res.json({
      status:"error",
      message: error.message
    })
  }

})



// after otp login in account

router.post('/forgetlogin', async(req, res)=>{
  
try {

  let userforget = await User.findOne({ email: req.body.email });
  if (!userforget) {
    return res
      .status(400)
      .json({ error: "A user with this email not exists" });
  }
   //jwt-
   const data = {
    user: {
      id: userforget.id,
    },
  };
  const token = jsonwebtoken.sign(data, secret);
  
  success = true;
  res.json({ success, token });

} catch (error) {
  res.json({
    status:"error",
    message: error.message
  })
  
}

})








//create login

router.post(
  "/login",
  [
    body("email", "Enter valid email").isEmail(),
    body("password", "Please Enter valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Please login correct credentials" });
      }

      const passcomp = await bcrypt.compare(password, user.password);
      if (!passcomp) {
        return res
          .status(400)
          .json({ success, error: "Please login correct credentials" });
      }

      //jwt-

      const data = {
        user: {
          id: user.id,
        },
      };

      const token = jsonwebtoken.sign(data, secret);
      success = true;
      res.json({ success, token });
    } catch (error) {
      res.json({
        status:"error",
        message: error.message
      })
    }
  }
);



// email OTP authentication using nodemail







// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const user = req.user.id;
    const userdata = await User.findById(user).select("-password");
    res.send(userdata);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
