"use strict";
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const MONGODB_URI = "mongodb+srv://team8:team8@cluster0.kgzz2.mongodb.net/test"
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

console.log("ffffffffffffffffffffffffffff", cachedDb)


      return cachedDb;
    });
}
function queryDatabase (db) {
  console.log('=> query database');
  return db.collection('users').find({}).toArray()
    .then((users) => { return { users, statusCode: 200, body: 'success' }; })
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
