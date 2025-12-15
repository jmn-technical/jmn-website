// import mongoose from "mongoose";

// const blogSchema = new mongoose.Schema({
//   slug:{
//   type:String
//   },
//   title: {
//     type: String,
//   },
//   content: {
//     type: String,
//   },
//   image: {
//     type: String,
//   },
//   imgId:{
//     type:String
//   },
//   isPublished:{
//   type:Boolean
//   },
//   createdAt: {
//     type: String,
//   },
//   publishedAt: {
//     type: String,
//   },
// });

// // module.exports =

// export default mongoose.models.News || mongoose.model("News", blogSchema);


// models/News.js
// Pure JS model adapter replacing mongoose, using pg (Neon)
// models/News.js
// Postgres-powered model replacing Mongoose completely

const { getPool } = require("../utils/db"); 

class News {
  static find(filter = {}) {
    return new Query(filter);
  }

  static async create(data) {
    const pool = getPool();

    const {
      slug,
      title,
      content,
      image,
      imgId,
      isPublished,
      publishedAt,
      createdAt,
    } = data;

    const q = `
      INSERT INTO news 
      (slug, title, content, image, imgid, ispublished, createdat, publishedat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      slug ?? null,
      title ?? null,
      content ?? null,
      image ?? null,
      imgId ?? null,
      isPublished ?? false,
      createdAt ? new Date(createdAt) : new Date(),
      publishedAt ? new Date(publishedAt) : null,
    ];

    const { rows } = await pool.query(q, values);
    return rows[0];
  }
}

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

  async exec() {
    return this._run();
  }

  async then(res, rej) {
    try {
      const data = await this._run();
      res(data);
    } catch (err) {
      rej(err);
    }
  }

  async _run() {
    const pool = getPool();

    let order = "ORDER BY COALESCE(publishedat, createdat) DESC";

    if (this._sort) {
      const key = Object.keys(this._sort)[0];
      const dir = this._sort[key] === -1 ? "DESC" : "ASC";

      const map = {
        publishedAt: "publishedat",
        createdAt: "createdat",
        title: "title",
        slug: "slug",
      };

      const col = map[key] || "publishedat";
      order = `ORDER BY ${col} ${dir}`;
    }

    const limitSQL = this._limit ? `LIMIT ${this._limit}` : "";

    const q = `
      SELECT *
      FROM news
      ${order}
      ${limitSQL}
    `;

    const { rows } = await pool.query(q);
    return rows;
  }
}

module.exports = News;
