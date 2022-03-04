const { Pool } = require('pg');

// Conexión con bbdd

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "jesus4ever",
    port: 5432,
    database: "skatepark",
});

// Funciones que interactuan con bbdd

// Create
const nuevoSkater = async(email, nombre, password, anos_experiencia,especialidad,foto, estado) =>{
    const result = await pool.query(

        `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto,estado) 
        values ('${email}', '${nombre}','${password}', '${anos_experiencia}','${especialidad}','${foto}','${estado}') RETURNING *`

    );
    const usuario = result.rows[0];
    return usuario 
}

// Read
const consultaSkater = async () => {

    try {
        const result = await pool.query("SELECT * FROM skaters");
        //console.log(result.rows)
        return result.rows;
    } catch (error) {

        console.log(error.code);
        return error;
    }
};


// Update
const setSkaterStatus = async (id,auth) => {

    try {
        const result = await pool.query(`UPDATE skaters SET estado = ${auth} WHERE id = ${id} RETURNING *`);
        return result.rows[0];
    }
    catch (error) {
        console.log(error.code);
        return error;
    }
}; 

// Read One 
const getSkater = async (email,password) => {

    try {
        const result = await pool.query(
            `SELECT * FROM skaters WHERE email = '${email}' AND password = '${password}'`);    
        return result.rows[0];
    }
    catch (error) {
        console.log(error.code);
        return error;
    }
};

// Delete by name
const deleteSkater = async (nombre) => {
    
    try {
    const result = await pool.query(
    `DELETE FROM skaters WHERE nombre = '${nombre}'`
    );
    return result;
    } catch (error) {
    console.log(error.code);
    return error;
    }
}

module.exports = {nuevoSkater, consultaSkater, setSkaterStatus, getSkater, deleteSkater}

