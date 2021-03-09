//
//  Local express test
//
const express = require('express')
require('dotenv').config()

const app = express()
app.use(express.json())

const { MongoClient } = require('mongodb');

// replace the uri string with your connection string.
const uri = process.env.MONGODB_URI

let cachedDb = null;
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    // Connect to our MongoDB database hosted on MongoDB Atlas
    const client = await MongoClient(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }).connect();
    // Specify which database we want to use
    const db = client.db('socialCafe');
    cachedDb = db;
    return db;
}

const GetPostsMongoDB = async (event, context) => {
    //context.callbackWaitsForEmptyEventLoop = false;
    try {
        // Connect to mongodb database
        const db = await connectToDatabase();
        
        const posts = await db.collection('Posts').find({}).toArray();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                posts: posts
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                errorMsg: `Error while creating a user: ${err}`,
            }),
        };
    }
}

app.get('/posts', async (req, res) => {
    try {
    const posts = await GetPostsMongoDB()
    res.send({posts})
    } catch (error) {
        console.error(error)
        res.send({error: error.message})
    }
})

const port = 5000
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})