

## getPostsMongoDB

const socialCafeDB = require('./nodejs/socialCafeDatabase')

exports.handler = async (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
  const db = await socialCafeDB()
        
        const posts = await db.getPosts({event})
        
        return {posts};
        
    } catch (err) {
        throw new Error(`Error while running getPostsMongoDB : ${err}`)
    }
};




## CreatePostMongoDB
   const socialCafeDB = require('./nodejs/socialCafeDatabase')

    exports.handler = async (event, context, callback) => {

        context.callbackWaitsForEmptyEventLoop = false;
            
        try {
            
            const body = event.body
            const user = event.user
            
            const db = await socialCafeDB()
            
            const post = await db.createPost({user, body})
            
            return {post};
            
        } catch (err) {
            throw new Error(`Error while creating : ${err}`)
        }
    };

## DeleteSinglePostMongoDB
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
        
        // delet database document
        const post = await db.collection('Posts').deleteOne(
            {_id: ObjectId(event.postId)})

        // do not remove the statusCode below, otherwise,  it will cause malformed Proxy response
        return {post}
        
    } catch (err) {
        throw new Error(`error while running DeleteSinglePostMongoDB, error message : ${err}`)
    }
};

## GetSinglePostMongoDB
const socialCafeDB = require('./nodejs/socialCafeDatabase')

exports.handler = async (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
        const db = await socialCafeDB()
        
        const post = await db.getPost({event})
        
        return {post};
        
    } catch (err) {
        throw new Error(`Error while creating : ${err}`)
    }
};

## UpdateSinglePostMongoDB

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
            {_id: ObjectId(event.postId)}, 
            {$set : event.body})

        // do not remove the statusCode below, otherwise,  it will cause malformed Proxy response
        return {post}
 
        
    } catch (err) {
        throw new Error(`Error while creating a user: ${err}`)
    }
};

## GetCommentsMongoDB
const socialCafeDB = require('./nodejs/socialCafeDatabase')

exports.handler = async (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
        const db = await socialCafeDB()
        
        const comments = await db.getComments({event})
        
        return {comments };
        
    } catch (err) {
        throw new Error(`Error while creating : ${err}`)
    }
};

## CreateCommentMongoDB
const socialCafeDB = require('./nodejs/socialCafeDatabase')

exports.handler = async (event, context, callback) => {


    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
        const db = await socialCafeDB()
        
        const comment = await db.createComment({event})
        
        return {comment}
        
    } catch (err) {
        throw new Error(`Error while doing CreateCommentMongoDB: ${err}`)
    }
};

## DeleteCommentMongoDB
    async function deleteComment({ event }) {

        const {body, user, postId, commentId } = event
        
        const session = client.startSession()
        session.startTransaction()
        try {
          const comment = await db.collection('Comments').findOneAndDelete({_id: ObjectId(commentId)})
          if (!comment.value) {
            throw Error("No comment exists for this user")
          }
    
          const update = {
            $inc: {
              "totalComments": -1
            }
          }
    
          await db.collection('Posts').findOneAndUpdate({ "_id": ObjectId(postId) }, update)
          await session.commitTransaction()
          return comment.value
        } catch (error) {
          await session.abortTransaction()
          throw error
        } finally {
          await session.endSession()
        }        
    }   

## UpdateSingleCommentMongoDB
const socialCafeDB = require('./nodejs/socialCafeDatabase')

exports.handler = async (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
        const db = await socialCafeDB()
        
        const comment = await db.UpdateComment({event})
        
        return {comment, event}
        
    } catch (err) {
        throw new Error(`Error while creating : ${err}`)
    }
};


## DeleteLikesMongoDB
const socialCafeDB = require('./nodejs/socialCafeDatabase')

exports.handler = async (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
        const db = await socialCafeDB()
        
        const post = await db.deleteLike({event})
        
        return {post};
        
    } catch (err) {
        throw new Error(`Error while creating : ${err}`)
    }
};

## CreateLikesMongoDB
const socialCafeDB = require('./nodejs/socialCafeDatabase')

exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
        const db = await socialCafeDB()
        
        const like = await db.createLike({event})
        
        return {like};
        
    } catch (err) {
        throw new Error(`Error while creating : ${err}`)
    }
};