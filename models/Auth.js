// // models/Auth.js

// import mongoose from "mongoose";

// const authSchema = new mongoose.Schema({
//   username: {
//     type: String,
//   },
//   password: {
//     type: String,
//   },
// });

// // module.exports =

// export default mongoose.models.Auth ||
//   mongoose.model("Auth", authSchema);
// models/Auth.js
// PostgreSQL adapter for the `auth` table (no mongoose)

const { getPool } = require("../utils/db"); // <-- uses your existing PG pool

class Auth {
  // find one user by username
  static async findOne({ username }) {
    const pool = getPool();
    const q = `SELECT * FROM auth WHERE username = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [username]);
    return rows[0] || null;
  }

  // get all users
  static find() {
    return new Query();
  }

  // create new user (if you need it)
  static async create(data) {
    const pool = getPool();
    const { username, password } = data;

    const q = `
      INSERT INTO auth (username, password)
      VALUES ($1, $2)
      RETURNING *
    `;

    const { rows } = await pool.query(q, [username, password]);
    return rows[0];
  }
}

// small query helper so Auth.find() is awaitable like mongoose
class Query {
  async exec() {
    const pool = getPool();
    const q = `SELECT * FROM auth ORDER BY id DESC`;
    const { rows } = await pool.query(q);
    return rows;
  }

  // allow: await Auth.find()
  async then(resolve, reject) {
    this.exec().then(resolve).catch(reject);
  }
}

module.exports = Auth;
