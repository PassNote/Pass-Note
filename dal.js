const mongoose = require("mongoose");
const { Message, User } = require("./model/Schemas");
const moment = require("moment");

mongoose.Promise = require("bluebird");

mongoose.connect("mongodb://localhost:27017/passnotedb", {
	useMongoClient: true
});

function getMessageById(messageId) {
	return Message.findOne({ _id: messageId })
		.populate("users", "username")
		.populate("body.author", "name")
		.catch(function(err, result) {
			console.log(result);
			// console.log(err);
		});
}

function findUserById(userId) {
	return User.find({ _id: userId });
}

function sendMessage(newMessage, senderId) {
	findContactByUsername(newMessage.user).then(recipient => {
		const message = new Message({
			title: newMessage.title,
			body: {
				author: senderId,
				message: newMessage.body
			},
			users: [senderId, recipient[0]._id]
		});
		message.save((err, result) => {
			recipient[0].messages.push(result._id);
			recipient[0].save();
			findUserById(senderId).then(user => {
				user[0].messages.push(result._id);
				user[0].save();
			});
		});
	});
}

function findMessages(userId) {
	return Message.find({ users: userId })
		.populate("users", "username")
		.populate("body.author", "name")
		.catch(function(err) {
			console.log(err);
		});
}

// not entirely sure about this guy here

function addContact(contactUserName, userId) {
	findContactByUsername(contactUserName).then(contact => {
		User.findOne({ _id: userId }).then(user => {
			user.contacts.push(contact._id);
			user.save();
			console.log(user.contacts)
		});
	});
}

function addUser(newUser) {
	const hash = User.generateHash(newUser.password);
	const user = new User({
		username: newUser.username,
		password: hash,
		avatar: newUser.avatar,
		name: newUser.name
	});
	user.save();
}

function getAllContacts(userId) {
	return User.find({ userId }).populate();
}

function findContactByUsername(username) {
	return User.find({ username: username });
}

function deleteMessage(messageId) {
	return Message.deleteOne({ _id: messageId }).catch(function(err) {
		console.log(err);
	});
}

function getTimeRemaining(messageArray) {
	const timeArray = [];
	console.log("This is message array: " + messageArray);
	if (Array.isArray(messageArray)) {
		messageArray.forEach((elm, ind, arr) => {
			timeArray.push(moment().diff(elm.date, "minutes"));
		});
	} else {
		timeArray.push(moment().diff(messageArray.date, "minutes"));
	}
	timeArray.forEach((elm, ind, arr) => {
		timeArray[ind] = elm * -1;
	});
	return timeArray;
}

module.exports = {
	findMessages,
	addUser,
	addContact,
	findContactByUsername,
	sendMessage,
	deleteMessage,
	getMessageById,
	getTimeRemaining,
	getAllContacts
};
