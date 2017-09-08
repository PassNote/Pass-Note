const mongoose = require("mongoose");
const { Message, User } = require("./model/Schemas");
mongoose.Promise = require("bluebird");

mongoose.connect("mongodb://localhost:27017/passnotedb", {
	useMongoClient: true
});

function getMessageById(messageId) {
	return Message.findOne({ _id: messageId }).catch(function(err) {
		console.log(err);
	});
}

function findUserById(userId) {
	return User.find({ _id: userId });
}

function sendMessage(newMessage, senderId) {
	findContactByUsername(newMessage.user).then(recipient => {
		const message = new Message({
			title: newMessage.title,
			body: newMessage.body,
			users: [senderId, recipient._id]
		});
		message.save((err, result) => {
			recipient.messages.push(result._id);
			recipient.save();
			findUserById(senderId).then(user);
		});
	});
}

function findMessages(userId) {
	return Message.find({ users: userId })
		.populate("users")
		.catch(function(err) {
			console.log(err);
		});
}

// not entirely sure about this guy here
function addContact(contactUserName, userId) {
	findContactByUsername(conactUserName).then(contact => {
		User.findOne({ _id: userId }).then(user => {
			user.contacts.push(contact._id);
			user.save();
		});
	});
}

function addUser(newUser) {
	console.log(newUser);
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
	return User.find({ contacts }).populate();
}

function findContactByUsername(username) {
	return User.find({ username: username });
}

function deleteMessage(messageId) {
	return Messages.deleteOne({ _id: messageId }).catch(function(err) {
		console.log(err);
	});
}

module.exports = {
	findMessages,
	addUser,
	addContact,
	findContactByUsername,
	sendMessage,
	deleteMessage,
	getMessageById
};
