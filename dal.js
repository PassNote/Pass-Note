const mongoose = require('mongoose');
const { Message, User } = require('./model/Schemas');

function getMessageById(messageId){
    return Message.findOne({'_id': messageId}).catch(function(err){
      console.log(err)
    })
}

function getAllMessages (messages) {
    return Message.find(messages)
}

function sendMessage (title, body, data, sender, recipient){
    Message.create(req.body)
}

function findIncomingMessages (incoming){
    return Message.find({'incoming': incoming}).catch(function(err){
        console.log(err)
    })
}

function findOutgoingMessages (outgoing){
    return Message.find({'outgoing': outgoing}).catch(function(err){
        console.log(err)
    })
}

// not entirely sure about this guy here
function addContact(username, password, avatar, name, contacts, incoming, outgoing){
    User.create({username: username, password: password, avatar: avatar, name: name, contacts: contacts, incoming: incoming, outgoing: outgoing})
}
// end

function addUser(username, password, avatar, name, contacts, incoming, outgoing){
    User.create({username: username, password: password, avatar: avatar, name: name, contacts: contacts, incoming: incoming, outgoing: outgoing})
}

function findContactByUsername(username){
    User.findOne({'_id': username}).catch(function(err){
        console.log(err)
    })
}

function deleteMessage(messageId){
    Messages.deleteOne({'_id': messageId}).catch(function(err){
        console.log(err)
    })
}

module.exports = { findIncomingMessages: findIncomingMessages, findOutgoingMessages: findOutgoingMessages, addUser: addUser, addContact: addContact, findContactByUsername: findContactByUsername, sendMessage: sendMessage, deleteMessage: deleteMessage, getMessageById: getMessageById, getAllMessages: getAllMessages}