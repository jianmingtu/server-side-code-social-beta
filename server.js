const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

// replace the uri string with your connection string.
const uri = process.env.MONGODB_URI

// const query = async (collection) => {

//     // connect to database 
//      const connection = await MongoClient.connect(uri);

//      const db = connection.db("socialCafe")
     
//      // select the table and return
//      const ret= db.collection(collection).find({}).toArray();
// }

// try {

//     const result = query('')
//      console.log(result)
// } catch(error) {

// }

let db

const loadDB = async () => {

    try {
        const client = await MongoClient.connect(uri);
        db = client.db('socialCafe');
    } catch (err) {
        Raven.captureException(err);
    }
    return db;
};


const db1 =   loadDB();

 db1.collection('users').insertOne({username: "Sam"});

