

let modalregister=document.getElementById("registerForm");

modalregister.addEventListener("submit",async function (event) {
    event.preventDefault()
    
    let name=document.getElementById("registername").value
    let email=document.getElementById("registeremail").value
    let password=document.getElementById("registerpassword").value
    let confirmpass=document.getElementById("confirmpass").value

    if(password!=confirmpass){
        alert("las contraseñas no coinciden")
        return
    }
    
    let userdata={name,email,password}

    sessionStorage.setItem("userdata", JSON.stringify(userdata));
    alert("Registrado Correctamente")

    modalregister.reset()
})



let modallogin=document.getElementById("loginForm")
modallogin.addEventListener("submit",async function (event) {
    event.preventDefault()

    let login_email=document.getElementById("loginEmail").value
    let login_pass=document.getElementById("loginPassword").value

    let stored_data=sessionStorage.getItem("userdata");
    let userdata= JSON.parse(stored_data)

    if(login_email==userdata.email&& login_pass==userdata.password){
        alert(`Bienvenido ${userdata.name}`)

    }

    modallogin.reset();
})
