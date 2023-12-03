const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://st07kish:998FBYt5agRV66L@cluster0.zmrvdcy.mongodb.net/").then(()=>{
  if(mongoose.connection.readyState === 1){
    console.log("Database connection successful");
  }else{
    console.log("Something is wrong");

    process.exit(1)
  }
})



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
})
const Contact = mongoose.model("contact", contactSchema)

const listContacts = async () => {
  return Contact.find()
};

const getContactById = async (id) => {
  return Contact.findById(id)
};

const removeContact = async (contactId) => {
  const todel = await getContactById(contactId)
  if (todel!==undefined) {
    await Contact.deleteOne({_id:contactId}).exec()
    return true;
  }
  return false;
};

const addContact = async ({ name, email, phone, favorite }) => {
  const cont = new Contact()
  cont.name = name;
  cont.email = email
  cont.phone=phone
  cont.favorite =favorite
  await cont.save();
  return cont;
};
const updateContact = async (contactId, body) => {
  const guy = await getContactById(contactId);
  if (guy === null) {
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
const updateStatusContact = async (contactId, {favorite}) => {
  try{
    await Contact.updateOne({_id: contactId}, {favorite}).exec()

  }catch{
    return null;
  }
  const guy = await getContactById(contactId);

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
