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

    async function createComment({event}) {

        const {body, postId, user} = event
        
        const session = client.startSession()
        session.startTransaction()
        try {
            
            //  insert comment
            const result = await db.collection('Comments').insertOne({
                ...body,
                postId: ObjectId(postId),
                user,  
                timestamp: Date.now()
            })
    
            //  increase total
              await db.collection('Posts').findOneAndUpdate({ "_id": ObjectId(postId) }, {$inc: { "totalComments": 1 }})
              
              await session.commitTransaction()
              
              return result.ops[0]
        } catch (error) {
              await session.abortTransaction()
              throw error
        } finally {
            await session.endSession()
        }
    }

    async function UpdateComment({ event }) {

            const {body, user, postId, commentId } = event
            
            try {
                

                //  update comment 
                const result = await db.collection('Comments').updateOne(
                    {_id: ObjectId(commentId)}
                    ,
                    {$set :
                        {
                            ...body,
                            postId: ObjectId(postId),
                            user,  
                            timestamp: Date.now()
                        }
                    })
                
                return result
            } catch (error) {
                throw error
            }
        }    


    async function deleteComment({ event }) {

            const {body, user, postId, commentId } = event
            
            try {
                

                //  delete comment 
                const result = await db.collection('Comments').deleteOne(
                    {_id: ObjectId(commentId)}
                )
                
                return result
            } catch (error) {
                throw error
            }
        }   
        
    async function getComments({event}) 
    {
        const {postId} = event
    
        const comments = await db.collection('Comments').find({ postId: ObjectId(postId) }).toArray()
        return comments
    }
        


     return {
        createPost,
        createComment,
        UpdateComment,
        deleteComment,
        getComments
    }
}