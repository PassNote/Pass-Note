require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const moment = require("moment");
const mustacheExpress = require("mustache-express");
const mongoose = require("mongoose");
const { User, Message } = require("./model/Schemas");
const {
	findIncomingMessages,
	findOutgoingMessages,
	addUser,
	addContact,
	findContactByUsername,
	sendMessage,
	deleteMessage,
	getMessageById
} = require("./dal");

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		saveUninitialized: false,
		resave: false
	})
);

function validateLogin(req, res, next) {
	findContactByUsername(req.body.username).then(user => {
		user.validPassword(req.body.password, user.password, (err, isMatch) => {
			if (err) {
				req.session.message = "Invalid Username or Password.";
				res.redirect("/login", req.session.message);
			} else if (isMatch) {
				req.session.user = {
					username: user.username,
					name: user.name,
					avatar: user.avatar,
					userId: user._id
				};
				next();
			}
		});
	});
}

function timeCheck(req, res, next) {
  if(moment() > req.body.date) {
    deleteMessage();
    req.session.message = "This message has expried."
    res.redirect("/inbox", req.session.message)
  } else {
    next();
  }
}

function passMessage (req, res, next) {
  const newMembeer = req.body.newMember;
  getMessageById(req.body.id).then((message) => {
    message.users.push(newMember);
    findContactByUsername()
  })
}

app.get("/", (req, res) => {
	res.redirect("/login");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.post("/login", validateLogin, (req, res) => {
	res.redirect("/inbox");
});

app.get("/signup", (req, res) => {
	res.render("signup");
});

app.post("/signup", (req, res) => {
	addUser(req.body);
	res.redirect("/inbox");
});

app.get("/compose", (req, res) => {
	res.render("compose");
});

app.post("/compose", (req, res) => {

	res.redirect("/inbox");
});

app.post("/pass-add", timeCheck, ((req, res) => {
  res.redirect("/inbox")
})


app.set("port", 3000);

app.listen(app.get("port"), () => {
	console.log("Your app has started, sir.");
});
