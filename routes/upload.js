const express = require("express");
const router = express.Router();
const Imageup = require("../models/Image")
const multer = require("multer")
const fs = require('fs');
const { promisify } = require('util') // used to delete img in folder
const unlinkAsync = promisify(fs.unlink)// used to delete img in folder
const path = require('path');
var fetchuser = require("../Middleware/fetchuser");


var storage = multer.diskStorage({
    destination:  (req, file, cb) => {
        cb(null, 'uploads') // upload folder m save ho gayegi
    },
    filename: (req, file, cb) => {
        cb(null,  Date.now()+path.extname(file.originalname))
    }
});

const fileFilter=(req,file,cb)=>{
    const allowedFileTypes = ['image/jpeg','image/png','image/jpg']
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null,true)
    }else{
        cb(null,false)
    }
}
 
var upload = multer({ storage , fileFilter });
router.post('/img',fetchuser,upload.single('photo'),  async (req, res) => { 

  try {
    
  
    const img = req.file.filename;
    var obj = new Imageup({
        user: req.user.id,
        img
    })
      
         const saveimg = await obj.save();
         res.send("Submit Sucessfully");
        } catch (error) {
          res.send(error)
          console.log(error)
        }

            
        
    
});


// get all images

router.get("/allimg", fetchuser, async (req, res) => {
    try {
      user = req.user;
      const alls = await Imageup.find({ user: user.id });
      res.send(alls);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  });


  //delete img
  router.delete("/delete/:id", fetchuser, async (req, res) => {
    try {
      const find = await Imageup.findById(req.params.id);
      if (!find) {
        return res.status(404).send("Not Found");
      }
  
      if (find.user.toString() !== req.user.id) {
        res.status(401).send("Not Allowed");
      }
      await unlinkAsync(`uploads/${find.img}`)// ye hmne upar s liya h
     

      const note = await Imageup.findByIdAndDelete(req.params.id);
     
      res.json("Delete Successfully");
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Occura");
    }
  });


module.exports = router;
