const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const gravatar = require("gravatar");

const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  avatarURL: String,
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
});
const User = mongoose.model("user", userSchema);
const word = "Nincompoop";

const all = () => {
  return User.find();
};
const saltRounds = 10;

const sendMail = async (email) => {
  const us = await User.findOne({ email, verify: false });
  if (!us) {
    return false;
  }
  const config = {
    host: "smtp.meta.ua",
    port: 465,
    secure: true,
    auth: {
      user: "app1e1over@meta.ua",
      pass: "helloWorld12",
    },
  };

  const transporter = nodemailer.createTransport(config);
  const emailOptions = {
    from: "app1e1over@meta.ua",
    to: email,
    subject: "Верифікація",
    html:
      "<h1>Привіт.</h1> <p>Щоб підтвердити свій email тицьни <a href='http://localhost:3000/api/users/verify/" +
      us.verificationToken +
      "'>сюди</a>!</p>",
  };

  transporter
    .sendMail(emailOptions)
    .then((info) => console.log(info))
    .catch((err) => console.log(err));
  return true;
};

const register = async ({ password, email, subscription }) => {
  if (await User.findOne({ email })) {
    return false;
  }

  const u = new User();
  u.email = email;
  u.subscription = subscription;
  u.avatarURL = gravatar.url(email);
  const tok = uuidv4();
  u.verificationToken = tok;
  bcrypt.genSalt(saltRounds, function (_, salt) {
    bcrypt.hash(password, salt, function (_, hash) {
      console.log(email);
      u.password = hash;
      u.save();
      sendMail(email);
    });
  });

  return true;
};
const login = async ({ password, email }) => {
  const us = await User.findOne({ email });
  if (us) {
    let token;

    if (bcrypt.compareSync(password, us.password)) {
      token = jwt.sign({ mail: email, pass: password }, word);
      us.token = token;
      us.save();
      return { token, user: { email, subscription: us.subscription } };
    }
  } else return undefined;
};

const validate = async (token) => {
  try {
    const us = jwt.verify(token, word);
    if (us) {
      const existing = await User.findOne({ email: us.mail });
      if (existing) {
        return existing.token === token;
      }
    }
  } catch {
    return false;
  }

  return false;
};
const logout = async (token) => {
  const us = await current(token);
  if (us) {
    us.token = "";
    us.save();
  }
  return us;
};
const current = async (token) => {
  try {
    return await User.findOne({ email: jwt.verify(token, word).mail });
  } catch {
    console.log("wrooong");
  }
};
const findByVerification = async (verificationToken) => {
  console.log(verificationToken);
  const us = await User.findOne({ verificationToken });
  if (us) {
    us.verificationToken = null;
    us.verify = true;
    await us.save();
    return us;
  }
  return false;
};

module.exports = {
  all,
  register,
  login,
  validate,
  logout,
  current,
  findByVerification,
  sendMail
};
