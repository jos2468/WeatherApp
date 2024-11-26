

let modalregister=document.getElementById("registerForm");

modalregister.addEventListener("submit",async function (event) {
    event.preventDefault()
    
    let Name=document.getElementById("registername").value
    let Email=document.getElementById("registeremail").value
    let Password=document.getElementById("registerpassword").value
    let confirmpass=document.getElementById("confirmpass").value



    if(Password!=confirmpass){
        alert("las contraseñas no coinciden")
        return
    }
    
    let userdata={Name:Name,Email:Email,Password:Password}
    
    let xhr=new XMLHttpRequest();

    xhr.open("POST", "http://localhost:3000/api/users")
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(JSON.stringify(userdata))
    
    console.log("solicitud enviada")

    xhr.onload=function(){

        
        if (xhr.status==201){
            alert("Usuario agregado correctamente");


        }
        else if(xhr.status !=200){
            alert(xhr.status + ':' + xhr.statusText);

        }
        console.log(xhr.status)
    }

    
    
    modalregister.reset()
    
})




let modallogin = document.getElementById("loginForm");

modallogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    let login_email = document.getElementById("loginEmail").value;
    let login_pass = document.getElementById("loginPassword").value;

    let logindata = { Email: login_email, Password: login_pass };

    let xhr = new XMLHttpRequest();

    xhr.open("POST", "http://localhost:3000/api/login");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(logindata));

    console.log("Solicitud enviada");

    xhr.onload = function () {
        if (xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);

            
            console.log("Respuesta completa:", response);

            
            if (response.token) {
                let token = response.token;
                alert("Bienvenido")
                localStorage.setItem("token",JSON.stringify(token)  )
                
            } else {
                console.log("No se encontró el token en la respuesta.");
                alert("No se recibió un token.");
            }
        } else {
            console.log("Error en la solicitud. Código de estado:", xhr.status);
            alert("Correo o contraseña incorrectos");
        }
    };

    modallogin.reset();
});

function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}