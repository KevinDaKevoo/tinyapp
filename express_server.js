const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { response, request } = require("express");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(cookieParser())

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

const emailLookup = function(input) {
  for (let user of Object.values(users)) {
    if (user.email === input) {
      return true;
    } else {
      return false;
    }
  }
}

const urlIDLookup = function (input) {
  for (let user of Object.keys(users)) {
      if (users[user].email === input) {
        return users[user].id;
      }
  }
}
const passwordLookup = function(input) {
  for (let user of Object.values(users)) {
    if (user.password === input) {
      return true;
    } else {
      return false;
    }
  }
}

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = `http://${urlDatabase[req.params.shortURL]}`;
  res.redirect(longURL);
});
// edit URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect("/urls");
});

app.post("/urls/:shortid/edit", (req, res) => {
const shortid = req.params.shortid
  res.redirect(`/urls/${shortid}`);
})
// deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//login accepts data from login form, authenticates user


app.post("/login", (req, res) => {

  const user_id = urlIDLookup(req.body.email)
  if (emailLookup(req.body.email)) {
    if (passwordLookup(req.body.password)) {
      console.log(req.body.password)
      console.log(user_id)
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

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/register");
});


app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const user = { id, email, password };
  users[id] = user;
  const templateVars = { email };
  console.log(users)

  if (Object.values(req.body).some((value) => value === "")) {
    res.status(400).send("Email and Password Cannot Be Empty");
  } else if (emailLookup(email)) {
    res.status(400).send("Email has already been taken, please use another email");
  } 

  res.cookie("user_id", id);
  res.redirect("/urls");
  
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});