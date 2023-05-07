const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
var fetchuser = require("../Middleware/fetchuser");
const { findByIdAndUpdate } = require("../models/Notes");
const Notes = require("../models/Notes");

//create notes route

// ROUTE 1: Get all notes of User  using: Get "/api/notes/allnotes".
// get hmne isliye use kiya h kyuki uper hm sb bhej rhe the isme kuch n bhejna

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    user = req.user;
    const notes = await Notes.find({ user: user.id });
    res.send(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//// ROUTE 2: add notes  using: post "/api/notes/addnote".
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter valid title").isLength({ min: 3 }),
    body("description", "Please Enter valid description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success=false;
    try {
      const { title, description } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        user: req.user.id,
      });
      const savenote = await note.save();
      success=true;
      res.json({success:true,message:"Added Successfully"});
    } catch (error) {
      res.status(400).json({ error: "Internal server error" });
    }
  }
);

//route =3   update a particular node
router.put("/update/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  //create note object
  const newnote = {};
  if (title) {
    newnote.title = title;
  }
  if (description) {
    newnote.description = description;
  }

  //yha hmne notes find kre
  const upnote = await Notes.findById(req.params.id);
  if (!upnote) {
    return res.status(404).send("Not Found");
  }

  if (upnote.user.toString() !== req.user.id) {
    res.status(401).send("Not Allowed");
  }
  const note = await Notes.findByIdAndUpdate(
    req.params.id,
    { $set: newnote },
    { new: true }
  );
  res.json({ note });
});

//Route=4   delete a note
router.delete("/delete/:id", fetchuser, async (req, res) => {
  try {
    const findnote = await Notes.findById(req.params.id);
    if (!findnote) {
      return res.status(404).send("Not Found");
    }

    if (findnote.user.toString() !== req.user.id) {
      res.status(401).send("Not Allowed");
    }
    const note = await Notes.findByIdAndDelete(req.params.id);
    res.json({Success:"Delete Successfully"}  );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Occura");
  }
});

module.exports = router;
