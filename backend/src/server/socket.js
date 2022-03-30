const socketio = require('socket.io');
const Message = require('../models/Message');

module.exports = server => {
    let users = [];

    const addUser = (userId,socketId) => {
        !users.some(user => user.userId === userId) &&
            users.push({ userId, socketId });
    };
    
    const removeUser = (socketId) => {
        users = users.filter(user => user.socketId !== socketId)
    };

    const getUser = (userId) => {
        return users.find(user => user.userId === userId);
    };

    const io = socketio(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    
    io.on('connection', socket => {
        socket.on('connected', id => {
            addUser(id,socket.id);
            console.log('User connected:', socket.id);
            io.emit('getUsers', users);
        });

        socket.on('get_contact', async transmitter => {
            const contacts = await Message.find({
                $or: [
                    { transmitter },
                    { receiver: transmitter }
                ]
            }).sort({ creationDate: 1 });

            socket.emit('contacts', contacts);
        });

        socket.on('get_messages', async (transmitter,receiver) => {
            const messages = await Message.find({
                $or: [
                    { transmitter, receiver },
                    { transmitter: receiver, receiver: transmitter },
                ]
            }).sort({ creationDate: 1 });

            socket.emit('messages', messages);
        });

        socket.on('send_message', async (senderId,receiverId,message) => {
            const user = getUser(receiverId);

            const newMessage = new Message({ transmitter: senderId, receiver: receiverId, message });
            const resultMessage = await newMessage.save();

            if (user) io.to(user.socketId).emit('new_message',resultMessage);
        });

        // video_call

        socket.on('join-room', roomId => {
            socket.join(roomId);

            socket.on('video_call_information', (ownerId) => {
                const videoCallInformation = {
                    owner: '',
                    currentUser: socket.id 
                };
    
                for (let i = 0; i < users.length; i++) {
                    if (users[i].userId === ownerId) {
                        videoCallInformation.owner = users[i].socketId;
                        break;
                    };
                };
    
                socket.emit('video_call_information', videoCallInformation);
            });
    
            socket.on('calluser', ({ userToCall, signalData, from, name }) => {
                io.to(userToCall).emit('calluser', { signal: signalData, from, name });
            });
    
            socket.on('answercall', data => {
                io.to(roomId).emit('callaccepted', data.signal);
            });
        });

        socket.on('disconnect', () => { 
            console.log('User disconnected:', socket.id) 
            socket.broadcast.emit('callended')
            removeUser(socket.id);
        });
    });

    return io;
};