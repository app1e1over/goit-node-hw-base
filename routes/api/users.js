const express = require("express");
const users = require("../../models/users")
const Joi = require("joi");
const multer  = require('multer')
const upload = multer({ dest: 'temp/' })
const Jimp = require("jimp");
const router = express.Router();


const validate =  async (req, res, next) => {
    const tok = req.headers.authorization

    if(tok!==undefined && await users.validate(tok)){
        next();

    }
    else{
        res.json({ message: "Not authorized"});
        res.status(401);
    }

  };
  const current =  async (req, res, next) => {
    res.locals.user= await users.current(req.headers.authorization);
    next();
  }

router.get("/all", async (req, res, next) => {
    res.json(await users.all());
    res.status(200);
  });
const defaultSchema = Joi.object().keys({
    email: Joi.string().min(7).email().required(),
    password: Joi.string().min(6).alphanum().required()
  });
router.post("/register", async (req, res, next) => {
      const validated = defaultSchema.validate(req.body);
      if (validated.error != null) {
        res.json({ message: validated.error.message });
        res.status(400);
      } else {
        const r = await users.register(validated.value);
        if(r){
            res.json({message:"added successfuly"});
            res.status(201);
        }else{
            res.json({message:"email is already in use"});
            res.status(409);
        }

      }
  });
router.post("/login",async (req, res, next) => {
    const validated = defaultSchema.validate(req.body);
    if (validated.error != null) {
      res.json({ message: validated.error.message });
      res.status(400);
    } else {
        const r = await users.login(validated.value);
        if(r===undefined){
            res.json({message: "Email or password is wrong"})
            res.status(401);

        }else{
            res.status(200);
            res.json(r)

        }
    }
})

router.post("/logout", validate);
router.post("/logout", async (req, res, next) =>{
    const tok = req.headers.authorization
    if(await users.logout(tok)){
        res.status(204);
        res.json({});
    }else{
        res.status(401);
        res.json({message: "Not authorized"});
    }
})

router.post("/current", validate);
router.post("/logout", async (req, res, next) =>{
    const tok = req.headers.authorization
    const r= await users.current(tok)
    if(r){
        res.json(r);
        res.status(200);
    }else{
        res.status(401);
        res.json({message: "Not authorized"});
    }
})

router.patch("/avatars", upload.single('avatar'), async (req, res, next)=>{
  const initFile = req.file;
  console.log(initFile);
  Jimp.read(initFile.path, (err, lenna) => {
    if (err) throw err;
    lenna
      .resize(250, 250) // resize
      .quality(60) // set JPEG quality
      .greyscale() // set greyscale
      .write("public/avatars/"+res.locals.user.email); // save
  });
  res.status(200);
  res.json({avatarURL: "/avatars/"+res.locals.user.email})
})
  module.exports ={ router, validate, current};