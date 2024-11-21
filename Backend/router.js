const mongoose= require("mongoose")
const express= require("express")
const cors = require("cors")
const port=3000
const User= require("./model")

const app = express();
app.use(cors());
app.use(express.json());




let mongoConnection= "mongodb+srv://jpperezl2003:Futbol2003@myapp.bq18m.mongodb.net/MyappDB";
let db=  mongoose.connection;


db.on('connecting',()=>{
    console.log("Conectando...");
    console.log(mongoose.connection.readyState);
});

db.on('connected',()=>{
    console.log("Conectado exitosamente");
    console.log(mongoose.connection.readyState);
});

mongoose.connect(mongoConnection);

app.post("/api/users", (req,res) => {
    console.log("Datos recibidos en req.body:", req.body);
    console.log("Datos recibidos:", req.body);
    let {Name,Email,Password} = req.body;
    
    let user= new User({Name,Email,Password});
    user.save().then((doc)=>console.log("Usuario Creado:" + doc));

});




app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});