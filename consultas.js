const { Pool } = require('pg');


const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "jesus4ever",
    port: 5432,
    database: "skatepark",
});

const nuevoSkater = async(email, nombre, password, anos_experiencia,especialidad,foto, estado) =>{
    const result = await pool.query(

        `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto,estado) 
        values ('${email}', '${nombre}','${password}', '${anos_experiencia}','${especialidad}','${foto}','${estado}') RETURNING *`

    );
    const usuario = result.rows[0];
    return usuario 
}

const consultaSkater = async () => {

    try {
        const result = await pool.query("SELECT * FROM skaters");
        return result.rows;
    } catch (error) {

        console.log(error.code);
        return error;
    }
};

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

const getSkater = async (email,password) => {

    try {
        const result = await pool.query(
            `SELECT * FROM skaters WHERE email = '${email}' AND password = '${password}'`);    
        //console.log(result.rows[0])
        return result.rows[0];
    }
    catch (error) {
        console.log(error.code);
        return error;
    }
};

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
//console.log(getSkater("ignacio.silva.g@usach.cl", "123"));

module.exports = {nuevoSkater, consultaSkater, setSkaterStatus, getSkater, deleteSkater}

