import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const Pool = pg.Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const CREATE_USER_QUERY = 'INSERT INTO users (id, firstname, lastname, email, password) VALUES ($1, $2, $3, $4, $5);'
const GET_USER_WITH_EMAIL_QUERY = 'SELECT * FROM users WHERE email=$1;' 

export async function createUser(user){
    user.id = uuidv4();
    const res = pool.query(CREATE_USER_QUERY, [user.id, user.firstname, user.lastname, user.email, user.password]);
}

export async function getUserByEmail(email){
    const res = await pool.query(GET_USER_WITH_EMAIL_QUERY, [email]);
    if(res.rowCount == 0) {
        return null;
    }
    return res.rows[0];
}

export async function emailExists(email) {
    const res = await pool.query(GET_USER_WITH_EMAIL_QUERY, [email]);
    if(res.rowCount == 0) return false;
    return true;
}