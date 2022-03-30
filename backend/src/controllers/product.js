const fs = require('fs-extra');
const path = require('path');
const { randomName } = require('../helpers/libs');
const helperImg = require('../helpers/resizeImage');

const Product = require('../models/Product');
const Offer = require('../models/Offer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Block = require('../models/Block');

const ctrl = {};

ctrl.products = async (req, res) => {
    const { username, id, review, blockSearch } = req.body;

    if (review !== undefined) {
        const product = await Product.find({ stateActivated: false });
        return res.send(product);
    };

    if (id !== undefined) {
        try {
            const product = await Product.findById(id);
            return res.send(product);
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

            return res.send(products);
        } else {
            const products = await Product.find({ stateActivated: true }).sort({ creationDate: -1, views: -1 });

            return res.send(products);
        }
    };

    if (username !== undefined) {
        const products = await Product.find({ creatorUsername: username }).sort({ creationDate: -1 });
        return res.send(products);
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
                            url: `http://localhost:8080/temporal/${URLFile + extname}`
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
    try {
        if (files === undefined) {
            await fs.unlink(path.resolve(`src/public/temporal/${fileName}`));
            res.send('deleted');
        } else {
            if (files !== null) {
                files.forEach(async (file, index) => {
                    await fs.unlink(path.resolve(`src/public/${activate !== undefined && activate ? 'services' : 'temporal'}/${file.fileName}`));
                    if (index + 1 === files.length) return setTimeout(() => res.send('deleted'), 1000);
                });
            } else {
                res.status(404).send({ error: null, type: 'there are no found files to delete', files });
                console.log('There are no found files to delete');
            }
        }
    } catch (e) { console.log('File not found') };
};

ctrl.create = async (req, res) => {
    const data = req.body;

    const imagesAllowed = /jpg|png|jpeg|tiff|tif|psd|webp/;
    let url = '';
    let miniature = '';
    for (let i = 0; i < data.files.length; i++) {
        if (imagesAllowed.test(data.files[i].extname)) {
            await helperImg(path.resolve(`src/public/temporal/${data.files[i].fileName}`), data.files[i].fileName);
            url = `http://localhost:8080/optimize/resize-${data.files[i].fileName}`;
            miniature = `resize-${data.files[i].fileName}`;

            try {
                data.files.forEach(async file => {
                    file.url = `http://localhost:8080/services/${file.fileName}`;
                    await fs.rename(`src/public/temporal/${file.fileName}`, `src/public/services/${file.fileName}`);
                });
            } catch (e) { console.log(e.message) };
            break;
        } else { url = '/img/document_image.svg' };
    };

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
            description: `${user.username} te ha enviado una oferta de ${data.mainInformation.amount}$ a ${product.title} revisa las ofertas pendientes.`,
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
    }

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
            description: `Tu oferta de ${offer.amount}$ ha sido rechazada en el servicio de ${product.title}, trata de hacerle una mejor oferta teniendo en cuenta el valor de referencia !animo!.`,
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

    const offer = await Offer.findOneAndUpdate({ product: id_product, user: id_user }, { acceptOffer: true });

    const user = await User.findById(from);
    const product = await Product.findById(id_product);

    const newNotification = new Notification({
        username: user.username,
        from,
        to: id_user,
        productId: id_product,
        title: 'Oferta aceptada',
        description: `
            !Felicidades! tu oferta de ${offer.amount}$ en ${product.title} fue aceptada, habla con el dueño del servicio para
            que lleguen a un acuerdo. Este es el inicio de algo grande.
        `,
        color: 'green',
        image: user.profilePicture
    });

    await newNotification.save();

    res.send('Offer accepted');
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
        else if (from === product.owner) return res.send({ error: true, type: 'you cannot send a quote to yourself'})
        else {
            files.forEach(async file => {
                file.url = `http://localhost:8080/quotes/${file.fileName}`;
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

module.exports = ctrl;