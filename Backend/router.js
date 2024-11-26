const mongoose= require("mongoose")
const express= require("express")
const cors = require("cors")
const port=3000
const User= require("./model")
const bcrypt = require("bcrypt")
const jwt =  require ("jsonwebtoken")
const path = require("path");
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));



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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/home.html"));
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/home.html"));
});

app.get("/FavA", authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/FavA.html"));
    
});

app.get("/aboutUs", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/aboutUs.html"));
});

app.get("/contactUs", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/contactUs.html"));
});

function authenticateToken(req, res, next) {
    let authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    
    token = token ? token.replace(/^"|"$/g, '') : null;
    console.log(token)


    if (!token) {
        console.log("no token")
        return res.status(401).json({ message: "Acceso denegado: No se proporcionó un token" });
    }


    jwt.verify(token, "clave_secreta", (err, user) => {
        if (err) {
            console.log("Entra al error que no es el token, ")
            return res.status(403).json({ message: "Acceso denegado: Token inválido" });
        }
        console.log("No paso ningun error")
        
        req.user = user;
        next();
    });
}



app.post("/api/users", (req,res) => {
    console.log("Datos recibidos en req.body:", req.body);
    console.log("Datos recibidos:", req.body);
    let {Name,Email,Password} = req.body;
    
    let user= new User({Name,Email,Password});
    user.save().then((doc)=>console.log("Usuario Creado:" + doc));

});

app.post("/api/login", async (req, res) => {
    const { Email, Password } = req.body;

    let clave="clave_secreta";
    try {
        
        const user = await User.findOne({ Email });
        if (!user) {
            return res.status(400).json({ message: "Correo incorrecto" });
        }

        // Verificar la contraseña ingresada con la almacenada
        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Crear el token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.Email },  // Payload
            clave,  // Clave secreta
            { expiresIn: "1h" }  // Expiración del token
        );
        
        console.log(clave);
        console.log(token);

        // Enviar el token al cliente
        res.json({ token });

    } catch (err) {
        res.status(500).json({ message: "Error al intentar iniciar sesión", error: err });
    }
});






app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});