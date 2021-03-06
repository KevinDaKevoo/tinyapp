const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const { generateRandomString, emailLookup, urlsForUser } = require("./helpers");

const users = {
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
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
  if (userCookie) {
    res.render("urls_new", templateVars);
  } else {
    res.status(401).send("Please Sign In To Create URL");
  }
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
    res.status(403).send("Must be logged in");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(users);
});

// Getting information from /urls page
app.post("/urls", (req, res) => {
  const userCookie = req.session.user_id;
  if (!userCookie) {
    res.status(403).send("Please login");
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userCookie
  };
  res.redirect(`/urls`);
});

//Redirection to longURL from shortURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("Page not found");
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    return res.redirect(longURL);
  }
});

//edit URL
app.post("/urls/:shortid/edit", (req, res) => {
  const userCookie = req.session.user_id;
  const shortid = req.params.shortid;
  const newURL = req.body.editURL;
  if (!users[userCookie]) {
    return res.status(401).send("Please Sign In To View This Page");
  } else if (userCookie !== urlDatabase[shortid].userID) {
    return res.status("401").send("Not Authorized");
   
  } else {
    urlDatabase[shortid] = {
      longURL: newURL,
      userID: userCookie
    };
    res.redirect(`/urls`);
  }
  
});

// deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userCookie = req.session.user_id;
  const shortid = req.params.shortURL;
  if (!users[userCookie]) {
    return res.status(401).send("Please Sign In To View This Page");
  } else if (userCookie !== urlDatabase[shortid].userID) {
    return res.status(401).send("Not Authorized");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

//login accepts data from login form, authenticates user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email, users);
  if (email.length === 0 || password.length === 0) {
    return res.status(403).send("Email or Password cannot be empty");
  } else if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("User or password is not matched");
  } else  {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});

//Logout
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
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
  } else if (emailLookup(email, users) !== undefined) {
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