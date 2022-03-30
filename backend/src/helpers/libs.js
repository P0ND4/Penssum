const helpers = {};

helpers.randomName = (repeat) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
    let stringRandom = '';
    for (let i = 0; i <= repeat; i++) {
        stringRandom += possible.charAt(Math.floor(Math.random() * possible.length));
    };
    return stringRandom;
}; 

module.exports = helpers;