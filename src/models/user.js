const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const Task = require("./task.js");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is Invalid.");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 6,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password can not contain "password"');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be positive number.");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

// virtual type model
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  // user.tokens = user.tokens.concat({ token });
  user.tokens.push({ token });

  await user.save();

  return token;
};

// Public profile
userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;

  return userObj;
};

// Login user auth
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to Login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  try {
    const user = this;

    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 8);
    }
    next();
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

// delete user tasks when user deleted
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const user = this;
    console.log(user.getQuery()["_id"]);
    await Task.deleteMany({ owner: user.getQuery()["_id"] }).exec();
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
