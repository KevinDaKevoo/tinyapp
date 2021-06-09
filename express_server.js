const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(cookieParser())
const generateRandomString = function () {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let results = '';
  const charactersLength = characters.length;
  const randomLength = 6;
  for (var i = 0; i < randomLength; i++) {
    results += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return results;
};

let users = {
  1: { 
    id: 1,
    username: 'kevin',
    password: '1234'
}}


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL
  const templateVars = { username: req.cookies["username"], shortURL: shortUrl, longURL: urlDatabase[shortUrl] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  const newURL = req.body.longURL;
  const newShortString = generateRandomString();
  urlDatabase[newShortString] = newURL;  
  console.log('URL added to database')
  res.redirect(`/urls/${newShortString}`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
// edit URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect("/urls");
});

app.post("/urls/:shortid/edit", (req, res) => {
const shortid = req.params.shortid
console.log(shortid)
  res.redirect(`/urls/${shortid}`);
})
// deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
})

//login accepts data from login form, authenticates user


app.post("/login", (req, res) => {
  const username = req.body.username
  res.cookie("username", username);
  res.redirect('/urls')
})


//Logout (get)

app.get("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username", username);
  res.redirect("/urls")
})

//page to register user form (GET)
///register - accepts the new user data, creates the user (POST)



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});