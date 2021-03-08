"use strict";
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI; // or Atlas connection string
let cachedDb = null;
function connectToDatabase (uri) {
  console.log('=> connect to database');
  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

   const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true })

  return client.connect()
    .then(() => {
        const db = client.db("socialCafe")

      cachedDb = db;
      return cachedDb;
    });
}
function queryDatabase (db) {
  console.log('=> query database');
  return db.collection('Posts').find({}).toArray()
    .then((posts) => { return { posts, statusCode: 200, body: 'success' }; })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      return { statusCode: 500, body: 'error' };
    });
}
console.log(MONGODB_URI)

connectToDatabase(MONGODB_URI)
.then(db => queryDatabase(db))
.then(result => {
    console.log('=> returning result: ', result);
    //callback(null, result);
})
.catch(err => {
    console.log('=> an error occurred: ', err);
    //callback(err);
});
