const { Schema, model }  = require('mongoose');

const UserSchema = new Schema ({
    registered: { type: String, default: 'local' },
    objetive: { type: String, default: '' },
    email: { type: String, require: true },
    password: { type: String, required: true },
    firstName: { type: String, default: '' },
    secondName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    secondSurname: { type: String, default: '' },
    originalDescription: { type: String, default: '' },
    modifiedDescription: { type: String, default: '' },
    username: { type: String, required: true },
    stringToCompare: { type: String, required: true },
    userImageFileName: { type: Object, default: { profilePicture: '', coverPhoto: '' }},
    profilePicture: { type: String, default: null },
    coverPhoto: { type: String, default: null },
    identification: { type: Number, default: null },
    yearsOfExperience: { type: Number, default: null },
    phoneNumber: { type: Number, default: null },
    valuePerHour: { type: Number, default: null },
    availability: { type: Object, 
        default: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
        }
    },
    virtualClasses: { type: Boolean, default: false },
    faceToFaceClasses: { type: Boolean, default: false },
    showMyNumber: { type: Boolean, default: false },
    typeOfUser: { type: Object, 
        default: {
            user: 'free',
            suspension: null
        } 
    },
    completedWorks: { type: Number, default: 0 },
    breaches: { type: Number, default: 0 },
    faculties: { type: Array, default: [] },
    subjects: { type: Array, default: [] },
    bankData: { type: Object, default: {
        bank: '',
        accountNumber: '',
        accountType: ''
    }},
    city: { type: String, default: null },
    validated: { type: Boolean, default: false },
    token: { type: String, default: null },
    creationDate: { type: Date, default: Date.now }
});

module.exports = model('user', UserSchema);