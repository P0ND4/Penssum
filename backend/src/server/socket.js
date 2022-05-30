const socketio = require('socket.io');
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');

module.exports = server => {
    let users = [];

    const videoCallUsers = {};
    const socketToRoom = {};
    const idUsersInTheRoom = [];

    const addUser = (userId, socketId) => {
        !users.some(user => user.userId === userId) &&
            users.push({ userId, socketId });
    };

    const removeUser = (socketId) => {
        let foundUser = false;
        users.forEach(user => { if (user.socketId === socketId) { foundUser = true } });
        users = users.filter(user => user.socketId !== socketId);
        return foundUser;
    };

    const getUser = (userId) => {
        return users.find(user => user.userId === userId);
    };

    const io = socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', socket => {
        socket.on('connected', id => {
            addUser(id, socket.id);
            console.log('User connected:', socket.id);
            io.emit('user_connected');
        });

        socket.on('save_current_user', ({ id, socketId }) => addUser(id, socketId));

        socket.on('logout', id => {
            const user = getUser(id);
            io.emit('users_connected', users);
            socket.broadcast.emit('callended');
            console.log('User disconnected:', socket.id);
            if (user) removeUser(user.socketId);
        });

        socket.on('suspension-ended', id => {
            const user = getUser(id);
            io.to(user.socketId).emit('suspension-ended');
        });

        socket.on('get_contact', async transmitter => {
            const contacts = await Message.find({
                $or: [
                    { transmitter },
                    { receiver: transmitter }
                ]
            }).sort({ creationDate: -1 });

            const newContacts = [];

            contacts.forEach(contact => {
                const user = getUser(contact.transmitter === transmitter ? contact.receiver : contact.transmitter);

                const contactMessage = {
                    transmitter: contact.transmitter, 
                    receiver: contact.receiver, 
                    message: contact.message, 
                    view: contact.view, 
                    creationDate: contact.creationDate
                };

                if (user) contactMessage.active = user.socketId
                else contactMessage.active = null;

                newContacts.push(contactMessage);
            });

            const currentUser = getUser(transmitter);

            if (currentUser) io.to(currentUser.socketId).emit('contacts', newContacts);
        });

        socket.on('get_messages', async (transmitter, receiver) => {
            const messages = await Message.find({
                $or: [
                    { transmitter, receiver },
                    { transmitter: receiver, receiver: transmitter },
                ]
            }).sort({ creationDate: 1 });

            socket.emit('messages', messages);
        });

        socket.on('send_message', async (senderId, receiverId, message) => {
            const user = getUser(receiverId);

            const newMessage = new Message({ transmitter: senderId, receiver: receiverId, message });
            const resultMessage = await newMessage.save();

            if (user) io.to(user.socketId).emit('new_message', resultMessage);
        });

        socket.on('send_message_to_each_user', async message => {
            const users = await User.find({ validated: true });

            users.forEach(async (user, index) => {
                const newMessage = new Message({ transmitter: 'Admin', receiver: user._id, message });
                const resultMessage = await newMessage.save();

                if (index+1 === users.length) io.emit('new_message', resultMessage);
            });
        });

        socket.on('send_block', async ({ from, to }) => {
            const user = getUser(to);
            if (user) io.to(user.socketId).emit('block', from);
        });

        socket.on('received event', async (id,productID) => {
            if (id || productID) {
                let product;

                if (productID !== undefined) product = await Product.findById(productID);

                const user = getUser(id ? id : product.owner);

                if (user) io.to(user.socketId).emit('received event');
            } else io.emit('received event');
        });

        // video_call

        socket.on('user in room', roomID => {
            socket.join(roomID);

            socket.on("join room", async ({ roomID, userID, media }) => { // Entra al link de la videollamada y le pasa el parametro con el que entro.
                if (videoCallUsers[roomID]) { // comprueba si existe una sala activa.
                    const length = videoCallUsers[roomID].length; // vemos la cantidad de usuarios en la sala.
                    if (length === 60) { // si es igual a 60 usuarios, la sala decimos que esta llena.
                        socket.emit("room full"); // le enviamos al usuario que la sala esta llena.
                        return; // terminamos el codigo
                    };
                };
            
                const currentUserInTheRoom = idUsersInTheRoom.filter(user => user.userID === userID);
                const user = await User.findById(userID);

                if (currentUserInTheRoom.length > 0) { // si existe el mismo usuario en otra videollamada.
                    io.to(socket.id).emit('user error in videocall'); // enviarle que ya se ha unido a una sala.
                    return // acabamos el codigo
                } else if (videoCallUsers[roomID]) {
                    videoCallUsers[roomID].push({ 
                        socketID: socket.id, userID, 
                        media: { 
                            profilePicture: user.profilePicture, 
                            video: media.video, audio: media.audio 
                        },
                        names: {
                            username: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName
                        }}) // si no esta llena agrega el nuevo usuario que entro.
                } else {
                    videoCallUsers[roomID] = [{ 
                        socketID: socket.id, 
                        userID, 
                        media: { 
                            profilePicture: user.profilePicture, 
                            video: media.video, 
                            audio: media.audio 
                        },
                        names: {
                            username: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName
                        }
                    }] 
                } // si no hay una sala existente pues crea la sala y agrega al usuario. 

                idUsersInTheRoom.push({ userID, socketID: socket.id });
                socketToRoom[socket.id] = roomID; // guardamos la url con que el usuario entro a la videollamada.

                const usersInThisRoom = videoCallUsers[roomID].filter(user => user.userID !== userID); // creamos un nuevo array en que el id del usuario no sea igual a el mismo.

                socket.emit("all users", usersInThisRoom); // le enviamos a todos los usuarios de la sala, los usuarios conectados
            });

            socket.on("sending signal", payload => { // captamos la señal y la informacion del usuario.
                io.to(payload.userToSignal).emit('user joined', { 
                    signal: payload.signal, 
                    callerID: payload.callerID, 
                    userID: payload.userID, 
                    media: { 
                        profilePicture: payload.media.profilePicture, 
                        video: payload.media.video, 
                        audio: payload.media.audio 
                    }, 
                    names: { 
                        username: payload.names.username, 
                        firstName: payload.names.firstName,
                        lastName: payload.names.lastName 
                    }}); 
                // callerID es el socketID del usuario que esta entrando
                // signal es la señal del usuario que ha entrado
                // userToSignal es el usuario a enviar la informacion
                // esto se repite a todos los usuarios que estan dentro de una sala, esto es para que la informacion le llegue a todos
            });

            socket.on("returning signal", payload => {
                io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
                // callerID Es el usuario que ha entrado.
                // signal es la señal actual de nosotros
                // socket.id es el id de nosotros
                // retornamos nuestra informacion al usuario que entro, esto es para que el tambien pueda tener el video y el audio de nosotros.
            });

            socket.on('call teacher', ({ teacherToCall, from, name, profilePicture }) => {
                const isTheExistingUser = idUsersInTheRoom.filter(user => user.userID === from);
                if (isTheExistingUser.length > 0) return;

                const teacher = getUser(teacherToCall);
                const user = getUser(from);

                if (teacher) io.to(teacher.socketId).emit('receiving call', { from, name, profilePicture })
                else if (user) io.to(user.socketId).emit('teacher not connected');
            });

            socket.on('call status', ({ id, isAccepted }) => {
                const user = getUser(id);

                if (user) {
                    if (isAccepted) io.to(user.socketId).emit('call accepted')
                    else io.to(user.socketId).emit('call denied');
                };
            });

            socket.on('request pending calls', ({ roomID }) => {
                io.emit('get calls', { room: roomID });
            });

            socket.on('change video call property', ({ userID, property, value }) => {
                videoCallUsers[roomID].forEach((user,index) => {
                    if (user.userID === userID) {
                        user.media[property] = value;
                    };
                });

                io.to(roomID).emit('change user property', { userID, property, value });
            });

            socket.on('leave video call', ({ userID, from }) => {
                if (userID === undefined) {
                    idUsersInTheRoom.forEach((user,index) => (user.socketID === socket.id) && idUsersInTheRoom.splice(index,1));

                    if (videoCallUsers[roomID]) { // si hay mas de un usuario en la sala
                        room = videoCallUsers[roomID].filter(user => user.socketID !== socket.id); // hacemos un filtro en la sala y buscamos todos los usuarios menos el que se fue
                        videoCallUsers[roomID] = room; // esto son los usuarios que estan dentro de la sala
                    };

                    io.to(roomID).emit('user disconnected', ({ socketID: socket.id }));
                } else {
                    idUsersInTheRoom.forEach((user,index) => (user.userID === userID) && idUsersInTheRoom.splice(index,1));
                    const user = videoCallUsers[roomID].filter(user => user.userID === userID);

                    if (videoCallUsers[roomID]) { // si hay mas de un usuario en la sala
                        room = videoCallUsers[roomID].filter(user => user.socketID !== socket.id); // hacemos un filtro en la sala y buscamos todos los usuarios menos el que se fue
                        videoCallUsers[roomID] = room; // esto son los usuarios que estan dentro de la sala
                    };

                    io.to(roomID).emit('user disconnected', ({ userID, socketID: user.socketID, from: 'teacher' }));
                };
            });
        });

        socket.on('disconnect', () => {
            const foundUser = removeUser(socket.id);

            if (foundUser) { 
                console.log('User disconnected:', socket.id);

                io.emit('user disconnected', ({ socketID: socket.id }));
                idUsersInTheRoom.forEach((user,index) => (user.socketID === socket.id) && idUsersInTheRoom.splice(index,1));
                const roomID = socketToRoom[socket.id]; // buscamos la sala donde estuvo el usuario
                
                let room = videoCallUsers[roomID]; // buscamos la sala
                if (room) { // si hay mas de un usuario en la sala
                    room = room.filter(user => user.socketID !== socket.id); // hacemos un filtro en la sala y buscamos todos los usuarios menos el que se fue
                    videoCallUsers[roomID] = room; // esto son los usuarios que estan dentro de la sala
                };
            };
        });
    });

    return io;
};