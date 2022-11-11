const socketio = require("socket.io");
const Message = require("../models/Message");
const User = require("../models/User");
const Block = require("../models/Block");
const Product = require("../models/Product");

const { randomName } = require("../helpers/libs");

module.exports = (server) => {
  let users = [];

  const videoCallUsers = {};
  const socketToRoom = {};
  const idUsersInTheRoom = [];

  const addUser = (userId, socketId) => {
    //!users.some((user) => user.userId === userId) && // si abre varias pestania con el mismo usuario le llegaran igual los eventos en tiempo real
    users.push({ userId, socketId });
  };

  const removeUser = (socketId) => {
    let foundUser = false;

    users.forEach((user) => {
      if (user.socketId === socketId) {
        foundUser = true;
      }
    });
    users = users.filter((user) => user.socketId !== socketId);
    return foundUser;
  };

  const getUser = (userId) => {
    return users.filter((user) => user.userId === userId); // Antes estaba en find pero yo necesito las sesiones que estan abiertas
  };

  const io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  io.on("connection", (socket) => {
    socket.on("connected", (id) => {
      addUser(id, socket.id);
      console.log("User connected:", socket.id);
      io.emit("user_connected");
    });

    socket.on("save_current_user", ({ id, socketId }) => addUser(id, socketId));

    socket.on("logout", (id) => {
      const user = getUser(id);
      io.emit("users_connected", users);
      socket.broadcast.emit("callended");
      console.log("User disconnected:", socket.id);
      if (user) removeUser(user.socketId);
    });

    socket.on("suspension-ended", (id) => {
      const user = getUser(id);
      if (user.length > 0)
        user.forEach((user) => io.to(user.socketId).emit("suspension-ended"));
    });

    socket.on("get_contact", async (transmitter) => {
      const contacts = await Message.find({
        "users.id": transmitter,
      }).sort({ modificationDate: -1 });

      const newContacts = [];

      for (let contact of contacts) {
        const contraryIdentifier =
          contact.users[0].id === transmitter
            ? contact.users[1].id
            : contact.users[0].id;

        const user = getUser(contraryIdentifier);

        const information = {
          ...contact._doc,
          contraryIdentifier,
        };

        const currentBlock = await Block.find({
          $or: [
            { from: transmitter, to: contraryIdentifier },
            { from: contraryIdentifier, to: transmitter },
          ],
        });

        information.currentBlock = currentBlock;

        if (user.length > 0 || contraryIdentifier === "Admin")
          information.active =
            contraryIdentifier === "Admin" ? "Admin" : user.socketId;
        else information.active = null;

        let count = 0;

        const messages = contact.messages;

        for (let i = 0; i < messages.length; i++) {
          if (
            messages[i].view === false &&
            messages[i].receiver === transmitter
          ) {
            count++;
          }
        }

        information.noChecked = count;

        if (contraryIdentifier !== "Admin") {
          const userInformation = await User.findById(contraryIdentifier);

          information.profilePicture = userInformation
            ? userInformation.profilePicture
            : undefined;
          information.fullName = {
            firstName: userInformation ? userInformation.firstName : undefined,
            secondName: userInformation
              ? userInformation.secondName
              : undefined,
            lastName: userInformation ? userInformation.lastName : undefined,
            secondSurname: userInformation
              ? userInformation.secondSurname
              : undefined,
            username: userInformation ? userInformation.username : undefined,
          };
        } else {
          information.fullName = {
            firstName: "Admin",
            username: "Admin",
          };
          information.profilePicture = "Admin";
        }

        newContacts.push(information);
      }

      const currentUser = getUser(transmitter);

      if (currentUser.length > 0)
        currentUser.forEach((user) =>
          io.to(user.socketId).emit("contacts", newContacts)
        );
    });

    socket.on("send_message", async (senderId, receiverId, message) => {
      const userReceiver = getUser(receiverId);
      const userTransmitter = getUser(senderId);

      const receiverInformation = await User.findById(receiverId);
      const transmitterInformation =
        senderId !== "Admin"
          ? await User.findById(senderId)
          : { username: "Admin" };

      const date = new Date();

      const day = `${date.getDate()} de ${
        months[date.getMonth()]
      } de ${date.getFullYear()}`;

      const contact = await Message.findOne({
        $or: [
          {
            key: `${transmitterInformation.username}_${receiverInformation.username}`,
          },
          {
            key: `${receiverInformation.username}_${transmitterInformation.username}`,
          },
        ],
      });

      if (receiverInformation.username !== transmitterInformation.username) {
        if (contact) {
          const dayIndex = contact.messages
            .map((messages) => messages.message)
            .indexOf(day);

          const changeMessage = contact.messages;

          if (dayIndex !== -1) {
            changeMessage.push({
              id: randomName(30),
              transmitter: senderId,
              receiver: receiverId,
              message,
              view: false,
              creationDate: Date.now(),
            });
          } else {
            changeMessage.push(
              {
                id: randomName(30),
                transmitter: "date",
                receiver: "date",
                message: day,
                view: null,
                creationDate: Date.now(),
              },
              {
                id: randomName(30),
                transmitter: senderId,
                receiver: receiverId,
                message,
                view: false,
                creationDate: Date.now(),
              }
            );
          }

          const users = [
            {
              ...contact.users[0],
              wrote:
                contact.users[0].id === senderId
                  ? contact.users[0].wrote
                  : true,
            },
            {
              ...contact.users[1],
              wrote:
                contact.users[1].id === senderId
                  ? contact.users[1].wrote
                  : true,
            },
          ];

          await Message.findByIdAndUpdate(contact._id, {
            users,
            messages: changeMessage,
            modificationDate: Date.now(),
          });

          const messageUpdated = await Message.findById(contact._id);

          if (userTransmitter.length > 0)
            userTransmitter.forEach((user) =>
              io.to(user.socketId).emit("refresh_message", {
                messages: changeMessage,
                key: messageUpdated.key,
              })
            );

          if (userReceiver.length > 0)
            userReceiver.forEach((user) =>
              io.to(user.socketId).emit("new_message", {
                contact: messageUpdated,
                senderId,
              })
            );
          return;
        } else {
          const newMessage = new Message({
            key: `${transmitterInformation.username}_${receiverInformation.username}`,
            users: [
              {
                id: senderId,
                username: transmitterInformation.username,
                wrote: false,
              },
              {
                id: receiverId,
                username: receiverInformation.username,
                wrote: true,
              },
            ],
            messages: [
              {
                id: randomName(30),
                transmitter: "date",
                receiver: "date",
                message: day,
                view: null,
                creationDate: Date.now(),
              },
              {
                id: randomName(30),
                transmitter: senderId,
                receiver: receiverId,
                message,
                view: false,
                creationDate: Date.now(),
              },
            ],
          });
          const resultMessage = await newMessage.save();

          if (userReceiver.length > 0)
            userReceiver.forEach((user) =>
              io.to(user.socketId).emit("new_message", {
                contact: resultMessage,
                senderId,
              })
            );
        }
      }

      return;
    });

    socket.on("revised-message", async ({ contact_key, user_id }) => {
      const contact = await Message.findOne({ key: contact_key });

      const userOne = getUser(contact.users[0].id);
      const userTwo = getUser(contact.users[1].id);

      const messages = contact.messages;

      for (let i = 0; i < messages.length; i++) {
        if (messages[i].receiver === user_id) {
          messages[i].view = true;
        }
      }

      await Message.findByIdAndUpdate(contact._id, { messages });

      if (userOne.length > 0)
        userOne.forEach((user) =>
          io.to(user.socketId).emit("messages-updated", {
            messages,
            senderId: contact.users[1].id,
          })
        );
      if (userTwo.length > 0)
        userTwo.forEach((user) =>
          io.to(user.socketId).emit("messages-updated", {
            messages,
            senderId: contact.users[0].id,
          })
        );
    });

    socket.on("send_message_to_each_user", async (message) => {
      const users = await User.find({ validated: true });

      const date = new Date();

      const day = `${date.getDate()} de ${
        months[date.getMonth()]
      } de ${date.getFullYear()}`;

      let resultMessage;

      for (let user of users) {
        const contact = await Message.findOne({
          key: `Admin_${user.username}`,
        });

        if (contact) {
          const dayIndex = contact.messages
            .map((messages) => messages.message)
            .indexOf(day);

          const changeMessage = contact.messages;

          if (dayIndex !== -1) {
            changeMessage.push({
              id: randomName(30),
              transmitter: "Admin",
              receiver: user._id.toString(),
              message,
              view: false,
              creationDate: Date.now(),
            });
          } else {
            changeMessage.push(
              {
                id: randomName(30),
                transmitter: "date",
                receiver: "date",
                message: day,
                view: null,
                creationDate: Date.now(),
              },
              {
                id: randomName(30),
                transmitter: "Admin",
                receiver: user._id.toString(),
                message,
                view: false,
                creationDate: Date.now(),
              }
            );
          }

          const users = [
            { ...contact.users[0] },
            {
              ...contact.users[1],
              wrote: true,
            },
          ];

          await Message.findByIdAndUpdate(contact._id, {
            users,
            messages: changeMessage,
            modificationDate: Date.now(),
          });

          resultMessage = await Message.findById(contact._id);
        } else {
          const newMessage = new Message({
            key: `Admin_${user.username}`,
            users: [
              {
                id: "Admin",
                username: "Admin",
                wrote: false,
              },
              {
                id: user._id.toString(),
                username: user.username,
                wrote: true,
              },
            ],
            messages: [
              {
                id: randomName(30),
                transmitter: "date",
                receiver: "date",
                message: day,
                view: null,
                creationDate: Date.now(),
              },
              {
                id: randomName(30),
                transmitter: "Admin",
                receiver: user._id.toString(),
                message,
                view: false,
                creationDate: Date.now(),
              },
            ],
          });

          resultMessage = await newMessage.save();
        }
      }

      io.emit("new_message", {
        contact: resultMessage,
        senderId: "Admin",
      });
      io.emit("refresh_message");
    });

    socket.on("send_block", async ({ from, to }) => {
      const user = getUser(to);
      if (user.length > 0)
        user.forEach((user) => io.to(user.socketId).emit("block", from));
    });

    socket.on("received event", async (id, productID) => {
      if (id || productID) {
        let product;

        if (productID !== undefined)
          product = await Product.findById(productID);

        const user = getUser(id ? id : product.owner);

        if (user.length > 0)
          user.forEach((user) => io.to(user.socketId).emit("received event"));
      }
    });

    socket.on("unlocked", ({ userID, from }) => {
      const user = getUser(userID);
      if (user.length > 0)
        user.forEach((user) => io.to(user.socketId).emit("unlocked", from));
    });

    socket.on(
      "product updated",
      async ({ userID, post_id, globalProductUpdate, product }) => {
        const user = getUser(userID);
        const productUpdated = await Product.findById(post_id);

        if (user.length > 0)
          user.forEach((user) =>
            io.to(user.socketId).emit("product updated", {
              product: product ? product : productUpdated,
              global: globalProductUpdate,
            })
          );
      }
    );

    socket.on("product deleted", ({ userID, finished }) => {
      const user = getUser(userID);

      if (user.length > 0)
        user.forEach((user) =>
          io.to(user.socketId).emit("product deleted", { finished })
        );
    });

    socket.on("new offer", ({ userID, post_id }) => {
      const user = getUser(userID);

      if (user.length > 0)
        user.forEach((user) =>
          io.to(user.socketId).emit("new offer", { productID: post_id })
        );
    });

    socket.on("offer event", ({ userID, post_id }) => {
      const user = getUser(userID);

      if (user.length > 0)
        user.forEach((user) =>
          io.to(user.socketId).emit("offer event", { productID: post_id })
        );
    });

    // video_call

    /*socket.on('user in room', roomID => {
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
        });*/

    socket.on("disconnect", () => {
      const foundUser = removeUser(socket.id);

      if (foundUser) {
        console.log("User disconnected:", socket.id);

        io.emit("user disconnected", { socketID: socket.id });
        idUsersInTheRoom.forEach(
          (user, index) =>
            user.socketID === socket.id && idUsersInTheRoom.splice(index, 1)
        );
        const roomID = socketToRoom[socket.id]; // buscamos la sala donde estuvo el usuario

        let room = videoCallUsers[roomID]; // buscamos la sala
        if (room) {
          // si hay mas de un usuario en la sala
          room = room.filter((user) => user.socketID !== socket.id); // hacemos un filtro en la sala y buscamos todos los usuarios menos el que se fue
          videoCallUsers[roomID] = room; // esto son los usuarios que estan dentro de la sala
        }
      }
    });
  });

  return io;
};
