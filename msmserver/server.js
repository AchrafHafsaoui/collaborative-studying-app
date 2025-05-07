import express from 'express'
import session from 'express-session'
import cors from 'cors'
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import { saveMsg } from "./controllers/chatController.js";
import { savePath, deletePath, saveBubble, deleteBubble, updateBubble, toggleLock } from './controllers/whiteboardController.js';
import passport from "./passport/passport_local_strategy.js";
import { createGroup, joinGroup, addRating, addMeeting, deleteMeeting, removeMember, changePublic, changeAdmin } from "./controllers/groupController.js";

import createApp from './app.js';
//const MongoDBStore = connectMongoDBSession(session);

const app = createApp;

//Setup and Config
dotenv.config();
const connString = 'mongodb://a94b926f31f959175a2a675b69943ce3:groupi@15b.mongo.evennode.com:27019,15b.mongo.evennode.com:27019/a94b926f31f959175a2a675b69943ce3?authMechanism=DEFAULT&authSource=a94b926f31f959175a2a675b69943ce3';
mongoose.connect(connString)
  .then(() => console.log('DB connected!')).catch((e) => { console.log(e); });

const server = app.listen(process.env.PORT, () => {
  console.log('Server started');
});

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.get('/', (req, res) => {
  res.send("Hello World");
})
//Socket gets all incoming messages, forwards to connected clients and saves to DB
io.on("connection", (socket) => {
  socket.on('sendMsg', msg => {
    io.emit('newMsg', msg);
    saveMsg(msg.identifier, msg.from, msg.userImage, msg.messageText, msg.imageData, msg.bubble, msg.time);
  });
  socket.on('joinGroup', join => {
    io.emit('join', join);
    joinGroup(join.identifier, join.user, false, join.accepted||false,join.rejected||false);
  });
  socket.on('removeMember', remove => {
    io.emit('remove', remove);
    removeMember(remove.identifier, remove.user);
  });
  socket.on('changeAdmin', change => {
    io.emit('adminChanged', change);
    changeAdmin(change.identifier, change.user, change.promoted);
  });
  socket.on('sendPath', pathData => {
    io.emit('newPath', pathData);
    savePath(pathData.identifier, pathData.path, pathData.color, pathData.strokeWidth, pathData.opacity);
  });
  socket.on('deletePath', pathData => {
    io.emit('pathDeleted', pathData);
    deletePath(pathData.identifier, pathData.path, pathData.color, pathData.strokeWidth, pathData.opacity);
  });
  socket.on('sendBubble', bubble => {
    io.emit('newBubble', bubble);
    saveBubble(bubble.identifier, bubble.index, bubble.locationX, bubble.locationY);
  });
  socket.on('deleteBubble', bubble => {
    io.emit('bubbleDeleted', bubble);
    deleteBubble(bubble.identifier, bubble.index);
  });
  socket.on('updateBubble', bubble => {
    io.emit('bubbleUpdated', bubble);
    updateBubble(bubble.identifier, bubble.index, bubble.locationX, bubble.locationY);
  });
  socket.on('newGroup', group => {
    io.emit('groupCreated', group);
    createGroup(group.identifier, group.admin, group.groupname, group.subject, group.users, group.image);
  });

  socket.on('toggleLock', lock => {
    io.emit('lockToggled', lock);
    toggleLock(lock.identifier);
  });

  socket.on('changePublic', newPublic => {
    io.emit('publicChanged', newPublic);
    changePublic(newPublic.identifier);
  });

  socket.on('rating', rating => {
    addRating(rating.groupIdentifier, rating.userEmail, rating.rating, rating.review);
  });
  socket.on('addMeeting', meeting => {
    addMeeting(meeting.identifier, meeting.title, meeting.date, meeting.time );
  });
  socket.on('deleteMeeting', meeting => {
    deleteMeeting(meeting.identifier, meeting.title, meeting.date, meeting.time );
  });
});