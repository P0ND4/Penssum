const Administration = require("../models/Administration");
const Product = require("../models/Product");
const User = require("../models/User");
const Block = require("../models/Block");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Offer = require("../models/Offer");
const Coupon = require("../models/Coupon");

const sendEmail = require('../helpers/sendEmail');
const sendDeviceNotification = require('../helpers/sendDeviceNotification');
const hash = require("../helpers/hash");

const ctrl = {};

ctrl.main = async (req, res) => {
  const result = await Administration.find();
  if (result.length === 0) {
    const password = await hash.scryptPassword("penssum");

    const subjects = [
      "Acueducto y alcantarillado",
      "Algebra lineal",
      "Algoritmos",
      "Análisis de estructura",
      "Arquitectura de software",
      "Arquitectura del computador",
      "Automatismos",
      "Biología celular",
      "Bioquímica",
      "Calculo diferencial",
      "Calculo integral",
      "Calculo vectorial",
      "Circuitos de energía",
      "Circuitos eléctricos",
      "Computación en paralelo",
      "Control de calidad",
      "Control de productividad",
      "Control eléctrico",
      "Costos",
      "Dibujos eléctricos",
      "Dinámica",
      "Diseño de plantas de proceso",
      "Diseño de vías",
      "Diseño mecánico",
      "Derecho",
      "Ecología",
      "Ecuaciones diferenciales",
      "Electrónica basica",
      "Electrónica complementaria",
      "Electrónica de potencia",
      "Estadísticas inferencial",
      "Estadísticas y probabilidad",
      "Estructura de datos",
      "Estructura geotérmica",
      "Estática",
      "Fundamentos de Programación",
      "Física eléctrica y magnetismo",
      "Física mecánica",
      "Física ondulatoria",
      "Geociencia",
      "Geometría analítica",
      "Geomática",
      "Hidrología",
      "Hidráulica",
      "Inglés",
      "Infraestructura",
      "Infraestructura para TI",
      "Ingeniería de reacciones",
      "Ingeniería de software",
      "Ingeniería de tránsito",
      "Ingeniería económica",
      "Instalaciones eléctricas",
      "Instrumentación electrónica",
      "Instrumentación y control",
      "Inteligencia artificial",
      "Inventarios",
      "Manejo de sólidos",
      "Maquinas eléctricas",
      "Matemáticas básicas",
      "Matemáticas discretas",
      "Materia y energía",
      "Mecánica de fluidos",
      "Microbiología",
      "Ondas y líneas de transmisión",
      "Operaciones unitarias",
      "Pavimentos",
      "Procesamiento numérico",
      "Procesos de fabricación",
      "Procesos de separación",
      "Procesos estocásticos",
      "Procesos industriales",
      "Productividad",
      "Química general",
      "Química inorgánica",
      "Química orgánica",
      "Redes de comunicación",
      "Refrigeración y aire acondicionado",
      "Resistencia de materiales",
      "Señales eléctricas",
      "Simulación de procesos",
      "Sistema de transporte",
      "Sistema y modelo",
      "Sistemas de energía",
      "Sistemas de potencia",
      "Sistemas de tratamiento de agua",
      "Sistemas digitales",
      "Sistemas embebidos",
      "Sistemas operativos",
      "Subestaciones eléctricas",
      "Tesis",
      "Termodinámica",
      "Transferencia de calor",
    ];

    const createAdministration = new Administration({
      firstPassword: password,
      secondPassword: password,
      subjects,
    });
    const result = createAdministration.save();
    res.send(result);
  } else {
    await Administration.findByIdAndUpdate(result[0]._id, {
      views: result[0].views + 1,
    });
    res.send(result[0]);
  }
};

ctrl.checkAdminInformation = async (req, res) => {
  const { security, data } = req.body;

  const administrationInformation = await Administration.find();

  if (security === 1) {
    if (data.email === administrationInformation[0].firstEmail) {
      const match = await hash.matchPassword(
        data.password,
        administrationInformation[0].firstPassword
      );

      if (match) res.send({ error: null, type: "correct data" });
      else res.send({ error: true, type: "wrong password" });
    } else res.send({ error: true, type: "wrong email" });
  } else if (security === 2) {
    if (data.email === administrationInformation[0].secondEmail) {
      const match = await hash.matchPassword(
        data.password,
        administrationInformation[0].secondPassword
      );

      if (match) {
        if (administrationInformation[0].keyword === data.keyword) {
          res.send({ error: null, type: "correct data" });
        } else res.send({ error: true, type: "wrong keyword" });
      } else res.send({ error: true, type: "wrong password" });
    } else res.send({ error: true, type: "wrong email" });
  }
};

ctrl.dashboard = async (req, res) => {
  const administration = await Administration.find();

  const mainInformation = {
    totalUsers: 0,
    totalProducts: 0,
    productsToReview: 0,
    reports: 0,
    concreteOffers: 0,
    videoCallsMade: 0,
    registeredUsers: [0, 0, 0, 0, 0, 0, 0],
    currentProducts: [0, 0, 0, 0, 0, 0, 0],
    lastProducts: [0, 0, 0, 0, 0, 0, 0],
    usersStatus: [0, 0, 0],
    violationsTotal: administration[0].violations,
    totalViews: administration[0].views,
    firstEmail: administration[0].firstEmail,
    firstPassword: administration[0].firstPassword,
    secondEmail: administration[0].secondEmail,
    secondPassword: administration[0].secondPassword,
    keyword: administration[0].keyword,
    name: administration[0].name,
    subjects: administration[0].subjects,
  };

  const users = await User.find();
  mainInformation.totalUsers = users.length;

  const reports = await Notification.find({ to: "Admin", view: false });
  mainInformation.reports = reports.length;

  const totalOffers = await Offer.find({ acceptOffer: true });
  mainInformation.concreteOffers = totalOffers.length;

  const totalVideoCallServices = await Product.find({
    videoCall: { $ne: null },
  });
  mainInformation.videoCallsMade = totalVideoCallServices.length;

  const currentUsersStatus = [0, 0, 0];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.typeOfUser.user === "free") currentUsersStatus[0] += 1;
    if (user.typeOfUser.user === "layoff") currentUsersStatus[1] += 1;
    if (user.typeOfUser.user === "block") currentUsersStatus[2] += 1;

    if (i + 1 === users.length)
      mainInformation.usersStatus = currentUsersStatus;
  }

  const calculateDate = (discountDays, sendingData) => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - discountDays);
    if (sendingData === "dateInText")
      return `${currentDate.getDate()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getFullYear()}`;
    else if (sendingData === "date") return currentDate;
  };

  const minimumDateToSearchUser = calculateDate(7, "date");

  const usersOfTheWeek = await User.find({
    creationDate: { $gte: minimumDateToSearchUser },
  });

  const registeredUsers = {
    date: [
      calculateDate(0, "dateInText"),
      calculateDate(1, "dateInText"),
      calculateDate(2, "dateInText"),
      calculateDate(3, "dateInText"),
      calculateDate(4, "dateInText"),
      calculateDate(5, "dateInText"),
      calculateDate(6, "dateInText"),
    ],
    users: [0, 0, 0, 0, 0, 0, 0],
  };

  for (let i = 0; i < usersOfTheWeek.length; i++) {
    const day = usersOfTheWeek[i].creationDate.getDate();
    const month = usersOfTheWeek[i].creationDate.getMonth() + 1;
    const year = usersOfTheWeek[i].creationDate.getFullYear();

    const currentRegisteredUsers = registeredUsers.date.indexOf(
      `${day}-${month}-${year}`
    );

    if (currentRegisteredUsers !== -1)
      registeredUsers.users[currentRegisteredUsers] += 1;
    else console.log("The User does not belong to any date");

    if (i + 1 === usersOfTheWeek.length)
      mainInformation.registeredUsers = registeredUsers.users;
  }

  const productsActivated = await Product.find({ stateActivated: true });
  mainInformation.totalProducts = productsActivated.length;

  const productsToReview = await Product.find({ stateActivated: false });
  mainInformation.productsToReview = productsToReview.length;

  const searchByDate = calculateDate(14, "date");

  const currentProducts = {
    date: [
      calculateDate(0, "dateInText"),
      calculateDate(1, "dateInText"),
      calculateDate(2, "dateInText"),
      calculateDate(3, "dateInText"),
      calculateDate(4, "dateInText"),
      calculateDate(5, "dateInText"),
      calculateDate(6, "dateInText"),
    ],
    products: [0, 0, 0, 0, 0, 0, 0],
  };

  const lastProducts = {
    date: [
      calculateDate(7, "dateInText"),
      calculateDate(8, "dateInText"),
      calculateDate(9, "dateInText"),
      calculateDate(10, "dateInText"),
      calculateDate(11, "dateInText"),
      calculateDate(12, "dateInText"),
      calculateDate(13, "dateInText"),
    ],
    products: [0, 0, 0, 0, 0, 0, 0],
  };

  const latestProducts = await Product.find({
    creationDate: { $gte: searchByDate },
  });

  for (let i = 0; i < latestProducts.length; i++) {
    const day = latestProducts[i].creationDate.getDate();
    const month = latestProducts[i].creationDate.getMonth() + 1;
    const year = latestProducts[i].creationDate.getFullYear();

    const currentDateToCompare = currentProducts.date.indexOf(
      `${day}-${month}-${year}`
    );
    const lastDateToCompare = lastProducts.date.indexOf(
      `${day}-${month}-${year}`
    );

    if (currentDateToCompare !== -1)
      currentProducts.products[currentDateToCompare] += 1;
    else if (lastDateToCompare !== -1)
      lastProducts.products[lastDateToCompare] += 1;
    else console.error("The Product does not belong to any date");

    if (i + 1 === latestProducts.length) {
      mainInformation.lastProducts = lastProducts.products;
      mainInformation.currentProducts = currentProducts.products;
    }
  }

  res.send(mainInformation);
};

ctrl.changePreferenceValue = async (req, res) => {
  const { name, value } = req.body;

  const administration = await Administration.find();
  await Administration.findByIdAndUpdate(administration[0]._id, {
    [name]: value,
  });

  res.send("updated");
};

ctrl.changePassword = async (req, res) => {
  const { typePassword, password, newPassword } = req.body;

  const administrationInformation = await Administration.find();

  if (typePassword === 1) {
    const match = await hash.matchPassword(
      password,
      administrationInformation[0].firstPassword
    );

    if (match) {
      const encryptedPassword = await hash.scryptPassword(newPassword);
      await Administration.findByIdAndUpdate(administrationInformation[0]._id, {
        firstPassword: encryptedPassword,
      });
      return res.send({ error: null, type: "First password changed" });
    } else return res.send({ error: true, type: "Invalid password" });
  } else if (typePassword === 2) {
    const match = await hash.matchPassword(
      password,
      administrationInformation[0].secondPassword
    );

    if (match) {
      const encryptedPassword = await hash.scryptPassword(newPassword);
      await Administration.findByIdAndUpdate(administrationInformation[0]._id, {
        secondPassword: encryptedPassword,
      });
      return res.send({ error: null, type: "Second password changed" });
    } else return res.send({ error: true, type: "Invalid password" });
  }
};

ctrl.sendWarning = async (req, res) => {
  const { title, description, to } = req.body;

  const newNotification = new Notification({
    username: "Admin",
    from: "Admin",
    to,
    title: `Admin (${title})`,
    description,
    color: "orange",
    image: "admin",
  });

  await newNotification.save();

  const contentHTML = `
            <div style="width: 100%; margin: 0;" >
                <img src="cid:penssum" style="display: block; margin: 20px auto; width: 120px; border-radius: 16px;"/>
                <h1 style="display: block; width: 90%; margin: 25px auto; text-align: center; font-family: sans-serif; color: #666;">ADMIN, ${title}</h1>
                <p style="display: block; width: 90%; margin: 0 auto; text-align: center; font-family: sans-serif; font-size: 18px; color: #666;">${description}</p>
                <footer style="width: 100%; margin-top: 20px;">
                <p style="display: block; width: 90%; margin: 10px auto; color: #666; font-size: 18px; text-align: center;">Síguenos en nuestras redes sociales</p>
                <div style="display: block; width: 90%; margin: 20px auto; color: #666; font-size: 18px; text-align: center;">
                  <a href="https://www.facebook.com/Penssum-103217072423786/" style="margin: 0 10px"><img src="cid:facebook" style="width: 35px; height: 35px;"/></a>
                  <a href="https://twitter.com/penssum?t=seJ7n3XjHGKSx8zNBLexmQ&s=09" style="margin: 0 10px"><img src="cid:twitter" style="width: 35px; height: 35px;"/></a>
                  <a href="https://www.instagram.com/penssum/" style="margin: 0 10px"><img src="cid:instagram" style="width: 35px; height: 35px;"/></a>
                </div>
              </footer>
            </div>
        `;

  const { email } = await User.findById(to);

  const informationToSend = {
    to: email,
    subject: `ADMIN`,
    html: contentHTML,
    attachments: [
      {
        filename: "penssum-transparent.png",
        path: `${process.env.API_PENSSUM}/penssum-transparent.png`,
        cid: "penssum",
      },
      {
        filename: "facebook.png",
        path: `${process.env.API_PENSSUM}/facebook.png`,
        cid: "facebook",
      },
      {
        filename: "instagram.png",
        path: `${process.env.API_PENSSUM}/instagram.png`,
        cid: "instagram",
      },
      {
        filename: "twitter.png",
        path: `${process.env.API_PENSSUM}/twitter.png`,
        cid: "twitter",
      },
    ],
  };

  await sendEmail(informationToSend);
  sendDeviceNotification({
    title: `📲 Advertencia 📬`,
    body: description,
    isAdmin: false,
    ids: [to],
  });

  res.send("Warning sent");
};

ctrl.userStatusChange = async (req, res) => {
  const { id, typeOfUser, date, eraseEverything } = req.body;

  const administration = await Administration.find();

  await User.findByIdAndUpdate(id, { "typeOfUser.user": typeOfUser });

  if (typeOfUser === "layoff" || typeOfUser === "block") {
    await Administration.findByIdAndUpdate(administration[0]._id, {
      violations: administration[0].violations + 1,
    });
    const user = await User.findById(id);
    await User.findByIdAndUpdate(id, { breaches: user.breaches + 1 });
  }

  if (date) {
    await User.findByIdAndUpdate(id, { "typeOfUser.suspension": date });
  } else {
    await User.findByIdAndUpdate(id, { "typeOfUser.suspension": null });
  }

  const user = await User.findById(id);

  if (typeOfUser !== "block") {
    const newNotification = new Notification({
      username: "Admin",
      from: "Admin",
      to: id,
      title: `Admin (${typeOfUser})`,
      description:
        typeOfUser === "free"
          ? "Te hemos pasado al modo libre, disculpe las molestias ocasionadas."
          : "Has entrado en un estado de suspensión porque no has cumplido con algunas normas del uso de Penssum, disculpe las molestias, el tiempo de suspensión, aparecerá en su perfil",
      color: typeOfUser === "free" ? "green" : "orange",
      image: "admin",
    });

    await newNotification.save();
  } else {
    if (eraseEverything) {
      const userNotifications = await Notification.find({ to: id });
      const products = await Product.find({ owner: id });

      products.forEach(async (product) => {
        try {
          await fs.unlink(
            path.resolve(`src/public/optimize/${product.miniature}`)
          );
        } catch (e) {
          console.log("Image not found");
        }
      });

      if (user.profilePicture !== null) {
        try {
          await fs.unlink(
            path.resolve(
              `src/public/user/${user.userImageFileName.profilePicture}`
            )
          );
        } catch (e) {
          console.log("Image not found");
        }
      }

      if (user.coverPhoto !== null) {
        try {
          await fs.unlink(
            path.resolve(`src/public/user/${user.userImageFileName.coverPhoto}`)
          );
        } catch (e) {
          console.log("Image not found");
        }
      }

      if (userNotifications.length > 0) {
        userNotifications.forEach((notification) => {
          const files = notification.files;
          files.forEach(async (file) => {
            try {
              await fs.unlink(
                path.resolve(`src/public/quotes/${file.fileName}`)
              );
            } catch (e) {
              console.log("Image not found");
            }
          });
        });
      }

      const contacts = await Message.find({
        "users.id": id,
      });

      const currentContacts = [];

      for (let contact of contacts) {
        const contraryIdentifier =
          contact.users[0].id === id
            ? contact.users[1].id
            : contact.users[0].id;

        const user = await User.findById(contraryIdentifier);

        if (user) currentContacts.push(contact);
      }

      for (let contact of currentContacts) {
        await Message.deleteMany({ key: contact.key });
      }

      await User.findByIdAndUpdate(id, {
        coverPhoto: null,
        profilePicture: null,
      });
      await Product.deleteMany({ owner: id });
      await Block.deleteMany({ $or: [{ from: id }, { to: id }] });
      await Notification.deleteMany({ to: id });
    }

    await Offer.deleteMany({ user: id, acceptOffer: false });
  }

  const contentHTML = `
            <div style="width: 100%; margin: 0;" >
                <img src="cid:penssum" style="display: block; margin: 20px auto; width: 120px; border-radius: 16px;"/>
                <h1 style="display: block; width: 90%; margin: 25px auto; text-align: center; font-family: sans-serif; color: #666;">ADMIN</h1>
                <p style="display: block; width: 90%; margin: 0 auto; text-align: center; font-family: sans-serif; font-size: 18px; color: #666;">${
                  typeOfUser === "free"
                    ? "Te hemos pasado al modo libre, disculpe las molestias ocasionadas."
                    : typeOfUser !== "block"
                    ? "Has entrado en un estado de suspensión porque no has cumplido con algunas normas del uso de Penssum, disculpe las molestias, el tiempo de suspensión, aparecerá en su perfil"
                    : "Has entrado en un estado de bloqueo permanente porque has violado las políticas del buen uso de penssum, disculpe las molestias, no podrá tener más acceso a nuestra plataforma, si cree que nos equivocamos puede enviarnos un mensaje a este mismo correo."
                }</p>
                <footer style="width: 100%; margin-top: 20px;">
                <p style="display: block; width: 90%; margin: 10px auto; color: #666; font-size: 18px; text-align: center;">Síguenos en nuestras redes sociales</p>
                <div style="display: block; width: 90%; margin: 20px auto; color: #666; font-size: 18px; text-align: center;">
                  <a href="https://www.facebook.com/Penssum-103217072423786/" style="margin: 0 10px"><img src="cid:facebook" style="width: 35px; height: 35px;"/></a>
                  <a href="https://twitter.com/penssum?t=seJ7n3XjHGKSx8zNBLexmQ&s=09" style="margin: 0 10px"><img src="cid:twitter" style="width: 35px; height: 35px;"/></a>
                  <a href="https://www.instagram.com/penssum/" style="margin: 0 10px"><img src="cid:instagram" style="width: 35px; height: 35px;"/></a>
                </div>
              </footer>
            </div>
        `;

  const { email } = await User.findById(id);

  const informationToSend = {
    to: email,
    subject: `ADMIN, ${
      typeOfUser === "free"
        ? "Buenas noticias"
        : typeOfUser !== "block"
        ? "Lo sentimos"
        : "Estás bloqueado"
    }`,
    html: contentHTML,
    attachments: [
      {
        filename: "penssum-transparent.png",
        path: `${process.env.API_PENSSUM}/penssum-transparent.png`,
        cid: "penssum",
      },
      {
        filename: "facebook.png",
        path: `${process.env.API_PENSSUM}/facebook.png`,
        cid: "facebook",
      },
      {
        filename: "instagram.png",
        path: `${process.env.API_PENSSUM}/instagram.png`,
        cid: "instagram",
      },
      {
        filename: "twitter.png",
        path: `${process.env.API_PENSSUM}/twitter.png`,
        cid: "twitter",
      },
    ],
  };

  await sendEmail(informationToSend);
  sendDeviceNotification({
    title: `📲 ${
      typeOfUser === "free"
        ? "Buenas noticias"
        : typeOfUser !== "block"
        ? "Lo sentimos"
        : "Estás bloqueado"
    } 📬`,
    body:
      typeOfUser === "free"
        ? "Te hemos pasado al modo libre, disculpe las molestias ocasionadas."
        : typeOfUser !== "block"
        ? "Has entrado en un estado de suspensión porque no has cumplido con algunas normas del uso de Penssum, disculpe las molestias, el tiempo de suspensión, aparecerá en su perfil"
        : "Has entrado en un estado de bloqueo permanente porque has violado las políticas del buen uso de penssum, disculpe las molestias.",
    isAdmin: false,
    ids: [id],
  });

  res.send(user);
};

ctrl.createCoupon = async (req, res) => {
  const data = req.body;

  const coupon = await Coupon.findOne({ name: data.name });

  if (coupon) res.send({ error: true, type: "the coupon already exists" });
  else {
    const newCoupon = new Coupon(data);
    const result = await newCoupon.save();

    res.send(result);
  }
};

module.exports = ctrl;
