const express = require("express");
const contacts = require("../../models/contacts");
const Joi = require("joi");

const router = express.Router();

router.get("/", async (req, res, next) => {
  res.json(await contacts.listContacts());
  res.status(200);
});

router.get("/:contactId", async (req, res, next) => {
  const cont = await contacts.getContactById(req.params.contactId);
  if (cont !== undefined) {
    res.json(cont);
    res.status(200);
  } else {
    res.json({ message: "contact with that id doesn't exist" });
    res.status(404);
  }
});

router.post("/", async (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(7).email().required(),
    phone: Joi.string().min(10).max(20).required(),
  });
  const validated = schema.validate(req.body);
  if (validated.error != null) {
    res.json({ message: validated.error.message });
    res.status(400);
  } else {
    const r = await contacts.addContact(validated.value);
    res.json(r);
    res.status(200);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const r = await contacts.removeContact(req.params.contactId);
  if (!r) {
    res.json({ message: "contact with that id doesn't exist" });
    res.status(404);
  } else {
    res.json({ message: "contact deleted" });
    res.status(200);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;

  const schema = Joi.object()
    .keys({
      name: Joi.string().min(3).max(50),
      email: Joi.string().min(7).email(),
      phone: Joi.string().min(10).max(20),
    })
    .min(1);

  const validated = schema.validate(req.body);
  if (validated.error != null) {
    res.status(400);
    res.json({ message: validated.error.message });
  } else {
    const changed = await contacts.updateContact(id, validated.value);
    if (changed) {
      res.json(changed);
      res.status(200);
    } else {
      res.json({ message: "contact with that id doesn't exist" });
      res.status(404);
    }
  }
});

module.exports = router;
