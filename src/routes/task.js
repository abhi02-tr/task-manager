const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const Task = require("../models/task.js");
const { auth } = require("../middleware/auth.js");

const router = express.Router();

// POST api/task
router.post("/", auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });

    const data = await task.save();

    res.status(201).json({
      data,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET api/task
// GET api/task?completed=
// GET api/task?limit={number}&skip={number}
// GET api/task?sortBy=createdAt_asc
router.get("/", auth, async (req, res) => {
  const sort = {};
  if (req.query.sortBy) {
    const [first, second] = req.query.sortBy.split("_");
    sort[first] = second === "asc" ? 1 : -1;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match: req.query.completed ? { completed: req.query.completed } : {},
      options: {
        limit: Number.parseInt(req.query.limit),
        skip: Number.parseInt(req.query.skip),
        sort,
      },
    });
    res.json(req.user.tasks);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// GET api/task/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, owner: req.user._id });

    if (!task) {
      const error = new Error();
      error.status = 404;
      error.message = "No task found with provided id.";
      throw error;
    }

    res.json(task);
  } catch (err) {
    res.status(err.status ?? 500).json(err);
  }
});

// PATCH api/task/:id
router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  try {
    if (!isValidOperation) return res.status(400).json("Invalid Updates.");

    const { id } = req.params;

    const task = await Task.findOne({ _id: id, owner: req.user._id });

    if (!task) {
      const error = new Error();
      error.status = 404;
      error.message = "Task does not found.";
      throw error;
    }

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();

    res.json(task);
  } catch (err) {
    res.status(err.status ?? 500).json(err);
  }
});

// DELETE /api/task/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });

    if (!task) {
      const error = new Error();
      error.status = 404;
      error.message = "Task does not found.";
      throw error;
    }

    res.json(task);
  } catch (err) {
    res.status(500).json(err);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpeg|jpg)/)) {
      return cb(new Error("Please upload an image."));
    }
    cb(undefined, true);
  },
});

router.post("/:id/img", auth, upload.single("img"), async (req, res) => {
  try {
    // console.log(req.params.id);
    // console.log(req.file);
    const buffer = await sharp(req.file.buffer)
      .resize({
        height: 100,
        width: 100,
      })
      .png()
      .toBuffer();

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      throw new Error("No task found.");
    }

    task.img = buffer;
    await task.save();

    res.json({ message: "Task added successfully." });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get("/:id/img", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id });
    if (!task) {
      throw new Error("Task image is not found.");
    }

    // Header setting
    res.set("Content-Type", "image/jpg");
    res.send(task.img);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:id/img", auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id });

    if (!task) {
      throw new Error("Unable to find Task.");
    }

    task.img = undefined;
    await task.save();

    res.json({ message: "Task image deleted successfully." });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
