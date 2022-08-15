require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const flash = require('connect-flash');
var md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 13;

const app = express();

app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.render("home");
});
app.get("/login", function(req, res) {
  res.render("login");
});
app.get("/register", function(req, res) {
  res.render("register");
});
app.get("/submit", function(req, res) {
  res.render("submit");
});

app.post("/register", function(req, res) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      username: req.body.username,
      password: hash
    });
    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      };
    });
  });

});

app.post("/login", function(req, res) {
  const enteredUserName = req.body.username;
  const enteredPassword = md5(req.body.password);
  User.findOne({
    username: enteredUserName
  }, function(err, foundresult) {
    if (err) {
      console.log(err);
    } else {
      if (foundresult) {
        bcrypt.compare(enteredPassword, foundresult.password, function(err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
      };
    };
  });
});



app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
