const mongoose = require('mongoose');


const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }
})
const Contact = mongoose.model("contact", contactSchema)

const listContacts = async (userid) => {
  return Contact.find({owner:userid})
};

const getContactById = async (id, userid) => {
  const res =await Contact.findById(id);
  if(res && res.owner===userid)
    return res
  else
    return null
};

const removeContact = async (contactId, userid) => {
  const todel = await getContactById(contactId, userid)
  if (todel && todel.owner===userid) {
    await Contact.deleteOne({_id:contactId}).exec()
    return true;
  }
  return false;
};

const addContact = async ({ name, email, phone, favorite }, userid) => {
  const cont = new Contact()
  cont.name = name;
  cont.email = email
  cont.phone=phone
  cont.favorite =favorite
  cont.owner = userid;
  await cont.save();
  return cont;
};
const updateContact = async (contactId, body, userid) => {
  const guy = await getContactById(contactId);
  if (guy === null || guy.owner===userid) {
    return false;
  }
  const {
    id = contactId,
    name = guy.name,
    email = guy.email,
    phone = guy.phone,
    favorite = guy.favorite
  } = body;

  Contact.updateOne({_id: contactId}, {name, email, phone, favorite}).exec()

  return { id, name, email, phone, favorite };
};
const updateStatusContact = async (contactId, {favorite}, userid) => {
  try{
    await Contact.updateOne({_id: contactId, owner:userid}, {favorite}).exec()

  }catch{
    return null;
  }
  const guy = await getContactById(contactId, userid);

  return guy
}



module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
};
