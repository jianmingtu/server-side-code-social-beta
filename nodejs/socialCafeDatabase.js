const { MongoClient } = require('mongodb');

const MONGODB_URI = `mongodb+srv://xxxx:xxxx@cluster0.kgzz2.mongodb.net/socialCafe?retryWrites=true&w=majority`;

let cachedDb = null;
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    // Connect to our MongoDB database hosted on MongoDB Atlas
    const client = await MongoClient(MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }).connect();
    // Specify which database we want to use
    const db = client.db('socialCafe');
    cachedDb = db;
    return db;
}
module.exports = async (event, context) => {

    // Connect to mongodb database
    const db = await connectToDatabase();

    async function createPost({user, body})  {     
        return await db.collection('Posts').insertOne({
            ...body,
            totalLikes: 0,
            totalComments: 0,
            timestamp: Date.now(),
            ...user,            
        })
    }


    return {
        createPost
    }
}