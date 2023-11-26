const fs = require("fs/promises");
const path = "models/contacts.json";

const genId = () => {
  let id = "";
  for (let i = 0; i < 21; i++) {
    let ch = String.fromCharCode(65 + Math.floor(Math.random() * 25));
    if (Math.random() > 0.5) {
      ch = ch.toLowerCase();
    }
    id += ch;
  }
  return id;
};
const saveContact = async (id, name, email, phone) => {
  const res = { id, name, email, phone };
  const contacts = await listContacts();
  contacts.push(res);
  fs.writeFile(path, JSON.stringify(contacts));
  return res;
};

const listContacts = async () => {
  return JSON.parse((await fs.readFile(path)).toString());
};

const getContactById = async (id) => {
  const contacts = await listContacts();
  return contacts.find((c) => c.id === id);
};

const removeContact = async (contactId) => {
  const old = await listContacts();
  const current = old.filter((v) => v.id !== contactId);
  if (old.length !== current.length) {
    fs.writeFile(path, JSON.stringify(current));
    return true;
  }
  return false;
};

const addContact = async ({ name, email, phone }) => {
  return await saveContact(genId(), name, email, phone);
};
const updateContact = async (contactId, body) => {
  const guy = await getContactById(contactId);
  if (guy === undefined) {
    return false;
  }
  const {
    id = contactId,
    name = guy.name,
    email = guy.email,
    phone = guy.phone,
  } = body;

  const contacts = await listContacts();
  contacts.forEach((c, i) => {
    if(c.id===contactId){
      contacts[i] =  { id, name, email, phone };
    }
  });

  fs.writeFile(
    path,
    JSON.stringify(contacts)
  );

  return { id, name, email, phone };
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
