const fs = require("fs/promises");
const path = "models/contacts.json";

const genId = ()=>{
  let id = "";
  for (let i = 0; i < 21; i++) {  
    let ch = String.fromCharCode(65+Math.floor(Math.random() * 25));
    if(Math.random()>0.5){
      ch=ch.toLowerCase();
    }
    id+=ch;    
  }
  return id;
}
const saveContact = async(id, name, email, phone)=>{
  const res=  { id, name, email, phone }
  fs.writeFile(
    path,
    JSON.stringify([... (await listContacts()),res])
  );
  return res;
}

const listContacts = async () => {
  return JSON.parse((await fs.readFile(path)).toString());
};

const getContactById = async (id) => {
  return listContacts().then((v) => {
    let cont;
    v.forEach((contact) => {
      if (contact.id === id) {
        cont = contact;
      }
    });
    return cont;
  });
};

const removeContact = async (contactId) => {
  const toRem = await getContactById(contactId);
  if(toRem===undefined){
    return false;
  }
  fs.writeFile(
    path,
    JSON.stringify( (await listContacts()).filter(v=>v.id!==contactId))
  );
  return true;
};

const addContact = async ({ name, email, phone }) => {
 return await saveContact(genId(), name, email, phone);
};
const updateContact = async (contactId, body) => {
  const guy = await getContactById(contactId);
  if(guy===undefined){
    return false;
  }
  const {id=contactId, name = guy.name, email=guy.email, phone=guy.phone} = body;
  
  fs.writeFile(
    path,
    JSON.stringify( [...(await listContacts()).filter(v=>v.id!==contactId), {id, name, email, phone}])
  );

  return {id, name, email, phone};
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
