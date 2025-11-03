
const mongoose = require('mongoose');
const argon2 = require('argon2');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    }
);


// Mongoose pre-save hook. 
// It allows us to modify the document before saving it to DB.

userSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        try{

            // Hash the password with argon2
            this.password = await argon2.hash(this.password);

        }catch(error) {

            return next(error);
        }
    }
});


// userSchema.methods -> adds instance methods to Mongoose model.
// This means each user document has a comparePassword method.
userSchema.methods.comparePassword = async function (userpassword) {
    try{

        // Compare the user entered plain text password with the hashed password
        return await argon2.verify(this.password, userpassword);

    }catch(error) {

        throw error;      
    }

};


// Creates a text index on username field
// Allows full text search
// MongoDB allows only one text index per collection

userSchema.index({username : 'text'});



const User = mongoose.model('User', userSchema, 'Users');
module.exports = User;