const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { response, request } = require("express");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(cookieParser())

//Generates random string for shortURL use
const generateRandomString = function () {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let results = '';
  const charactersLength = characters.length;
  const randomLength = 6;
  for (let i = 0; i < randomLength; i++) {
    results += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return results;
};

//Helper function for looking up email exists
const emailLookup = function(input) {
  for (let user of Object.values(users)) {

    if (user.email === input) {
      return true;
    }
  }
  return null
}

//Helper function for looking up Id from email
const urlIDLookup = function (input) {
  for (let user of Object.keys(users)) {
      if (users[user].email === input) {
        return users[user].id;
      }
  }
}

//Helper function for looking up password matches
const passwordLookup = function(input) {
  for (let user of Object.values(users)) {
    if (user.password === input) {
      return true;
    } else {
   
    }
  }
  return false;
}

//Users 
let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "9876"
  }
}

//URLS
let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

//URLS for specific users
const urlsForUser = function (id) {
  let userDatabase = {};
  for (let url of Object.keys(urlDatabase)) {
    if (urlDatabase[url].userID === id) {
      userDatabase[url] = { 
        longURL: urlDatabase[url].longURL
      }
    }
  }
  return userDatabase;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// /urls page
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }

});

// /urs/new page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

// /urls/:shortURL page
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"]) {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[req.cookies["user_id"]],
    }
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Getting information from /urls page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls`);
});

//Redirection to longURL from shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// edit URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect("/urls");
});
//edit URL
app.post("/urls/:shortid/edit", (req, res) => {
const shortid = req.params.shortid
const cookie = req.cookies["user_id"]
const newURL = req.body.editURL
if (cookie) {
  urlDatabase[shortid] = { 
    longURL: newURL,
    userID: cookie
  }
} else {
  res.redirect('/login');
}

  res.redirect(`/urls/${shortid}`);
})

// deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//login accepts data from login form, authenticates user
app.post("/login", (req, res) => {

  const user_id = urlIDLookup(req.body.email);
  if (emailLookup(req.body.email)) {
    if (passwordLookup(req.body.password)) {
      res.cookie("user_id", user_id);
      return res.redirect("/urls")
    } else {
      res.status(403).send("Whoops something is wrong!");
    }
  } else {
    res.status(403).send("Whoos something is wrong!");
    return false;
  }
  
});

//Logout
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/register");
});

//Registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

//Registering account
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const user = { id, email, password };
  const templateVars = { email };


  if (Object.values(req.body).some((value) => value === "")) {
    res.status(400).send("Email and Password Cannot Be Empty");
  } 
  if (emailLookup(email)) {
    res.status(400).send("Email has already been taken, please use another email");
  }
  users[id] = {
    id: id,
    email: email,
    password: password
  }
  res.cookie('user_id', id);
  res.redirect("/urls");
});

//Login Page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars)
})

//Server start and message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});