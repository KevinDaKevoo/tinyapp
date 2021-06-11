const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { response, request } = require("express");
const bcrypt = require("bcrypt");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const { generateRandomString, emailLookup, urlsForUser } = require('../tinyapp/helpers');

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('1234', 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('dishwasher-funk', 10)
  }
};

let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// /urls page
app.get("/urls", (req, res) => {
  const userCookie = req.session.user_id;
  if (userCookie) {
    const templateVars = {
      urls: urlsForUser(userCookie, urlDatabase),
      user: users[userCookie],
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }

});

// /urs/new page
app.get("/urls/new", (req, res) => {
  const userCookie = req.session.user_id;
  const templateVars = {
    user: users[userCookie],
  };
  res.render("urls_new", templateVars);
});

// /urls/:shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const userCookie = req.session.user_id;
  if (userCookie) {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[userCookie],
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(users);
});

// Getting information from /urls page
app.post("/urls", (req, res) => {
  const userCookie = req.session.user_id;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userCookie
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
  const userCookie = req.session.user_id;
  const shortid = req.params.shortid;
  const cookie = userCookie;
  const newURL = req.body.editURL;
  if (cookie) {
    urlDatabase[shortid] = {
      longURL: newURL,
      userID: cookie
    };
  } else {
    res.redirect('/login');
  }
  res.redirect(`/urls`);
});

// deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//login accepts data from login form, authenticates user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email, users);
  if (email.length === 0 || password.length === 0) {
    res.status(403).send("Email or Password is not valid");
  } else if (!user && !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("User or password is not matched");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//Logout
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/register");
});

//Registration page
app.get("/register", (req, res) => {
  const userCookie = req.session.user_id;
  const templateVars = { user: users[userCookie] };
  res.render("urls_register", templateVars);
});

//Registering account
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  const user = { id, email, password: hashPassword };
  if (Object.values(req.body).some((value) => value === "")) {
    return res.status(400).send("Email and Password Cannot Be Empty");
  } else if (emailLookup(email, users) !== "undefined") {
    return res.status(400).send("Email has already been taken, please use another email");
  } else {
    users[id] = user;
    req.session.user_id = `${id}`;
    res.redirect("/urls");
  }
 
});

//Login Page
app.get("/login", (req, res) => {
  const userCookie = req.session.user_id;
  const templateVars = { user: users[userCookie] };
  res.render("urls_login", templateVars);
});

//Server start and message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});