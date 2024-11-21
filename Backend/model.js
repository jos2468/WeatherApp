const mongoose = require("mongoose");
const bcrypt = require("bcrypt")


let userSchema= new mongoose.Schema({
    Name:{
        type: String,
        required: true
    },
    Email:{
        type: String,
        required: true,
        unique:true
    },
    Password:{
        type: String,
        required:true
    }

});

userSchema.pre('save', async function (next) {
    if (!this.isModified('Password')) return next();
    
    this.Password = await bcrypt.hash(this.Password, 10);
    next();
});


const User = mongoose.model('User',userSchema);

module.exports= User;