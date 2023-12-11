const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
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
});
const User = mongoose.model("user", userSchema);
const word = "Nincompoop";

const all = () => {
  return User.find();
};
const saltRounds = 10;

const register = async ({ password, email, subscription }) => {
  if (await User.findOne({ email })) {
    return false;
  }

  const u = new User();
  u.email = email;
  u.subscription = subscription;
  bcrypt.genSalt(saltRounds, function (_, salt) {
    bcrypt.hash(password, salt, function (_, hash) {
      u.password = hash;
      u.save();
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
          return existing.token ===token;
        
      }
    }
  } catch {
    console.log("dkj");
    return false;
  }

  return false;
};
const logout = async (token) =>{
    const us = await current(token)
    if(us){
      us.token = "";
      us.save();
    }
    return us;
}
const current = async (token)=>{
  try{
    return await User.findOne({email:jwt.verify(token, word).mail})
  }catch{
    console.log("wrooong");
  }

}

module.exports = {
  all,
  register,
  login,
  validate,
  logout,
  current
};
