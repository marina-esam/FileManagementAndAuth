const mongoose = require("mongoose");
var validator = require('validator');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,  /// Abdelaziz123  >> false  -- Abdelaziz >> true -- Abdelaziz Hamdy >>true
        required: true,
        minlength: 3,
        maxlength: 12,
        validate: {
            validator: function (val) {
                const locales = ["ar-AE", "en-US"]
                return locales.some((local) => validator.isAlpha(val, local, { ignoer: " " }))
            }
        }
    },
    lastName: {
        type: String,
        required: true,
        minlength: [3, "Last name must be at least 3 characters"],
        maxlength: 12,
        validate: {
            validator: function (val) {
                const locales = ["ar-AE", "en-US"]
                return locales.some((local) => validator.isAlpha(val, local, { ignoer: " " }))
            }
        }
    },
    email: {  // abdelaziz@gmail >> false -- abdelaziz.com >> false -- abdelaziz@gmail.com >> true
        type: String,
        required: true,
        unique: true,
        // validate:{
        //     validator :validator.isEmail,
        //     message: "Please enter a valid email address"
        // }
        //or
        validate: [validator.isEmail, "Please enter a valid email address"]
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) { // +20 1012345678
                return RegExp(/^01[0-2,5]{1}[0-9]{8}$/).test(value)
            }
        }
    },
    age: {
        type: Number,
        min: 18  // 15
    },
    role: {
        type: String,
        enum: ["admin", "suppler", "customer"],
        default: "customer"
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }
});


userSchema.virtual("fullNmae").get(function () {
    return `${this.firstName} ${this.lastName}`
})

const User = new mongoose.model("User", userSchema);
module.exports = User;

/**
 * 
 * validate:{
 * validator : function(val){
 * return true}
 * message: "error message"
 * }
 * 
 * 
 * const number = [1,2,3,4]
 * number.some(num => num > 3)
 * 1 > 3 
 * false
 * 2 > 3
 * false
 * 3 > 3
 * true
 * 4 > 3
 * true
 * 
 *  
 */