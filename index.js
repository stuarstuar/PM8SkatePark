// Falta recibir y guardar la foto, para redireccionarla e imprimirla.
// Falta poder editar y eliminar los datos de cada usuario que inicia sesión


const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secretKey = "Shhhh"

const { nuevoSkater, consultaSkater, setSkaterStatus, getSkater} = require("./consultas");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "El tamaño de la imagen supera el limite",
    })
);

app.use(express.static(__dirname + "/public"))
app.use("/css", express.static(__dirname + "./node_modules/bootstrap/dist/css"));
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
        layoutDir: `${__dirname}/views/mainLayout`,
    })
);
app.set("view engine", "handlebars");



app.listen(3000, () => {
    console.log("El servidor está inicializado en el puerto 3000");
});


app.get("/", async(req, res) => {

    try {
        const usuarios = await consultaSkater();
        res.render("index", {usuarios})
    } 
    catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

app.get("/registro", (req, res) => {
    res.render("Registro")
})

app.post("/usuarios",async(req,res) => {

    const {email, nombre, password, anos_experiencia,especialidad} = req.body
    const estado = false
    //,foto
    try{
        const usuario = await nuevoSkater(email, nombre, password, anos_experiencia, especialidad,"foto",estado);
        res.status(201).send(JSON.stringify(usuario));
    }
    catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

app.get("/usuarios", async (req, res) => {
    
 try {
     const usuarios = await consultaSkater();
     res.send(JSON.stringify(usuarios))
 }
 catch (e) {
     res.status(500).send({
         error: `Algo salió mal... ${e}`,
         code: 500
     })
 }
})



app.put("/usuarios",async(req,res) => {

    const {id,auth} = req.body
    try{
        const usuario = await setSkaterStatus(id,auth);
        res.status(201).send(JSON.stringify(usuario));
    }
    catch(e){
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

app.get("/Admin", async(req, res) => {

    try {
        const usuarios = await consultaSkater();
        const{token} = req.query;
        res.render("Admin", {usuarios})  
    }
    catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

app.get("/login", async (req, res) => {
    res.render("Login")
})

app.post("/verify", async(req, res) =>{

    const {email, password} = req.body;
    const user = await getSkater(email,password);
    if(user){
        if(user.estado){
            const token = jwt.sign(
                {
                    exp: Math.floor((Date.now()/1000)+180),
                    data: user,
                },
                secretKey
            );
            res.send(token);
        }else{
            res.status(401).send({
                error: "Usuario no autorizado",
                code: 401,
            });
        }
    }else{
        res.status(404).send({
            error: "Usuario no registrado",
            code: 404,
        });
    };
});

app.get("/datos", async(req, res) => {

    try {
        const{token} = req.query;
        jwt.verify(token,secretKey,async(err,decoded) => {
            const {data} = decoded
            const {email,password} = data
            const usuario = await getSkater(email,password)
            
            err
                ? res.status(401).send(
                    res.send({
                        error: '401 Unauthorized',
                        message: "Usted no puede entrar",
                        token_error: err.message,
                    })
                )
                :res.render("Datos",{usuario}) 
        })
    } catch (e) {
   
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
});

/*
app.delete("/skaters/:nombre", async (req, res) => {
    const {nombre} = req.body
    try {
       // const usuario = await deleteSkater();
        //res.send(JSON.stringify(usuario))
        console.log(nombre)
    }
    catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})
*/
