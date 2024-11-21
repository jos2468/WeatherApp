

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
