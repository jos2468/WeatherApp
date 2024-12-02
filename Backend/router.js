const mongoose= require("mongoose")
const express= require("express")
const cors = require("cors")
const port=3000
const User= require("./model")
const bcrypt = require("bcrypt")
const jwt =  require ("jsonwebtoken")
const path = require("path");
const axios = require('axios');
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

const weatherCache = new Map(); // Estructura en memoria para el caché
const WEATHER_API_KEY = "539c86bb88c44da68c1230220242111";

// Función para obtener datos del clima desde la API
async function fetchWeatherFromAPI(city, date) {
    const url = date 
        ? `http://api.weatherapi.com/v1/history.json?key=${WEATHER_API_KEY}&q=${city}&dt=${date}`
        : `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`;
    
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error consultando WeatherAPI para ${city} en ${date || 'actual'}: ${error.message}`);
        throw error;
    }
}

// Endpoint para obtener datos del clima y gestionarlo en el caché
app.get("/api/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) {
        console.warn("[/api/weather] Solicitud sin parámetro de ciudad.");
        return res.status(400).json({ message: "Se requiere la ciudad" });
    }

    const cacheKey = city.toLowerCase();
    const currentTime = Date.now();

    console.log(`[/api/weather] Iniciando consulta para: ${city}`);
    console.log(`[/api/weather] Clave de caché: ${cacheKey}`);

    // Verificar si la ciudad ya está en caché
    if (weatherCache.has(cacheKey)) {
        const { data, timestamp } = weatherCache.get(cacheKey);
        const timeSinceCache = (currentTime - timestamp) / 1000 / 60; // Minutos desde que se guardó en el caché

        console.log(`[/api/weather] Datos en caché encontrados para ${city}. Tiempo en caché: ${timeSinceCache.toFixed(2)} minutos.`);

        // Si el dato es reciente (menos de 1 hora), devolverlo
        if (currentTime - timestamp < 3600000) {
            console.log(`[/api/weather] Usando datos del caché para: ${city}`);
            return res.json(data);
        } else {
            console.log(`[/api/weather] Datos del caché expiraron para: ${city}. Consultando la API nuevamente.`);
        }
    } else {
        console.log(`[/api/weather] No se encontraron datos en caché para: ${city}. Consultando la API.`);
    }

    try {
        // Consultar API y actualizar caché
        const weatherData = await fetchWeatherFromAPI(city);
        weatherCache.set(cacheKey, { data: weatherData, timestamp: currentTime });

        console.log(`[/api/weather] Datos actualizados en caché para: ${city}`);
        return res.json(weatherData);
    } catch (error) {
        console.error(`[/api/weather] Error al consultar la API del clima para ${city}: ${error.message}`);
        return res.status(500).json({ message: "Error al obtener datos del clima" });
    }
});


app.get("/api/weather/24hours", async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ message: "Se requiere la ciudad" });
    }

    const cacheKey = city.toLowerCase();
    const currentTime = new Date();
    const dataForGraph = [];

    for (let i = 0; i < 24; i++) {
        const pastTime = new Date(currentTime);
        pastTime.setHours(currentTime.getHours() - i);
        const dateString = pastTime.toISOString().split("T")[0]; // Formato YYYY-MM-DD
        const hourString = pastTime.getHours().toString().padStart(2, '0'); // Formato HH

        const hourKey = `${cacheKey}:${dateString}:${hourString}`;

        if (weatherCache.has(hourKey)) {
            dataForGraph.push(weatherCache.get(hourKey).data);
        } else {
            try {
                console.log(`Consultando datos históricos para ${city} en ${dateString}`);
                const weatherData = await fetchWeatherFromAPI(city, dateString);

                const hourData = weatherData.forecast.forecastday[0].hour.find(
                    h => h.time.endsWith(`${hourString}:00`)
                );

                if (hourData) {
                    weatherCache.set(hourKey, { data: hourData, timestamp: pastTime.getTime() });
                    dataForGraph.push(hourData);
                } else {
                    console.warn(`No se encontraron datos para la hora específica: ${pastTime}`);
                    dataForGraph.push({ temp_c: null });
                }
            } catch (error) {
                console.error(`Error al obtener datos históricos para ${city} en ${dateString}:`, error.message);
                dataForGraph.push({ temp_c: null });
            }
        }
    }

    res.json(dataForGraph);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/home.html"));
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/home.html"));
});

app.get("/FavA", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/FavA.html"));
    
});

app.get("/aboutUs", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/aboutUs.html"));
});

app.get("/contactUs", (req, res) => {
    res.sendFile(path.join(__dirname, "../Views/contactUs.html"));
});

app.get("/api/validate-token", authenticateToken, (req, res) => {
    res.status(200).json({ message: "Token válido" });
});

function authenticateToken(req, res, next) {
    let authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
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
        console.log("token verificado")

        req.user = user;
        next();
    });
}



app.post("/api/users", (req,res) => {
    console.log("Datos recibidos en req.body:", req.body);
    console.log("Datos recibidos:", req.body);
    let {Name,Email,Password} = req.body;
    
    let user= new User({Name,Email,Password});
    user.save().then((doc)=>console.log("Usuario Creado"));

    res.status(201).json({
        message: "Usuario creado correctamente",
    });

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