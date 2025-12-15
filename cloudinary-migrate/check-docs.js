// check-docs.js
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
(async()=>{
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'test';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('news');

  // replace with real _id strings you want to check:
  const ids = [
    "67da6db2e8fb9e3cf4ee87b7",
    "692a8c2ec9e2574cb555a92e"
  ];
  for(const id of ids){
    let q;
    try { q = { _id: new ObjectId(id) }; } catch(e) { q = { _id: id }; }
    const doc = await col.findOne(q, { projection: { title:1, image:1, imgId:1 }});
    console.log('----', id, '----');
    console.log(doc);
  }
  await client.close();
})();
