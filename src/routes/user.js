const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/user.js");
const { auth } = require("../middleware/auth.js");
const {
  sendWelcomeEmail,
  sendCancellationMail,
} = require("../emails/account.js");

const router = new express.Router();

// POST api/user
router.post("/", async (req, res) => {
  try {
    const { userName, password, email, age } = req.body;

    const user = new User({
      userName,
      password,
      email,
      age,
    });
    await user.save();

    // sending mail
    sendWelcomeEmail(user.email, user.userName);

    // generating new token
    const token = await user.generateAuthToken();

    res.status(201).json({ user, token });
  } catch (err) {
    // console.log(err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/user/login
// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);

    const token = await user.generateAuthToken();

    res.json({
      user: user,
      token,
    });
  } catch (err) {
    res.status(401).json(err);
  }
});

// POST api/user/logout
// To logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    await req.user.save();
    res.send("logout");
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST api/user/logoutAll
// To logout from all tokens
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.json({ message: "Logout from all users." });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET api/user/me
// get profile
router.get("/me", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// PATCH api/user/me
router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["userName", "age", "password", "email"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  try {
    if (!isValidOperation) return res.status(400).json("Invalid update body.");
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(err.status ?? 500).json(err);
  }
});

// DELETE api/user/me
router.delete("/me", auth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.user._id }).exec();
    sendCancellationMail(user.email, user.userName);
    if (!user) {
      const error = new Error();
      error.status = 404;
      error.message = "User does not found.";
    }

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Upload images
const upload = multer({
  // dest: "avatars",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

// POST api/user/me/avatar
router.post("/me/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    // file uploaded in mongoose location
    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250,
      })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send("Upload succesfull.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE api/user/me/avatar
router.delete("/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send("Delete user avatar.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET api/user/:id/avatar
// get avatat image
router.get("/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error("User did not found.");
    }

    // Header setting
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).json({ err: err.message });
  }
});
module.exports = router;
