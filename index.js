// Falta recibir y guardar la foto, para redireccionarla e imprimirla.
// Falta poder editar y eliminar los datos de cada usuario que inicia sesión

// El resto funciona completamente, tomando en consideración la creación de la base de datos.


// Librerías y funciones

const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secretKey = "Shhhh"
const { nuevoSkater, consultaSkater, setSkaterStatus, getSkater} = require("./consultas");

// Lógica para usar css, handlebars, fileupload, etc
// Tuve un problema para exportar el css, por lo que en cada handlebar está el style (Sé q es mala práctica, pero no funcionaba)

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.
use(
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
    console.log("3000");
});


// Ruta que muestra los participantes
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

// Creación de usuario (solo falta la foto)
app.post("/usuarios",async(req,res) => {

    const { foto } = req.files;
    const {email, nombre, password, anos_experiencia,especialidad} = req.body
    const estado = false
    const fotoname = "foto" + nombre + ".png"

    try{
        foto.mv(`${__dirname}/archivos/${fotoname}`, (err) => {
            res.send("Archivo cargado con éxito");
        });
        const usuario = await nuevoSkater(email, nombre, password, anos_experiencia, especialidad,fotoname,estado);
        res.status(201).send(JSON.stringify(usuario));
    }
    catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta que solo muestra usuarios. (Hecha para revisar más rápido la base)
// Sirve como endpoint de api
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

// Ruta que reemplaza el E° de check
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

// Ruta de uso administrativo para aprobar participantes
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

// Ruta que verifica al usuario
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

// Ruta que muestra datos luego de verificación
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
