const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { randomName } = require('../helpers/libs');
const helperImg = require('../helpers/resizeImage');
const md5 = require('md5');

const Product = require('../models/Product');
const Offer = require('../models/Offer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Block = require('../models/Block');
const Transaction = require('../models/Transaction');
const Vote = require('../models/Vote');

const ctrl = {};

const getTotalVotes = async (products,res) => {
    if (products.length === 0) res.send(products)
    else {
        const currentProducts = [];

        const getVotes = async product => {
            let generalVotes = 0;
            const productVotes = await Vote.find({ to: product.owner, pending: false });
                
            if (productVotes.length >= 5) {
                productVotes.forEach((productVote,index) => {
                    generalVotes += productVote.vote;

                    if (index + 1 === productVotes.length) generalVotes = (generalVotes / productVotes.length);
                });
            } else { generalVotes = 0 };

            return generalVotes
        };

        for (let i = 0; i < products.length; i++) {
            const votes = await getVotes(products[i]);
            const newProduct = { ...products[i]._doc, votes };
            currentProducts.push(newProduct);
        };

        res.send(currentProducts);
    };
};

ctrl.products = async (req, res) => {
    const { username, id, review, videoCallURL, blockSearch, tasks } = req.body;

    if (tasks !== undefined) {
        const product = await Product.find({ takenBy: tasks }).sort({ creationDate: -1 });
        return res.send(product);
    };

    if (videoCallURL !== undefined) {
        const product = await Product.findOne({ videoCall: videoCallURL });
        return res.send(product);
    };

    if (review !== undefined) {
        const product = await Product.find({ stateActivated: false }).sort({ creationDate: -1 });
        return res.send(product);
    };

    if (id !== undefined) {
        try {
            const product = await Product.findById(id);
            res.send(product);
        } catch (e) { return res.send({ error: true, type: 'Product not found' }) };
    };

    if (username === undefined && id === undefined) {
        const blockResult = await Block.find({
            $or: [
                { from: blockSearch },
                { to: blockSearch }
            ]
        });

        if (blockResult.length > 0) {
            const productsToRemove = [];

            blockResult.forEach(block => {
                if (block.to === blockSearch) productsToRemove.push({ owner: { $ne: block.from } })
                else productsToRemove.push({ owner: { $ne: block.to } });
            });

            const products = await Product.find({
                stateActivated: true,
                takenBy: null,
                $and: productsToRemove
            }).sort({ creationDate: -1 });

            await getTotalVotes(products,res);
        } else {
            const blockedUsers = await User.find({ 'typeOfUser.user': 'block' });
            const arraysUsers = [];
            
            if (blockedUsers.length > 0) {
                blockedUsers.forEach(user => arraysUsers.push({ owner: { $ne: user._id } }));

                const products = await Product.find({ 
                    stateActivated: true,
                    takenBy: null, 
                    $and: arraysUsers 
                }).sort({ creationDate: -1 });
                await getTotalVotes(products,res);
            } else {
                const products = await Product.find({ stateActivated: true, takenBy: null }).sort({ creationDate: -1 });
                await getTotalVotes(products,res);
            };
        };
    };

    if (username !== undefined) {
        const products = await Product.find({ creatorUsername: username }).sort({ creationDate: -1, views: -1 });
        await getTotalVotes(products,res);
    };
};

ctrl.fileSelection = (req, res) => {
    const files = req.files;

    const result = {
        successfulFiles: [],
        errors: []
    };

    const putError = async (fileAddress, typeError, data) => {
        await fs.unlink(fileAddress);
        result.errors.push({ type: typeError, data });
    };

    files.forEach((file, index) => {
        const validateFile = async () => {
            const URLFile = randomName(15);
            if (fs.existsSync(`src/public/temporal/${URLFile}`)) validateFile()
            else {
                const fileAddress = file.path;
                const size = file.size;
                const extname = path.extname(file.originalname).toLocaleLowerCase();
                const targetPath = path.resolve(`src/public/temporal/${URLFile}${extname}`);

                const filesAllowed = /jpg|png|jpeg|tiff|tif|psd|webp|pdf|epub|azw|ibook|doc|docx/;

                if (filesAllowed.test(extname) && filesAllowed.test(file.mimetype)) {
                    if (size <= 5000000) {
                        await fs.rename(fileAddress, targetPath);
                        result.successfulFiles.push({
                            fileName: URLFile + extname,
                            uniqueId: URLFile,
                            extname,
                            url: `${process.env.API_PENSSUM}/temporal/${URLFile + extname}`
                        });
                    } else await putError(fileAddress, 'Invalid size', size);
                } else await putError(fileAddress, 'Invalid format', fileAddress.originalname);
            };
            if (index + 1 === files.length) setTimeout(() => res.send(result), 1000)
        };
        validateFile();
    });
};

ctrl.removeFiles = async (req, res) => {
    const { files, fileName, activate } = req.body;
    if (files === undefined) {
        try { await fs.unlink(path.resolve(`src/public/temporal/${fileName}`)); } catch (e) { console.log(e) };
        res.send('deleted');
    } else {
        if (files !== null) {
            const imagesAllowed = /jpg|png|jpeg|tiff|tif|psd|webp/;

            for (let i = 0; i < files.length; i++) {
                if (imagesAllowed.test(files[i].extname)) {
                    try { await fs.unlink(path.resolve(`src/public/optimize/resize-${files[i].fileName}`)); } catch (e) { console.log(e) };
                    break;
                };
            };

            files.forEach(async (file, index) => {
                try { await fs.unlink(path.resolve(`src/public/${activate !== undefined && activate ? 'services' : 'temporal'}/${file.fileName}`)); } catch (e) { console.log(e) };
                if (index + 1 === files.length) return setTimeout(() => res.send('deleted'), 1000);
            });
        } else { res.status(404).send({ error: null, type: 'there are no found files to delete', files }) };
    }
};

ctrl.create = async (req, res) => {
    const data = req.body;

    const imagesAllowed = /jpg|png|jpeg|tiff|tif|psd|webp/;
    let url = '';
    let miniature = '';

    for (let i = 0; i < data.files.length; i++) {
        if (imagesAllowed.test(data.files[i].extname)) {
            await helperImg(path.resolve(`src/public/temporal/${data.files[i].fileName}`), data.files[i].fileName);
            url = `${process.env.API_PENSSUM}/optimize/resize-${data.files[i].fileName}`;
            miniature = `resize-${data.files[i].fileName}`;
            break;
        } else { url = '/img/document_image.svg' };
    };

    data.files.forEach(async file => {
        file.url = `${process.env.API_PENSSUM}/services/${file.fileName}`;
        try { await fs.rename(`src/public/temporal/${file.fileName}`, `src/public/services/${file.fileName}`); } catch (e) { console.log(e.message) };
    });

    const createURL = async () => {
        const VideoCallURL = randomName(15);

        const product = await Product.find({ videoCall: VideoCallURL });
        if (product) createURL();

        return VideoCallURL;
    };

    data.videoCall = data.videoCall ? await createURL() : null;
    data.linkMiniature = url;
    data.miniature = miniature;
    data.modifiedDescription = data.description.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const newProduct = new Product(data);
    const result = await newProduct.save();

    if (data.advancePayment) {
        const transaction = await Transaction.findOne({ userId: data.owner }).sort({ creationDate: -1 })
        await Transaction.findById(transaction._id,{ productId: result._id });
    }

    res.send(result);
};

ctrl.makeOffer = async (req, res) => {
    try {
        const data = req.body
        const newOffer = new Offer(data.mainInformation);
        const result = await newOffer.save();

        const user = await User.findById(data.mainInformation.user);
        const product = await Product.findById(data.mainInformation.product);

        const newNotification = new Notification({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            from: data.mainInformation.user,
            to: data.notification,
            productId: data.mainInformation.product,
            title: 'Tienes una oferta',
            description: `El profesor ${user.firstName} ${user.lastName} te ha enviado una oferta ${data.mainInformation.amountNumber !== 0 ? (`de $${data.mainInformation.amountString}`) : ''} a ${product.title} revisa las ofertas pendientes.`,
            color: 'yellow',
            image: user.profilePicture
        });

        await newNotification.save();

        res.send(result);
    } catch (e) { res.send({ error: true, type: e.message }) };
};

ctrl.getOffer = async (req, res) => {
    const { id_user, id_product } = req.body;
    if (id_user !== undefined && id_product !== undefined) {
        const result = await Offer.find({ user: id_user, product: id_product });
        return res.send(result.length > 0 ? result[0] : { error: true, type: 'Offer not found' });
    };

    if (id_product !== undefined) {
        const result = await Offer.find({ product: id_product, acceptOffer: false, counterOffer: false }).sort({ creationDate: 1 });
        return res.send(result.length > 0 ? result : { error: true, type: 'There are no offers' });
    };
}

ctrl.removeOffer = async (req, res) => {
    const { id_user, id_product, notification, from } = req.body;

    if (notification) {
        const offer = await Offer.findOne({ product: id_product, user: id_user });
        const user = await User.findById(from);
        const product = await Product.findById(id_product);

        const newNotification = new Notification({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            from,
            to: id_user,
            productId: id_product,
            title: 'Oferta rechazada',
            description: `Tu oferta ${offer.amountNumber === 0 ? 'GRATIS' : `de $${offer.amountString}`} ha sido rechazada en el servicio de ${product.title}, trata de hacerle una mejor oferta teniendo en cuenta el valor de referencia !animo!.`,
            color: 'yellow',
            image: user.profilePicture
        });

        await newNotification.save();
    };

    await Offer.deleteOne({ product: id_product, user: id_user });

    res.send('Offer Deleted');
};

const checkPay = async (pay,productID) => {
    if (pay) {
        if (pay.paymentType === 'CARD') await Product.findByIdAndUpdate(productID,{ advancePayment: true })
        else if (pay.paymentType === 'PSE') await Product.findByIdAndUpdate(productID,{ paymentLink: pay.URL, paymentTOKEN: pay.token })
        else if (pay.paymentType === 'cash' || pay.paymentType === 'bank') await Product.findByIdAndUpdate(productID,{ paymentLink: pay.URL });
    };
};

ctrl.makeCounteroffer = async (req, res) => {
    const { from, to, value, valueInNumber, productId, pay } = req.body;

    await checkPay(pay,productId);

    const user = await User.findById(from);
    const product = await Product.findById(productId);

    await Offer.findOneAndUpdate({ product: productId, user: to },{ counterOffer: true, amountString: value, amountNumber: valueInNumber });

    const newNotification = new Notification({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        from,
        to,
        productId,
        title: 'Contraoferta',
        description: `${user.firstName ? `${user.firstName} ${user.lastName}` : user.username} te ha enviado una contraoferta de $${value} al servicio de ${product.title}, llega a un acuerdo sobre el precio.`,
        color: 'blue',
        image: user.profilePicture
    });

    const result = await newNotification.save();
    res.send(result);
};

ctrl.acceptOffer = async (req, res) => {
    const { from, id_user, id_product, pay } = req.body;

    await checkPay(pay,id_product);

    const product = await Product.findById(id_product);
    const offer = await Offer.findOne({ product: id_product, user: id_user });
    await Offer.findByIdAndUpdate(offer._id, { acceptOffer: true, counterOffer: false/*, isThePayment: !product.advancePayment ? (product.paymentMethod && offer.amountNumber !== 0) ? false : true : false*/ });

    if (from) {
        const user = await User.findById(from);

        const newNotification = new Notification({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            from,
            to: id_user,
            productId: id_product,
            title: 'Oferta aceptada',
            description: `
                ${offer.amountNumber !== 0 ? 
                    `
                        ${!product.paymentMethod ? `
                            !Felicidades! tu oferta de $${offer.amountString} en ${product.title} fue aceptada, habla con el dueño del servicio para
                            que lleguen a un acuerdo. Esto es el inicio de algo grande.
                        ` : `!Felicidades! tu oferta de $${offer.amountString} en ${product.title} fue aceptada, puedes ir al servicio y pagar por el monto ofertado.` 
                        }
                    ` : `!Felicidades! !Has entrado gratis al servicio! en ${product.title}`
                }
            `,
            color: 'green',
            image: user.profilePicture
        });

        await newNotification.save();
    };

    const currentOffer = await Offer.findOne({ product: id_product, user: id_user });

    res.send({ offer: currentOffer, product });
};

ctrl.delete = async (req, res) => {
    const { id, notification, finished, teacher } = req.body;

    const product = await Product.findById(id);
    const user = await User.findById(!teacher ? product.owner : product.takenBy);

    if (notification) {
        const newNotification = new Notification({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            from: 'Admin',
            to: user._id,
            title: 'Producto no aceptado',
            description: `
                No hemos aceptado el servicio ${product.title} porque no cumple las politicas del buen uso y servicio de nuestra plataforma, 
                recuerde colocar una buena informacion coherente a lo que necesita o enseñe como profesor, disculpe las molestias, para mas 
                informacion entre al servicio de ayuda, recuerde que cualquier contenido pornografico, o alguna informacion no debida podria 
                llevar al bloqueo permanente de su cuenta o entrar en un estado de suspencion.`,
            color: 'orange',
            image: 'admin'
        });

        newNotification.save();
    };

    if (finished) {
        const teacher = await User.findById(product.takenBy);
        const student = await User.findById(product.owner);
        await User.findByIdAndUpdate(product.takenBy, { completedWorks: teacher.completedWorks + 1 });
        await User.findByIdAndUpdate(product.owner, { completedWorks: student.completedWorks + 1 });
    };

    if (product.takenBy !== null && !finished) {
        const newNotification = new Notification({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            from: 'Admin',
            to: product.takenBy,
            title: 'Producto eliminado',
            description: `El producto al que has tomado (${product.title}) ha sido eliminado, si sufriste de estafa por favor reporte al usuario.`,
            color: 'orange',
            image: 'admin'
        });

        newNotification.save();
    } else if (teacher) {
        const newNotification = new Notification({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            from: product.takenBy,
            to: product.owner,
            title: 'Producto finalizado',
            description: `El producto (${product.title}) ha sido finalizado correctamente por el profesor.`,
            color: 'green',
            image: user.profilePicture
        });

        newNotification.save();
    };

    await Product.findByIdAndRemove(id);
    await Offer.deleteMany({ product: id });
    await Notification.deleteMany({ productId: id });
    const remainingProducts = await Product.find({ stateActivated: false });
    res.send(remainingProducts);
};

ctrl.accept = async (req, res) => {
    const { id } = req.body;
    await Product.findByIdAndUpdate(id, { stateActivated: true });

    const product = await Product.findById(id);
    const user = await User.findById(product.owner);

    const newNotification = new Notification({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        from: 'Admin',
        to: user._id,
        productId: product._id,
        title: 'Producto aceptado',
        description: `Hemos aceptado el servicio ${product.title} porque cumple las politicas del buen uso y servicio de nuestra plataforma, !que lo disfrutes!.`,
        color: 'green',
        image: 'admin'
    });

    newNotification.save();

    const remainingProducts = await Product.find({ stateActivated: false });
    res.send(remainingProducts);
};

ctrl.increaseView = async (req, res) => {
    const { id } = req.body;

    const product = await Product.findById(id);
    await Product.findByIdAndUpdate(id, { views: product.views + 1 });

    res.send('Increased View');
}

ctrl.sendQuote = async (req, res) => {
        const { from, productId, files } = req.body;

        let product;
        try { product = await Product.findById(productId); } catch(e) { return res.send({ error: true, type: 'the product not exists' }); };

        if (product === null) return res.send({ error: true, type: 'the product not exists' });

        const user = await User.findById(from);

        const resultBlock = await Block.find({
            $or: [
                { from, to: product.owner },
                { to: from, from: product.owner }
            ]
        });

        if (resultBlock.length > 0) return res.send({ error: true, type: 'you cannot send a activity to a blocked user', data: resultBlock })
        else if (from === product.owner) return res.send({ error: true, type: 'you cannot send a activity to yourself' })
        else if (from !== product.takenBy) return res.send({ error: true, type: 'you cannot send a activity that does not belong to you' })
        else {
            files.forEach(async file => {
                file.url = `${process.env.API_PENSSUM}/quotes/${file.fileName}`;
                await fs.rename(`src/public/temporal/${file.fileName}`, `src/public/quotes/${file.fileName}`);
            });

            const newNotification = new Notification({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                from,
                to: product.owner,
                title: 'Actividad',
                description: `El profesor ${user.firstName} ${user.lastName} te ha enviado la actividad a una publicacion de tu pertenencia (${product.title})`,
                color: 'blue',
                image: user.profilePicture,
                files,
                productId
            });
            const result = await newNotification.save();

            res.send(result);
        };
};

ctrl.filter = async (req, res) => {
    const { idUser, category, subCategory, customSearch } = req.body;

    if (customSearch) {
        const products = await Product.find({
            owner: idUser,
            stateActivated: true,
            $or: [
                { category: { $regex: '.*' + customSearch + '.*', $options: 'i' } },
                { subCategory: { $regex: '.*' + customSearch + '.*', $options: 'i' } },
                { customCategory: { $regex: '.*' + customSearch + '.*', $options: 'i' } },
                { title: { $regex: '.*' + customSearch + '.*', $options: 'i' } },
                { description: { $regex: '.*' + customSearch + '.*', $options: 'i' } }
            ]
        });

        res.send(products);
    } else {
        let products;

        if (category === 'category' && subCategory === 'subcategory') products = await Product.find({ owner: idUser, stateActivated: true }).sort({ creationDate: -1 })
        else {
            if (category === 'category') products = await Product.find({ owner: idUser, stateActivated: true, subCategory }).sort({ creationDate: -1 })
            else if (subCategory === 'subcategory') products = await Product.find({ owner: idUser, stateActivated: true, category }).sort({ creationDate: -1 })
            else products = await Product.find({ owner: idUser, stateActivated: true, category, subCategory }).sort({ creationDate: -1 });
        };

        res.send(products);
    };
};

ctrl.changeVideoCallURL = (req,res) => {
    const { post_id, url, remove } = req.body;

    const createURL = async () => {
        const newURL = randomName(15);


        const exist = await Product.findOne({ videoCall: url ? url : newURL });

        if (exist) createURL()
        else if (remove) await Product.findByIdAndUpdate(post_id, { videoCall: null })
        else await Product.findByIdAndUpdate(post_id, { videoCall: url ? url : newURL });

        const productUpdated = await Product.findById(post_id);
        res.send(productUpdated);
    };

    createURL();
};

ctrl.payProduct = async (req,res) => {
    const data = req.body;

    const time = Date.now();
    const encrypt = md5(`${process.env.API_KEY}~${process.env.PAYU_MERCHANTID}~${data.name}_${data.identificationNumber}-${time}~${data.amount}~COP`);

    //const TOKEN = randomName(150);

    try {
        const payu = await axios({
            method: 'POST',
            url: process.env.URL_PAYU,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
               "test": process.env.TEST_PAYU,
               "language": "en",
               "command": "PING",
               "merchant": {
                  "apiLogin": process.env.API_LOGIN,
                  "apiKey": process.env.API_KEY
               }
            }
        });

        console.log(payu.data);
    } catch (e) {
        return res.send({ transactionResponse: {
            state: 'DECLINED',
            responseCode: 'ERROR_CONECTION',
            paymentNetworkResponseErrorMessage: 'Error de conexion.'
        }});
    };

    if (data.paymentType === 'card') {
        const result = await axios({
            method: 'POST',
            url: process.env.URL_PAYU,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            data: {
               "language": "es",
               "command": "SUBMIT_TRANSACTION",
               "merchant": {
                  "apiKey": process.env.API_KEY,
                  "apiLogin": process.env.API_LOGIN
               },
               "transaction": {
                  "order": {
                     "accountId": process.env.PAYU_ACCOUNTID,
                     "referenceCode": `${data.name}_${data.identificationNumber}-${time}`,
                     "description": data.description,
                     "language": "es",
                     "signature": encrypt,
                     "buyer": {
                        "merchantBuyerId": data.userID,
                        "fullName": data.fullName,
                        "emailAddress": data.userEmail,
                        "contactPhone": data.phoneNumber,
                        "dniNumber": data.documentType,
                        "shippingAddress": {
                           "street1": "ONLINE",
                           "city": data.city,
                           "state": "ONLINE",
                           "country": "CO",
                           "postalCode": "1102",
                           "phone": data.phoneNumber
                        }
                     },
                     "notifyUrl": "http://www.payu.com/notify",
                     "additionalValues": {
                        "TX_VALUE": {
                           "value": data.amount,
                           "currency": "COP"
                     },
                        "TX_TAX": {
                           "value": 0,
                           "currency": "COP"
                     },
                        "TX_TAX_RETURN_BASE": {
                           "value": 0,
                           "currency": "COP"
                     }
                     },
                     "shippingAddress": {
                        "street1": "ONLINE",
                        "city": data.city,
                        "state": "ONLINE",
                        "country": "CO",
                        "postalCode": "1102",
                        "phone": data.phoneNumber
                     }
                  },
                  "payer": {
                     "merchantPayerId": data.userID,
                     "fullName": data.fullName,
                     "emailAddress": data.userEmail,
                     "contactPhone": data.phoneNumber,
                     "dniNumber": data.documentType,
                     "billingAddress": {
                        "street1": data.city,
                        "city": data.city,
                        "state": "ONLINE.",
                        "country": "CO",
                        "postalCode": "1102",
                        "phone": data.phoneNumber
                     }
                  },
                  "type": "AUTHORIZATION_AND_CAPTURE",
                  "paymentMethod": data.cardType,
                  "paymentCountry": "CO",
                  "deviceSessionId": md5(`${data.userID}${time}`),
                  "ipAddress": "127.0.0.1",
                  "cookie": `${time}_${data.userID}`,
                  "userAgent": data.userAgent,
                  "creditCard": {
                     "number": data.cardNumber,
                     "securityCode": data.securityCode,
                     "expirationDate": `20${data.dueDate.year}/${('0' + data.dueDate.month).slice(-2)}`,
                     "name": data.fullName
                  }
               },
               "test": process.env.TEST_PAYU
            }
        });

        const dataObtained = result.data;

        if (dataObtained.code !== 'ERROR' && dataObtained.transactionResponse.state === 'APPROVED') {
            if (data.advance) {
                const saveData = {
                    userId: data.userID,
                    advance: true,
                    method: 'Tarjeta',
                    productTitle: data.name,
                    amount: data.amount,
                    orderId: dataObtained.transactionResponse.orderId,
                    transactionId: dataObtained.transactionResponse.transactionId,
                    operationDate: dataObtained.transactionResponse.operationDate,
                    paymentType: dataObtained.transactionResponse.additionalInfo.cardType,
                    paymentNetwork: dataObtained.transactionResponse.additionalInfo.paymentNetwork
                };

                const newTransaction = new Transaction(saveData);
                await newTransaction.save();
            } else {
                const user = await User.findById(data.userID);
                const offer = await Offer.findOne({ product: data.productID, user: data.userID });

                if (offer) await Offer.findByIdAndUpdate(offer._id,{ isThePayment: true, isBought: true })
                else {
                    const newOffer = new Offer({
                        product: data.productID,
                        user: data.userID,
                        amount: data.amount,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        acceptOffer: true,
                        isThePayment: true,
                        isBought: true,
                    });

                    newOffer.save();
                };


                const saveData = {
                    userId: data.userID,
                    ownerId: data.ownerId, 
                    productId: data.productID,
                    amount: data.amount,
                    orderId: dataObtained.transactionResponse.orderId,
                    transactionId: dataObtained.transactionResponse.transactionId,
                    operationDate: dataObtained.transactionResponse.operationDate,
                    paymentType: dataObtained.transactionResponse.additionalInfo.cardType,
                    paymentNetwork: dataObtained.transactionResponse.additionalInfo.paymentNetwork
                };

                const newTransaction = new Transaction(saveData);
                await newTransaction.save();
            };
        };

        res.send(dataObtained);
    };

    if (data.paymentType === 'PSE') {
        const result = await axios({
            method: 'POST',
            url: process.env.URL_PAYU,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            data: {
               "language": "es",
               "command": "SUBMIT_TRANSACTION",
               "merchant": {
                  "apiKey": process.env.API_KEY,
                  "apiLogin": process.env.API_LOGIN
               },
               "transaction": {
                  "order": {
                     "accountId": process.env.PAYU_ACCOUNTID,
                     "referenceCode": `${data.name}_${data.identificationNumber}-${time}`,
                     "description": data.description,
                     "language": "es",
                     "signature": encrypt,
                     "notifyUrl": "http://www.payu.com/notify",
                     "additionalValues": {
                        "TX_VALUE": {
                           "value": data.amount,
                           "currency": "COP"
                     },
                        "TX_TAX": {
                           "value": 0,
                           "currency": "COP"
                     },
                        "TX_TAX_RETURN_BASE": {
                           "value": 0,
                           "currency": "COP"
                     }
                     },
                     "buyer": {
                        "merchantBuyerId": data.userID,
                        "fullName": data.fullName,
                        "emailAddress": data.userEmail,
                        "contactPhone": data.phoneNumber,
                        "dniNumber": data.documentType,
                        "shippingAddress": {
                           "street1": "ONLINE",
                           "city": data.city,
                           "state": "ONLINE",
                           "country": "CO",
                           "postalCode": "1102",
                           "phone": data.phoneNumber
                        }
                     },
                     "shippingAddress": {
                        "street1": "ONLINE",
                        "city": data.city,
                        "state": "ONLINE",
                        "country": "CO",
                        "postalCode": "1102",
                        "phone": data.phoneNumber
                     }
                  },
                  "payer": {
                     "merchantPayerId": data.userID,
                     "fullName": data.fullName,
                     "emailAddress": data.userEmail,
                     "contactPhone": data.phoneNumber,
                     "dniNumber": data.documentType,
                     "billingAddress": {
                        "street1": data.city,
                        "city": data.city,
                        "state": "ONLINE.",
                        "country": "CO",
                        "postalCode": "1102",
                        "phone": data.phoneNumber
                     }
                  },
                  "extraParameters": {
                     "RESPONSE_URL": `${process.env.FRONTEND_PENSSUM}${data.RESPONSE_URL}`,
                     "PSE_REFERENCE1": "127.0.0.1",
                     "FINANCIAL_INSTITUTION_CODE": /*"1022"*/data.bank,
                     "USER_TYPE": data.personType,
                     "PSE_REFERENCE2": data.documentType,
                     "PSE_REFERENCE3": data.identificationNumber
                  },
                  "type": "AUTHORIZATION_AND_CAPTURE",
                  "paymentMethod": "PSE",
                  "paymentCountry": "CO",
                  "deviceSessionId": md5(`${data.userID}${time}`),
                  "ipAddress": "127.0.0.1",
                  "cookie": `${time}_${data.userID}`,
                  "userAgent": data.userAgent
               },
               "test": process.env.TEST_PAYU
            }
        });

        res.send(result.data);
    };

    if (data.paymentType === 'cash' || data.paymentType === 'bank') {
        const date = new Date();
        const THREEDAYSLATER = date.setDate(date.getDate() + 3);

        const result = await axios({
            method: 'POST',
            url: process.env.URL_PAYU,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            data: {
               "language": "es",
               "command": "SUBMIT_TRANSACTION",
               "merchant": {
                  "apiKey": process.env.API_KEY,
                  "apiLogin": process.env.API_LOGIN
               },
               "transaction": {
                  "order": {
                     "accountId": process.env.PAYU_ACCOUNTID,
                     "referenceCode": `${data.name}_${data.identificationNumber}-${time}`,
                     "description": data.description,
                     "language": "es",
                     "signature": encrypt,
                     "notifyUrl": "http://www.payu.com/notify",
                     "additionalValues": {
                        "TX_VALUE": {
                           "value": data.amount,
                           "currency": "COP"
                     },
                        "TX_TAX": {
                           "value": 0,
                           "currency": "COP"
                     },
                        "TX_TAX_RETURN_BASE": {
                           "value": 0,
                           "currency": "COP"
                     }
                     },
                     "buyer": {
                        "merchantBuyerId": data.userID,
                        "fullName": data.fullName,
                        "emailAddress": data.userEmail,
                        "contactPhone": data.phoneNumber,
                        "dniNumber": 'CC',
                        "shippingAddress": {
                           "street1": "ONLINE",
                           "city": data.city,
                           "state": "ONLINE",
                           "country": "CO",
                           "postalCode": "1102",
                           "phone": data.phoneNumber
                        }
                     },
                     "shippingAddress": {
                        "street1": "ONLINE",
                        "city": data.city,
                        "state": "ONLINE",
                        "country": "CO",
                        "postalCode": "1102",
                        "phone": data.phoneNumber
                     }
                  },
                  "payer": {
                     "merchantPayerId": data.userID,
                     "fullName": data.fullName,
                     "emailAddress": data.userEmail,
                     "contactPhone": data.phoneNumber,
                     "dniNumber": data.documentType,
                     "billingAddress": {
                        "street1": data.city,
                        "city": data.city,
                        "state": "ONLINE.",
                        "country": "CO",
                        "postalCode": "1102",
                        "phone": data.phoneNumber
                     }
                  },
                  "type": "AUTHORIZATION_AND_CAPTURE",
                  "paymentMethod": data.paymentType === 'cash' ? "EFECTY" : "BANK_REFERENCED",
                  "expirationDate": THREEDAYSLATER,
                  "paymentCountry": "CO",
                  "ipAddress": "127.0.0.1"
               },
               "test": process.env.TEST_PAYU
            }
        });

        res.send(result.data)
    };
};

ctrl.banksAvailable = async (req,res) => {
    try {
        const payu = await axios({
            method: 'POST',
            url: process.env.URL_PAYU,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
               "test": process.env.TEST_PAYU,
               "language": "en",
               "command": "PING",
               "merchant": {
                  "apiLogin": process.env.API_LOGIN,
                  "apiKey": process.env.API_KEY
               }
            }
        });

        console.log(payu.data);
    } catch (e) { 
        return res.send({ transactionResponse: {
            state: 'ERROR',
            responseCode: 'ERROR_CONECTION',
            paymentNetworkResponseErrorMessage: 'Error de conexion.'
        }});
    };

    const result = await axios({
        method: 'POST',
        url: process.env.URL_PAYU,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
           "language": "es",
           "command": "GET_BANKS_LIST",
           "merchant": {
              "apiLogin": process.env.API_LOGIN,
              "apiKey": process.env.API_KEY
           },
           "test": false,
           "bankListInformation": {
              "paymentMethod": "PSE",
              "paymentCountry": "CO"
           }
        }
    });
    
    res.send(result.data);
};

ctrl.saveTransaction = async (req,res) => {
    const data = req.body;

    const transaction = await Transaction.find({ transactionId: data.transactionId });


    if (transaction.length === 0) {
        if (data.productId.length > 80 && data.productId.length < 120) {
            const productByToken = await Product.findOne({ paymentTOKEN: data.productId });

            if (productByToken) {
                if (productByToken.valueNumber > data.amount - 1000) {
                    await Product.findByIdAndUpdate(productByToken._id,{ paymentLink: null, advancePayment: true, paymentTOKEN: null });


                    const saveData = {
                        userId: data.userId,
                        advance: true,
                        method: 'PSE',
                        productTitle: productByToken.title,
                        amount: data.amount,
                        transactionId: data.transactionId,
                        operationDate: Date.now(),
                        paymentType: data.paymentType,
                        paymentNetwork: data.paymentNetwork,
                        productId: productByToken._id
                    };

                    const newTransaction = new Transaction(saveData);
                    const result = await newTransaction.save();

                    const newNotification = new Notification({
                        username: 'Admin',
                        from: 'Admin',
                        to: productByToken.owner,
                        title: `Pago verificado correctamente`,
                        description: `Felicidades tu pago fue hecho con exito a la publicacion (${productByToken.title}), el dinero total pagado es de: $${productByToken.valueString} !MUCHO EXITO!.`,
                        color: 'green',
                        image: 'admin',
                        productId: productByToken._id
                    });
                    await newNotification.save();

                    res.send(result);
                } else res.send({ error: true, type: 'Invalid amount' });
            } else res.send({ error: true, type: 'Product not exists' });
        } else {
            let offer, product, user;

            try { offer = await Offer.findOne({ product: data.productId, user: data.userId }) } catch (e) { res.send(e.message) };
            try { product = await Product.findById(data.productId) } catch (e) { res.send(e.message) };
            try { user = await User.findById(data.userId) } catch (e) { res.send(e.message) };

            try {
                if (offer) await Offer.findByIdAndUpdate(offer._id,{ isThePayment: true, isBought: true })
                else {
                    const newOffer = new Offer({
                        product: data.productId,
                        user: data.userId,
                        amount: data.amount,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        acceptOffer: true,
                        isThePayment: true,
                        isBought: true,
                    });

                    newOffer.save();
                };

                const saveData = {
                    userId: data.userId,
                    ownerId: product.owner, 
                    productId: data.productId,
                    amount: data.amount,
                    transactionId: data.transactionId,
                    operationDate: Date.now(),
                    paymentType: data.paymentType,
                    paymentNetwork: data.paymentNetwork
                };

                const newTransaction = new Transaction(saveData);
                const result = await newTransaction.save();

                res.send(result);
            } catch(e) { res.send(e.message) }
        };
    } else res.send({ error: true, type: 'Already exists' });
};

ctrl.search = async (req,res) => {
    let { search, filterNav } = req.body;
    search = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const dataToSearch = {
        stateActivated: true,
        $or: [
            { category: { $regex: '.*' + search + '.*', $options: 'im' } },
            { creatorUsername: { $regex: '.*' + search + '.*', $options: 'im' } },
            { subCategory: { $regex: '.*' + search + '.*', $options: 'im' } },
            { customCategory: { $regex: '.*' + search + '.*', $options: 'im' } },
            { title: { $regex: '.*' + search + '.*', $options: 'im' } },
            { modifiedDescription: { $regex: '.*' + search + '.*', $options: 'im' } }
        ]
    };

    if (filterNav.category !== 'categoria') dataToSearch.category = filterNav.category;
    if (filterNav.city !== 'ciudad') dataToSearch.city = filterNav.city;

    const products = await Product.find(dataToSearch);

    (products.length > 0)
        ? res.send(products)
        : res.send({ error: true, type: 'users not found' });
};

ctrl.take = async (req,res) => {
    const { post_id, teacher_id } = req.body;

    const product = await Product.findById(post_id);

    if (product.takenBy === null) {
        const productsTaken = await Product.find({ takenBy: teacher_id });

        if (productsTaken.length >= 6) {
            res.send({ error: true, type: 'maximum products taken' });
        };

        await Product.findByIdAndUpdate(post_id,{ takenBy: teacher_id });
        const productUpdated = await Product.findById(post_id);

        const teacher = await User.findById(teacher_id);

        const newNotification = new Notification({
            username: teacher.username,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            from: teacher._id,
            to: product.owner,
            title: `Publicacion tomada`,
            description: `Tu publicacion ${product.title} ha sido tomado por un profesor, !FELICIDADES!`,
            productId: post_id,
            color: 'green',
            image: teacher.profilePicture
        });

        await newNotification.save();

        res.send(productUpdated);
    } else res.send({ error: true, type: 'this post has been taken', product });
};

ctrl.removeTake = async (req,res) => {
    const { post_id, typeOfUser, user_id } = req.body;

    const currentProduct = await Product.findById(post_id);

    if (currentProduct.takenBy !== null) {
        const product = await Product.findByIdAndUpdate(post_id,{ takenBy: null });
        const productUpdated = await Product.findById(post_id);

        const user = await User.findById(user_id);

        const newNotification = new Notification({
            username: 'Admin',
            from: typeOfUser === 'teacher' ? currentProduct.takenBy : currentProduct.owner,
            to: typeOfUser === 'teacher' ? currentProduct.owner : currentProduct.takenBy,
            title: typeOfUser === 'teacher' ? `Renuncio de actividad` : `Te expulsaron`,
            description: typeOfUser === 'teacher' ? `
                El profesor ${user.firstName ? `${user.firstName} ${user.lastName}` : user.username} ha renunciado a la publicacion de ${product.title}. Tu publicacion se 
                ha vuelto a postular, si crees que el profesor hizo mal, por favor reportelo.
            ` : `
                El dueño de la publicacion te ha expulsado de ${product.title}, lo sentimos mucho, recuerda ser responsable,
                y reportarte lo antes posible para evitar estas situaciones, si crees que el estudiante hizo mal, por favor reportelo.
            `,
            productId: post_id,
            color: 'orange',
            image: user.profilePicture
        });

        await newNotification.save();
        res.send(productUpdated);
    } else res.send({ error: true, type: 'lonely publish', product: currentProduct });
};

ctrl.getTask = async (req,res) => {
    const { from, to, productId } = req.body;

    const activity = await Notification.findOne({ title: 'Actividad', from, to, productId, files: { $ne: [] } }).sort({ creationDate: -1 });

    res.send(activity);
};

ctrl.requestPayment = async (req,res) => {
    const { post_id, teacher_id } = req.body;

    const user = await User.findById(teacher_id);
    const currentProduct = await Product.findById(post_id);

    const newNotification = new Notification({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        from: user._id,
        to: user.objetive === 'Profesor' ? currentProduct.owner : currentProduct.takenBy,
        title: user.objetive === 'Profesor' ? `Solicitud de pago` : 'Solicitud de finalizacion',
        description: user.objetive === 'Profesor' ? `El profesor ${user.firstName ? `${user.firstName} ${user.lastName}` : user.username} te ha hecho una solicitud de pago en (${currentProduct.title}) por favor revise la publicacion para definir una respuesta, tiene 12 dias para contestar, de lo contrario el dinero pasara automaticamente a la cuenta del profesor y la publicacion quedara eliminada.` : `El estudiante quiere dar por finalizado la publicacion en (${currentProduct.title}) ¿quieres aceptar la finalizacion?.`,
        productId: post_id,
        color: 'yellow',
        image: user.profilePicture
    });

    await newNotification.save();

    await Product.findByIdAndUpdate(post_id,{ 'paymentRequest.active': true, 'paymentRequest.timeLimit': null });
    const productUpdated = await Product.findById(post_id);

    res.send(productUpdated);
};

ctrl.teacherPayment = async (req,res) => {
    const { typeData, post_id, user_id, why } = req.body;

    const user = await User.findById(user_id);
    const currentProduct = await Product.findById(post_id);

    if (typeData === 'accept') {
        const newTransaction = new Transaction({
            userId: currentProduct.owner,
            ownerId: currentProduct.takenBy,
            productTitle: currentProduct.title,
            amount: currentProduct.valueNumber
        });
        
        const transaction = await newTransaction.save();

        const newNotification = new Notification({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            from: user._id,
            to: currentProduct.takenBy,
            title: `Solicitud de pago aceptada`,
            description: `El estudiante ${user.firstName ? user.firstName : user.username} ha aceptado tu peticion de pago en (${currentProduct.title}) rellene los datos de cuenta bancaria en Preferencias > Pago > Payu  para poder retirar su dinero, el dinero que le debemos aparecera en su perfil, !FELICIDADES! si necesitas ayuda no dudes en contactarnos.`,
            color: 'green',
            image: user.profilePicture
        });

        await newNotification.save();

        res.send(transaction);
    } else {
        await Product.findByIdAndUpdate(post_id,{ 'paymentRequest.active': false, 'paymentRequest.timeLimit': null });
        const productUpdated = await Product.findById(post_id);

        const newNotification = new Notification({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            from: user._id,
            to: user.objetive === 'Alumno' ? currentProduct.takenBy : currentProduct.owner,
            title: user.objetive === 'Alumno' ? `Solicitud de pago rechazado ${why !== 'Rechazado' ? 'por falta de informacion.' : ''}` : 'Solicitud de finalizacion rechazada',
            description: user.objetive === 'Alumno' ? `El alumno ${user.firstName ? user.firstName : user.username} ha rechazado tu peticion de pago en (${currentProduct.title}) ${why === 'Rechazado' ? '' : 'por falta de informacion'} por favor contacte al dueño de la publicacion para llegar a un acuerdo, si esta sufriendo de estafa por favor reporte su caso con detalle.` : `El profesor ${user.firstName ? user.firstName : user.username} ha rechazado tu peticion de finalizacion en la publicacion (${currentProduct.title}) por favor contacte al profesor para llegar a un acuerdo, si esta sufriendo de estafa por favor reporte su caso con detalle.`,
            productId: post_id,
            color: 'orange',
            image: user.profilePicture
        });

        await newNotification.save();

        res.send(productUpdated);
    };
};

ctrl.removePayment = async (req,res) => {
    const { post_id } = req.body;
    
    await Product.findByIdAndUpdate(post_id,{ 
        advancePayment: false, 
        paymentTOKEN: null, 
        paymentLink: null, 
        paymentType: null
    });

    const productUpdated = await Product.findById(post_id);

    res.send(productUpdated);
};

module.exports = ctrl;