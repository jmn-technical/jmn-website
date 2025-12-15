// models/Images.js
// PostgreSQL adapter replacing mongoose completely

const { getPool } = require("../utils/db"); // adjust if needed

class Images {

  static find(filter = {}) {
    return new Query(filter);
  }


  static async create(data) {
    const pool = getPool();

    const { image, imgId } = data;

    const q = `
      INSERT INTO images (image, imgid)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [
      image ?? null,
      imgId ?? null,
    ];

    const { rows } = await pool.query(q, values);
    return rows[0];
  }
}

// ----------------------------------
// Query Helper — supports .sort() + .limit()
// ----------------------------------
class Query {
  constructor(filter) {
    this.filter = filter;
    this._sort = null;
    this._limit = null;
  }

  sort(obj) {
    this._sort = obj;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  async then(resolve, reject) {
    try {
      const data = await this._run();
      resolve(data);
    } catch (err) {
      reject(err);
    }
  }

  async exec() {
    return this._run();
  }

  async _run() {
    const pool = getPool();

    // No timestamp — default to ID ordering
    let order = "ORDER BY id DESC";

    // user sort support
    if (this._sort) {
      const key = Object.keys(this._sort)[0];
      const dir = this._sort[key] === -1 ? "DESC" : "ASC";

      const map = {
        id: "id",
        image: "image",
        imgId: "imgid",
      };

      const col = map[key] || "id";
      order = `ORDER BY ${col} ${dir}`;
    }

    const limitSQL = this._limit ? `LIMIT ${this._limit}` : "";

    const q = `
      SELECT *
      FROM images
      ${order}
      ${limitSQL}
    `;

    const { rows } = await pool.query(q);
    return rows;
  }
}

module.exports = Images;
