document.getElementById("favorites-link").addEventListener("click", (event) => {
    event.preventDefault();

    // Recuperar el token del almacenamiento local
    let token2 = localStorage.getItem('token');
    token2 = token2 ? token2.replace(/^"|"$/g, '') : null;
    

    
    if (!token2) {
        alert("Acceso denegado, inicia sesión por favor o regístrate en caso de ser necesario");
        window.location.href = "/home";
        return;
    }

    console.log("Token validado. Validando en el servidor...");

    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/validate-token", true); 

    xhr.setRequestHeader("authorization", `Bearer ${token2}`);

    xhr.onload = function () {
        if (xhr.status === 200) {
            window.location.href = "/FavA";
        } else {
            console.error(`Error HTTP: ${xhr.status}`);
            alert("Error al validar el token, inicia sesión nuevamente.");
            window.location.href = "/home";
        }
    };

    xhr.onerror = function () {
        console.error("Error en la conexión al servidor");
        alert("Hubo un problema al conectar con el servidor.");
    };

    xhr.send();
});
