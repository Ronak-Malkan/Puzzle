"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.emailExists = exports.getUserById = exports.getUserByEmail = exports.createUser = void 0;
const database_1 = require("../config/database");
const createUser = async (userData) => {
    const { email, password, firstname, lastname } = userData;
    const result = await (0, database_1.query)(`INSERT INTO users (email, password, firstname, lastname)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, firstname, lastname, created_at, updated_at`, [email, password, firstname, lastname]);
    return result.rows[0];
};
exports.createUser = createUser;
const getUserByEmail = async (email) => {
    const result = await (0, database_1.query)('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};
exports.getUserByEmail = getUserByEmail;
const getUserById = async (id) => {
    const result = await (0, database_1.query)('SELECT id, email, firstname, lastname, created_at, updated_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};
exports.getUserById = getUserById;
const emailExists = async (email) => {
    const result = await (0, database_1.query)('SELECT COUNT(*) as count FROM users WHERE email = $1', [email]);
    return parseInt(result.rows[0].count) > 0;
};
exports.emailExists = emailExists;
const updateUser = async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const result = await (0, database_1.query)(`UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...values]);
    return result.rows[0];
};
exports.updateUser = updateUser;
//# sourceMappingURL=user.model.js.map