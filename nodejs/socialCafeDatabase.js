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
    
    // search context and username
async function getPosts({ event }) {
  
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
    
     async function createComment({user, body, postId }) {

        const {comment} = body
        
        const session = client.startSession()
        session.startTransaction()
        try {
            
            //  insert comment
            const result = await db.collection('Comments').insertOne({
                comment,
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
    
    
async function getPosts({ event }) {
  
  const { search = null, limit = 100, skip = 0} = event 


    const aggregateOptions = [
      {
        // get all likes useId associated to this post
        $lookup: {
          from: 'Likes',
          as: 'likes',
          let: {
            'postId': '$_id',
          },
          pipeline: [
            {
                $match: { 
                      $expr: {
                        $and: [ 
                          { $eq: ['$postId', '$$postId'] }
                        ]
                      }     
                }
            }
          ]
        },
      },
      { $addFields: {
        "likeUserIds": '$likes.user.id'
      }},
      { $project: {
         "likes": 0
      }},




      {
        $lookup: {
          from: 'Users',
          as: 'users',
          let: {
            'sub': '$user.id',
          },
          pipeline: [
            {
              $match: { 
                $expr: {
                  $and: [ 
                    { $eq: ['$sub', '$$sub'] }
                  ]
                } 
              }
            }
          ]
        },
      },
      { $addFields: {
        'user.avatar': '$users.avatar'
      }},
      { $project: {
         "users": 0
      }}  
      
    ]
    
    if (search) {
      aggregateOptions.push({
        $match: { 
          $expr: {
            $or: [ 
              { $regexMatch: {input: '$content', regex: new RegExp(`${search}`), options: "i" }},
              { $regexMatch: {input: '$user.username', regex: new RegExp(`${search}`), options: "i" }}
            ]
          } 
        }
      })
    }
 
    return await db.collection('Posts').aggregate(aggregateOptions).sort({ timestamp: -1, likes: 1}).skip(skip).limit(limit || 20).toArray()
  }


    return {
        createPost,
        createComment,
        UpdateComment,
        getPosts
    }
}


     async function createPost({user, body})  {     
        return await db.collection('Posts').insertOne({
            ...body,
            totalLikes: 0,
            totalComments: 0,
            timestamp: Date.now(),
            user,            
        })
    }

   async function getPost({ event }) {
        
    const {postId, userId} = event
    
    const results = await db.collection('Posts').aggregate([
      {
        $match: {
          _id: ObjectId(postId),
        }
      },
      {
        $lookup: {
          from: 'Comments',
          as: 'comments',
          let: {
            'postId': '$_id'
          },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$postId', '$$postId'] } }
            }, {
              '$sort': { 'timestamp': -1 }
            },
            { $limit: 20 },
          ]
        }
      },
      {
        $lookup: {
          from: 'Likes',
          as: 'likes',
          let: {
            'postId': '$_id',
          },
          pipeline: [
            {
              $match: { 
                $expr: {
                  $and: [ 
                    { $eq: ['$postId', '$$postId'] }
                  ]
                } 
              }
            }
          ]
        },
      },
      { $addFields: {
        "likeUserIds": '$likes.user.id'
      }},
      { $project: {
         "likes": 0
      }},
      
      {
        $lookup: {
          from: 'Users',
          as: 'users',
          let: {
            'sub': '$user.id',
          },
          pipeline: [
            {
              $match: { 
                $expr: {
                  $and: [ 
                    { $eq: ['$sub', '$$sub'] }
                  ]
                } 
              }
            }
          ]
        },
      },
      { $addFields: {
        'user.avatar': '$users.avatar'
      }},
      { $project: {
         "users": 0
      }}  
      
      
    ]).limit(1).toArray()

    return results[0]
  }

    async function getComments({event}) 
    {
        const {postId} = event
    
        // const comments = await db.collection('Comments').find({ postId: ObjectId(postId) }).toArray()
        // return comments

        const aggregateOptions = [
            {$match: {postId: ObjectId(postId)}},
        ]
 
        return await db.collection('Comments').aggregate(aggregateOptions).toArray()
        
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


  async function deleteLike({ event }) {
        
    const {postId, user} = event
    
    const session = client.startSession()
    session.startTransaction()
    try {
      const like = await db.collection('Likes').findOneAndDelete({postId: ObjectId(postId), "user.id": user.id })
      if (!like.value) {
        throw Error("No like exists for this user")
      }

      const update = {
        $inc: {
          "totalLikes": -1
        }
      }

      await db.collection('Posts').findOneAndUpdate({ "_id": ObjectId(postId) }, update)
      await session.commitTransaction()
      return like.value
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }

  }

  async function createLike({event}) {

    const {postId, userId, user} = event
    
    const like = await db.collection('Likes').findOne({postId: ObjectId(postId), "user.id": userId })
    if (like) {
      return like
    }
    

    const session = client.startSession()
    session.startTransaction()
    try {
      const result = await db.collection('Likes').insertOne({
        postId: ObjectId(postId),
        user,
        timestamp: Date.now()
      })

      const update = {
        $inc: {
          "totalLikes": 1
        }
      }

      await db.collection('Posts').findOneAndUpdate({ "_id": ObjectId(postId) }, update)
      await session.commitTransaction()
      return result.ops[0]
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

       async function createUser({event}) {

       
        try {
            
            const post = await db.collection('Users').insertOne(
            {
                username: event.userName,
                sub: event.request.userAttributes.sub,
                email: event.request.userAttributes.email,
                avatar: "https://s3.console.aws.amazon.com/s3/object/socialcafe?region=us-east-2&prefix=default-avatar-icon-68.png",
                confirmedTimestamp: Date.now()
                
            })

        } catch (error) {
              throw error
        } 
    }

  async function UpdateUser({ event }) {

        const {body, user } = event
        const {avatar, description} = body
        
        try {
            

            //  update user 
            const result = await db.collection('Users').updateOne(
                 {sub: user.id}
                 ,
                 {$set :
                     {
                         avatar: avatar,
                         description : description,  
                         timestamp: Date.now()
                     }
                 })
              
             return {result}
        } catch (error) {
              throw error
        }
    }        

   async function getUser({event}) {

        const {userId} = event
        
        try {
            
            return await db.collection('Users').findOne({sub : userId})
              
        } catch (error) {
              throw error
        } 
    }    


     return {
        getPosts,
        createPost,
        getPost,
        getComments,
        createComment,
        deleteComment,
        UpdateComment,
        deleteLike,
        createLike,
        createUser,
        UpdateUser,
        getUser
    }
}