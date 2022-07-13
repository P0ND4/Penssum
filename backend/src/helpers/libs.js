const helpers = {};



helpers.randomName = (repeat,options) => {
    const possibleGlobal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'

    if (options === undefined || Object.keys(options).length === 0) {
        let stringRandom = '';
        for (let i = 0; i < repeat; i++) {
            stringRandom += possibleGlobal.charAt(Math.floor(Math.random() * possibleGlobal.length));
        };
        return stringRandom;
    } else {
        const { Number, String, Letters, Signs } = options;

        let possible = '';

        if (Number) possible += '1234567890';
        if (String && Letters === 'both') possible += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        if (String && Letters === 'lowercase') possible += 'abcdefghijklmnopqrstuvwxyz';
        if (String && Letters === 'uppercase') possible += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (Signs) possible += '!@#$%^&*()_+=-[]{}\|/~';

        if (possible === '') possible = possibleGlobal;

        let stringRandom = '';

        for (let i = 0; i < repeat; i++) {
            stringRandom += possible.charAt(Math.floor(Math.random() * possible.length));
        };
        return stringRandom;
    }
}; 

module.exports = helpers;