const { MongoClient, ObjectId } = require('mongodb');
const MONGODB_URI = `mongodb+srv://team8:team8@cluster0.kgzz2.mongodb.net/socialCafe?retryWrites=true&w=majority`;;


module.exports = async (event, context) => {

    // Connect to our MongoDB database hosted on MongoDB Atlas
    const client = await MongoClient(MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }).connect();
    // Specify which database we want to use
    const db = client.db('socialCafe');
    
    async function createPost({user, body})  {     
        return await db.collection('Posts').insertOne({
            ...body,
            totalLikes: 0,
            totalComments: 0,
            timestamp: Date.now(),
            user,            
        })
    }

    async function getPostComments({ postId }) {
        return await db.comments.find({ postId: ObjectId(postId) }).sort({ "timestamp": -1 }).toArray()
    }

     async function createComment({user, body }) {

        const {postId, comment} = body
        
        const session = client.startSession()
        session.startTransaction()
        try {
            
            //  insert comment
            const result = await db.comments.insertOne({
                ...comment,
                postId: ObjectId(postId),
                ...user,  
                timestamp: Date.now()
            })
    
            //  increase total
              await db.posts.findOneAndUpdate({ "_id": ObjectId(postId) }, {$inc: { "totalComments": 1 }})
              
              await session.commitTransaction()
              
              return result.ops[0]
        } catch (error) {
              await session.abortTransaction()
              throw error
        } finally {
            await session.endSession()
        }
    }

    return {
        createPost,
        createComment,
    }
}