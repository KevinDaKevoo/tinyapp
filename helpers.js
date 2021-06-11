//Generates random string for shortURL use
const generateRandomString = function() {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let results = '';
  const charactersLength = characters.length;
  const randomLength = 6;
  for (let i = 0; i < randomLength; i++) {
    results += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return results;
};
  
//Helper function for looking up email exists
const emailLookup = function(input, data) {
  for (let userID in data) {
    if (data[userID].email === input) {
      return data[userID];
    }
  }
  return "undefined";
};

//Helper function for storing URLs for users
const urlsForUser = function(id, urlDatabase) {
  let userDatabase = {};
  for (let url of Object.keys(urlDatabase)) {
    if (urlDatabase[url].userID === id) {
      userDatabase[url] = {
        longURL: urlDatabase[url].longURL
      };
    }
  }
  return userDatabase;
};
  
module.exports = { generateRandomString, emailLookup, urlsForUser };