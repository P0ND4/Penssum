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
            const productVotes = await Vote.find({ productId: product._id });
                
            if (productVotes.length !== 0) {
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
    const { username, id, review, videoCallURL,blockSearch } = req.body;

    if (videoCallURL !== undefined) {
        const product = await Product.findOne({ videoCall: videoCallURL });
        return res.send(product);
    };

    if (review !== undefined) {
        const product = await Product.find({ stateActivated: false });
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
                $and: productsToRemove
            }).sort({ creationDate: -1, views: -1 });

            await getTotalVotes(products,res);
        } else {
            const blockedUsers = await User.find({ 'typeOfUser.user': 'block' });
            const arraysUsers = [];
            
            if (blockedUsers.length > 0) {
                blockedUsers.forEach(user => arraysUsers.push({ owner: { $ne: user._id } }));

                const products = await Product.find({ stateActivated: true, $and: arraysUsers }).sort({ creationDate: -1, views: -1 });
                await getTotalVotes(products,res);
            } else {
                const products = await Product.find({ stateActivated: true }).sort({ creationDate: -1, views: -1 });
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
                    await fs.unlink(path.resolve(`src/public/optimize/resize-${files[i].fileName}`));
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

    const newProduct = new Product(data);
    const result = await newProduct.save();
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
            from: data.mainInformation.user,
            to: data.notification,
            productId: data.mainInformation.product,
            title: 'Tienes una oferta',
            description: `${user.username} te ha enviado una oferta ${data.mainInformation.amount !== 0 ? (`de ${data.mainInformation.amount}$`) : ''} a ${product.title} revisa las ofertas pendientes.`,
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
        const result = await Offer.find({ product: id_product, acceptOffer: false }).sort({ creationDate: 1 });
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
            from,
            to: id_user,
            productId: id_product,
            title: 'Oferta rechazada',
            description: `Tu oferta ${offer.amount === 0 ? 'GRATIS' : `de ${offer.amount}$`} ha sido rechazada en el servicio de ${product.title}, trata de hacerle una mejor oferta teniendo en cuenta el valor de referencia !animo!.`,
            color: 'yellow',
            image: user.profilePicture
        });

        await newNotification.save();
    };

    await Offer.deleteOne({ product: id_product, user: id_user });

    res.send('Offer Deleted');
};

ctrl.makeCounteroffer = async (req, res) => {
    const { from, to, value, productId } = req.body;

    const user = await User.findById(from);
    const product = await Product.findById(productId);

    const newNotification = new Notification({
        username: user.username,
        from,
        to,
        productId,
        title: 'Contraoferta',
        description: `${user.username} te ha enviado una contraoferta de ${value}$ al servicio de ${product.title}, llega a un acuerdo sobre el precio.`,
        color: 'blue',
        image: user.profilePicture
    });

    const result = await newNotification.save();
    res.send(result);
};

ctrl.acceptOffer = async (req, res) => {
    const { from, id_user, id_product } = req.body;

    const product = await Product.findById(id_product);
    const offer = await Offer.findOne({ product: id_product, user: id_user });
    await Offer.findByIdAndUpdate(offer._id, { acceptOffer: true, isThePayment: (product.paymentMethod && offer.amount !== 0) ? false : true });

    const user = await User.findById(from);

    const newNotification = new Notification({
        username: user.username,
        from,
        to: id_user,
        productId: id_product,
        title: 'Oferta aceptada',
        description: `
            ${offer.amount !== 0 ? 
                `
                    ${!product.paymentMethod ? `
                        !Felicidades! tu oferta de ${offer.amount}$ en ${product.title} fue aceptada, habla con el dueño del servicio para
                        que lleguen a un acuerdo. Este es el inicio de algo grande.
                    ` : `!Felicidades! tu oferta de ${offer.amount}$ en ${product.title} fue aceptada, puedes ir al servicio y pagar por el monto ofertado.` 
                    }
                ` : `!Felicidades! !Has entrado gratis al servicio! en ${product.title}`
            }
        `,
        color: 'green',
        image: user.profilePicture
    });

    await newNotification.save();

    const currentOffer = await Offer.findOne({ product: id_product, user: id_user });

    res.send(currentOffer);
};

ctrl.delete = async (req, res) => {
    const { id, notification } = req.body;

    const product = await Product.findById(id);
    const user = await User.findById(product.owner);

    if (notification) {
        const newNotification = new Notification({
            username: user.username,
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
    try {
        const { from, productId, files } = req.body;

        const product = await Product.findById(productId);
        const user = await User.findById(from);

        const resultBlock = await Block.find({
            $or: [
                { from, to: product.owner },
                { to: from, from: product.owner }
            ]
        });

        if (resultBlock.length > 0) return res.send({ error: true, type: 'you cannot send a quote to a blocked user', data: resultBlock })
        else if (from === product.owner) return res.send({ error: true, type: 'you cannot send a quote to yourself' })
        else {
            files.forEach(async file => {
                file.url = `${process.env.API_PENSSUM}/quotes/${file.fileName}`;
                await fs.rename(`src/public/temporal/${file.fileName}`, `src/public/quotes/${file.fileName}`);
            });

            const newNotification = new Notification({
                username: user.username,
                from,
                to: product.owner,
                title: 'Cotizacion',
                description: `${user.username} te ha enviado una cotizacion a un servicio de tu pertenencia (${product.title})`,
                color: 'blue',
                image: user.profilePicture,
                files
            });
            const result = await newNotification.save();

            res.send(result);
        };
    } catch (e) { res.send(console.log(e)) }
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
    const { post_id } = req.body;

    const createURL = async () => {
        const newURL = randomName(15);

        const exist = await Product.findOne({ videoCall: newURL });

        if (exist) createURL()
        else {
            await Product.findByIdAndUpdate(post_id, { videoCall: newURL });

            const productUpdated = await Product.findById(post_id);

            res.send(productUpdated);
        };
    };

    createURL();
};

ctrl.payProduct = async (req,res) => {
    const data = req.body;

    const time = Date.now();
    const encrypt = md5(`4Vj8eK4rloUd272L48hsrarnUA~508029~${data.productName}_${data.category}_${data.customCategory}_${data.identificationNumber}-${time}~${data.amount}~COP`);

    try {
        const payu = await axios({
            method: 'POST',
            url: 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
               "test": false,
               "language": "en",
               "command": "PING",
               "merchant": {
                  "apiLogin": "pRRXKOl8ikMmt9u",
                  "apiKey": "4Vj8eK4rloUd272L48hsrarnUA"
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
            url: 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            data: {
               "language": "es",
               "command": "SUBMIT_TRANSACTION",
               "merchant": {
                  "apiKey": "4Vj8eK4rloUd272L48hsrarnUA",
                  "apiLogin": "pRRXKOl8ikMmt9u"
               },
               "transaction": {
                  "order": {
                     "accountId": "512321",
                     "referenceCode": `${data.productName}_${data.category}_${data.customCategory}_${data.identificationNumber}-${time}`,
                     "description": data.productDescription,
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
                           "value": Math.round(data.amount * 0.19),
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
                  "cookie": `${data.productID}_${data.userID}`,
                  "userAgent": data.userAgent,
                  "creditCard": {
                     "number": data.cardNumber,
                     "securityCode": data.securityCode,
                     "expirationDate": `20${data.dueDate.year}/${('0' + data.dueDate.month).slice(-2)}`,
                     "name": data.fullName
                  }
               },
               "test": true
            }
        });

        const dataObtained = result.data;

        if (dataObtained.transactionResponse.state === 'APPROVED') {
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

        res.send(dataObtained);
    };

    if (data.paymentType === 'PSE') {
        const result = await axios({
            method: 'POST',
            url: 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            data: {
               "language": "es",
               "command": "SUBMIT_TRANSACTION",
               "merchant": {
                  "apiKey": "4Vj8eK4rloUd272L48hsrarnUA",
                  "apiLogin": "pRRXKOl8ikMmt9u"
               },
               "transaction": {
                  "order": {
                     "accountId": "512321",
                     "referenceCode": `${data.productName}_${data.category}_${data.customCategory}_${data.identificationNumber}-${time}`,
                     "description": data.productDescription,
                     "language": "es",
                     "signature": encrypt,
                     "notifyUrl": "http://www.payu.com/notify",
                     "additionalValues": {
                        "TX_VALUE": {
                           "value": data.amount,
                           "currency": "COP"
                     },
                        "TX_TAX": {
                           "value": Math.round(data.amount * 0.19),
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
                     "RESPONSE_URL": `${process.env.FRONTEND_PENSSUM}/post/information/${data.productID}/transaction/receipt`,
                     "PSE_REFERENCE1": "127.0.0.1",
                     "FINANCIAL_INSTITUTION_CODE": "1022"/*data.bank*/,
                     "USER_TYPE": data.personType,
                     "PSE_REFERENCE2": data.documentType,
                     "PSE_REFERENCE3": data.identificationNumber
                  },
                  "type": "AUTHORIZATION_AND_CAPTURE",
                  "paymentMethod": "PSE",
                  "paymentCountry": "CO",
                  "deviceSessionId": md5(`${data.userID}${time}`),
                  "ipAddress": "127.0.0.1",
                  "cookie": `${data.productID}_${data.userID}`,
                  "userAgent": data.userAgent
               },
               "test": false
            }
        });

        res.send(result.data);
    };

    if (data.paymentType === 'cash' || data.paymentType === 'bank') {
        const date = new Date();
        const THREEDAYSLATER = date.setDate(date.getDate() + 3);

        const result = await axios({
            method: 'POST',
            url: 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            data: {
               "language": "es",
               "command": "SUBMIT_TRANSACTION",
               "merchant": {
                  "apiKey": "4Vj8eK4rloUd272L48hsrarnUA",
                  "apiLogin": "pRRXKOl8ikMmt9u"
               },
               "transaction": {
                  "order": {
                     "accountId": "512321",
                     "referenceCode": `${data.productName}_${data.category}_${data.customCategory}_${data.identificationNumber}-${time}`,
                     "description": data.productDescription,
                     "language": "es",
                     "signature": encrypt,
                     "notifyUrl": "http://www.payu.com/notify",
                     "additionalValues": {
                        "TX_VALUE": {
                           "value": data.amount,
                           "currency": "COP"
                     },
                        "TX_TAX": {
                           "value": Math.round(data.amount * 0.19),
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
                  "paymentMethod": data.paymentType === 'cash' ? "EFECTY" : "BALOTO",
                  "expirationDate": THREEDAYSLATER,
                  "paymentCountry": "CO",
                  "ipAddress": "127.0.0.1"
               },
               "test": true
            }
        });

        console.log(result.data);

        res.send(result.data)
    };
};

ctrl.banksAvailable = async (req,res) => {
    try {
        const payu = await axios({
            method: 'POST',
            url: 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
               "test": false,
               "language": "en",
               "command": "PING",
               "merchant": {
                  "apiLogin": "pRRXKOl8ikMmt9u",
                  "apiKey": "4Vj8eK4rloUd272L48hsrarnUA"
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
        url: 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
           "language": "es",
           "command": "GET_BANKS_LIST",
           "merchant": {
              "apiLogin": "pRRXKOl8ikMmt9u",
              "apiKey": "4Vj8eK4rloUd272L48hsrarnUA"
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
        const offer = await Offer.findOne({ product: data.productId, user: data.userId });
        const product = await Product.findById(data.productId);
        const user = await User.findById(data.userId);

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
    } else res.send('Already exists');
};

module.exports = ctrl;