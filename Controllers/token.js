document.getElementById("favorites-link").addEventListener("click", (event) => {
    event.preventDefault();

    
    let token2 = localStorage.getItem('token');
    console.log( token2);
    console.log(`${token2}`)
    
    if (!token2) {
        alert("Acceso denegado, inicia sesión por favor o regístrate en caso de ser necesario");
        window.location.href = "/home";  
        return;  
    }

    console.log("Si pasa el primer if");

    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/FavA", true); 

    
    xhr.setRequestHeader("authorization", `Bearer ${token2}`); // Usar token2
    

    
    xhr.onload = function () {
        if (xhr.status === 200) {
            
            window.location.href = "/FavA";  
        } else {
            
            console.error(`Error HTTP: ${xhr.status}`);
            alert("Error al cargar favoritos, verifica tu sesión.");
        }
    };

    
    xhr.onerror = function () {
        console.error("Error en la conexión");
    };

    
    xhr.send();
});
