const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
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

app.set("view engine", "ejs")

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL
  const templateVars = { shortURL: shortUrl, longURL: urlDatabase[shortUrl] };
  console.log(req.params.shortURL);
  console.log(shortUrl)
 console.log(urlDatabase)
  console.log(urlDatabase[shortUrl])
  console.log(templateVars) //here your template vars the longurl is undefined
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

//HERE -------------------------------
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  const newURL = req.body.longURL;
  const newShortString = generateRandomString();
  urlDatabase[newShortString] = newURL;  
  console.log('URL added to database')
  res.redirect(`/urls/${newShortString}`)
});

//HERE ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});