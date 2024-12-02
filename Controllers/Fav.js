const app = document.querySelector('.weather-app');
const temp = document.querySelector('.temp');
const dateOutput = document.querySelector('.date');
const timeOutput = document.querySelector('.time');
const conditionOutput = document.querySelector('.condition');
const nameOutput = document.querySelector('.name');
const icon = document.querySelector('.icon');
const cloudOutput = document.querySelector('.cloud');
const humidityOutput = document.querySelector('.humidity');
const windOutput = document.querySelector('.wind');
const form = document.getElementById('locationInput');
const search = document.querySelector('.search');
const btn = document.querySelector('.submit');
const cities = document.querySelectorAll('.city');
const favoritesContainer = document.querySelector('.favorites-container');
const favoriteBtn = document.querySelector('.favorite-btn');
const suggestionsContainer = document.querySelector('.autocomplete-suggestions');

let cityInput = "Mexico City";
let favorites = [];

// Función para agregar una ciudad a los favoritos
function toggleFavorite(city) {
    // Si la ciudad ya está en los favoritos, la quitamos
    if (favorites.includes(city)) {
        favorites = favorites.filter(favCity => favCity !== city); // Eliminar la ciudad de los favoritos
    } else {
        // Si la ciudad no está, la agregamos
        favorites.push(city);
    }
    updateFavoritesDisplay(); // Actualizar la visualización de los favoritos
}
// Actualiza la visualización de los favoritos
function updateFavoritesDisplay() {
    favoritesContainer.innerHTML = ''; // Limpiar la lista de favoritos
    favorites.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.classList.add('favorite-city');
        cityElement.innerHTML = city;
        cityElement.addEventListener('click', () => {
            cityInput = city;
            fetchWeatherData();
            fetchWeatherGraphData(cityInput);
            app.style.opacity = "0";
        });
        favoritesContainer.appendChild(cityElement);
    });
}

// Función para cambiar la ciudad al hacer clic en una ciudad del panel
cities.forEach((city) => {
    city.addEventListener('click', (e) => {
        cityInput = e.target.innerHTML;
        fetchWeatherData();
        fetchWeatherGraphData(cityInput);
        app.style.opacity = "0";
    });
});

// Evento de submit para buscar ciudad
form.addEventListener('submit', (e) => {
    e.preventDefault(); 
    if (search.value.length === 0) {
        alert('Type a city name');
    } else {
        cityInput = search.value;
        fetchWeatherData();
        fetchWeatherGraphData(cityInput);
        search.value = ''; 
        suggestionsContainer.innerHTML = ''; 
        suggestionsContainer.classList.remove('visible');
        app.style.opacity = '0';
    }
});

function removeDuplicates(suggestions) {
    const uniqueSuggestions = [];
    const seen = new Set();

    suggestions.forEach(suggestion => {
        if (!seen.has(suggestion.name)) {
            seen.add(suggestion.name);
            uniqueSuggestions.push(suggestion);
        }
    });

    return uniqueSuggestions;
}

// Función para obtener sugerencias de autocompletado
function fetchAutocompleteSuggestions(query) {
    if (!query) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('visible'); 
        return;
    }

    fetch(`https://api.weatherapi.com/v1/search.json?key=539c86bb88c44da68c1230220242111&q=${query}`)
        .then(response => response.json())
        .then(data => {
            const uniqueData = removeDuplicates(data); // Elimina duplicados
            if (uniqueData.length > 0) {
                renderSuggestions(uniqueData);
                suggestionsContainer.classList.add('visible'); 
            } else {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.classList.remove('visible'); 
            }
        })
        .catch(error => {
            console.error("Error fetching autocomplete suggestions:", error);
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('visible'); 
        });
}

// Renderizar las sugerencias
function renderSuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    const existingSuggestions = new Set();

    suggestions.forEach((suggestion) => {
        if (!existingSuggestions.has(suggestion.name)) {
            existingSuggestions.add(suggestion.name);

            const li = document.createElement('li');
            li.textContent = suggestion.name;
            li.classList.add('suggestion-item');
            li.addEventListener('click', () => {
                cityInput = suggestion.name;
                fetchWeatherData();
                fetchWeatherGraphData(cityInput);
                suggestionsContainer.innerHTML = ''; 
                suggestionsContainer.classList.remove('visible'); 
                search.value = ''; 
                app.style.opacity = '0';
            });
            suggestionsContainer.appendChild(li);
        }
    });
}

// Evento input para mostrar sugerencias mientras se escribe
search.addEventListener('input', () => {
    fetchAutocompleteSuggestions(search.value.trim());
});

// Limpia las sugerencias al hacer clic fuera del formulario
document.addEventListener('click', (e) => {
    if (!e.target.closest('#locationInput')) {
        suggestionsContainer.innerHTML = ''; 
        suggestionsContainer.classList.remove('visible'); 
    }
});

// Función para obtener el día de la semana
function diaSemana(day, month, year) {
    const diaSem = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return diaSem[new Date(`${year}-${month}-${day}`).getDay()];
}

// Función para obtener los datos del clima de la API
function fetchWeatherData() {
    fetch(`http://api.weatherapi.com/v1/current.json?key=539c86bb88c44da68c1230220242111&q=${cityInput}`)
    .then(response => response.json())
    .then(data => {
        temp.innerHTML = `${data.current.temp_c}°`;
        conditionOutput.innerHTML = data.current.condition.text;

        const date = data.location.localtime;
        const y = parseInt(date.substr(0, 4));
        const m = parseInt(date.substr(5, 2));
        const d = parseInt(date.substr(8, 2));
        const time = date.substr(11);

        dateOutput.innerHTML = `${diaSemana(d, m, y)} ${d}, ${m} ${y}`;
        timeOutput.innerHTML = time;
        nameOutput.innerHTML = data.location.name;

        const iconId = data.current.condition.icon.substr("//cdn.weatherapi.com/weather/64x64".length);
        icon.src = data.current.condition.icon;

        cloudOutput.innerHTML = `${data.current.cloud}%`;
        humidityOutput.innerHTML = `${data.current.humidity}%`;
        windOutput.innerHTML = `${data.current.wind_kph} km/h`;

        let timeOfDay = "day";
        const code = data.current.condition.code;
        if (!data.current.is_day) {
            timeOfDay = "night";
        }

        if (code == 1000) {
            app.style.backgroundImage = `url(../images/clear.png)`;
            btn.style.background = "#e5ba92";
            if (timeOfDay == "night") {
                btn.style.background = "#181e27";
            }
        } else if (code == 1003 || code == 1006 || code == 1009) {
            app.style.backgroundImage = `url(../images/cloudy.jpg)`;
            btn.style.background = "#fa6d1b";
            if (timeOfDay == "night") {
                btn.style.background = "#181e27";
            }
        } else if (code == 1063 || code == 1069 || code == 1072) {
            app.style.backgroundImage = `url(../images/rainy.jpg)`;
            btn.style.background = "#647d75";
            if (timeOfDay == "night") {
                btn.style.background = "#325c80";
            }
        } else {
            app.style.backgroundImage = `url(../images/snow.jpg)`;
            btn.style.background = "#4d72aa";
            if (timeOfDay == "night") {
                btn.style.background = "#1b1b1b";
            }
        }
        app.style.opacity = "1";
    })
    .catch(() => {
        alert('City not found');
        app.style.opacity = "1";
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const defaultCity = "Mexico City"; // Ciudad por defecto
    fetchWeatherGraphData(defaultCity); // Mostrar gráfico automáticamente
});

function fetchWeatherGraphData(city) {
    fetch(`/api/weather/24hours?city=${city}`)
        .then(response => response.json())
        .then(data => {
            console.log("Datos recibidos para la gráfica (Frontend):", data); // Ver datos crudos
            const temperatures = data.map(entry => entry?.temp_c ?? null); // Extraer temperaturas
            console.log("Temperaturas procesadas para la gráfica:", temperatures); // Ver array procesado

            const hours = Array.from({ length: 24 }, (_, i) => `${24 - i}h`);

            // Renderizar la gráfica
            renderGraph(hours, temperatures);
        })
        .catch(error => {
            console.error("Error al cargar datos del clima para la gráfica:", error);
        });
}
let chartInstance; // Variable global para la instancia del gráfico

function renderGraph(labels, data) {
    const ctx = document.getElementById("weatherGraph").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperatura (°C)",
                data: data,
                borderColor: "white",
                fill: false,
                tension: 0.1,
            }],
        },
    });
}

// Evento para agregar la ciudad actual a los favoritos
favoriteBtn.addEventListener('click', () => {
    toggleFavorite(cityInput);
});


// Inicializar con la ciudad predeterminada
fetchWeatherData();