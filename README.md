"# server-side-code-social-alpha" 


Lambda Function on AWS 

ROOT API:  https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts

1) GetPostsMongoDB
API ENDPOINT: GET  /posts/

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI
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
exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
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
};



2)  CreatePostMongoDB
API ENDPOINT: POST  /posts/
             body : {description: xxx, imgUrl: xxx, type: xxx}


const { MongoClient } = require('mongodb');
const MONGODB_URI = `mongodb+srv://team8:team8@cluster0.kgzz2.mongodb.net/socialCafe?retryWrites=true&w=majority`;
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

exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
         const {imageUrl, description, type } = event;
        
        // Connect to mongodb database
        const db = await connectToDatabase();
      
        // const postDetails = req.body
        // const user = req.user
        
        const post = await db.collection('Posts').insertOne({
            imageUrl: imageUrl,
            description: description,
            type: type,
            totalLikes: 0,
            totalComments: 0,
            timestamp: Date.now(),
            // user: { 
            //   _id: ObjectId(user._id),       
            //   username: user.username 
            // }
        })
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                post: post.ops[0]
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
};


3) GetSinglePostMongDB 
 API ENDPOINT: POST  /posts/_id
_id above is the post id being previously created by database automatically

const { MongoClient, ObjectId } = require('mongodb');
const MONGODB_URI = `mongodb+srv://team8:team8@cluster0.kgzz2.mongodb.net/socialCafe?retryWrites=true&w=majority`;
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

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        // Connect to mongodb database
        const db = await connectToDatabase();
        const post = await db.collection('Posts').findOne({"_id" : ObjectId(event.pathParameters.postId)});
        
        // do not remove the statusCode below, otherwise,  it will cause malformed Proxy response
        return {
            statusCode: 200,
            body:   JSON.stringify({posts: post})
        };
        
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                errorMsg: `Error while creating a user: ${err}`,
            }),
        };
    }
};

// 4. UpdateSinglePostMongoDB
API ENDPOINT: PUT  /posts/_id
             body : {description: xxx, imgUrl: xxx, type: xxx}
_id above is the post id being previously created by database automatically             

const { MongoClient, ObjectId } = require('mongodb');
const MONGODB_URI = `mongodb+srv://team8:team8@cluster0.kgzz2.mongodb.net/socialCafe?retryWrites=true&w=majority`;
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

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {       
        // Connect to mongodb database
        const db = await connectToDatabase();

        // Update database document
        const post = await db.collection('Posts').updateOne(
            {_id: ObjectId(event.pathParameters.postId)}, 
            {$set : { ...JSON.parse(event.body) }})

        // do not remove the statusCode below, otherwise,  it will cause malformed Proxy response
        return {
            statusCode: 200,
            body:   JSON.stringify({posts: post})
        };
        
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                errorMsg: `Error while creating a user: ${err}`,
            }),
        };
    }
};

// 5. DeleteSinglePostMongoDB
API ENDPOINT: DELETE  /posts/_id
_id above is the post id being previously created by database automatically

const { MongoClient, ObjectId } = require('mongodb');
const MONGODB_URI = `mongodb+srv://team8:team8@cluster0.kgzz2.mongodb.net/socialCafe?retryWrites=true&w=majority`;
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

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        
         // Connect to mongodb database
        const db = await connectToDatabase();
        
        // delete database document
        const post = await db.collection('Posts').deleteOne(
            {_id: ObjectId(event.pathParameters.postId)})

        // do not remove the statusCode below, otherwise,  it will cause malformed Proxy response
        return {
            statusCode: 200,
            body:   JSON.stringify({posts: post})
        };
        
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                errorMsg: `Error while creating a user: ${err}`,
            }),
        };
    }
};


