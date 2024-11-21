const mongoose = require("mongoose");
const crypt = require("bcrypt")


let userSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
        required:true
    }

});

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next()
    this.password= await bcrypt.hash(this.password,10)
    next();
});


const user = mongoose.model('user',userSchema);

module.exports= user;