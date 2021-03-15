//
//  Local express test
//
const express = require('express')
const socialCafeDB = require('./nodejs/socialCafeDatabase')
const {authorize} = require('./jwt')

const app = express()
app.use(express.json())


// app.get('/posts', async (req, res) => {
//     try {
//     const posts = await GetPostsMongoDB()
//     res.send({posts})
//     } catch (error) {
//         console.error(error)
//         res.send({error: error.message})
//     }
// })


app.get('/posts', authorize, async (req, res) => {
    
    // context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        
        const body = req.body
        const user = req.user
        
        const db = await socialCafeDB()
        
        const post = await db.createPost({user, body})
        
        return {
            statusCode: 200,
            headers:{ 'Access-Control-Allow-Origin' : '*' },
            body: JSON.stringify({
                post: post.ops[0]
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers:{ 'Access-Control-Allow-Origin' : '*' },
            body: JSON.stringify({
                errorMsg: `Error while creating a user: ${err}`,
            }),
        };
    }
};





// // POST /api/posts
// router.post('/', authorize, async (req, res) => {
//     const body = req.body
//     const user = req.user
//     await CreatePostMongoDB({body, user})
// })





// app.get('/posts', async (req, res) => {
//     try {
//     const posts = await GetPostsMongoDB()
//     res.send({posts})
//     } catch (error) {
//         console.error(error)
//         res.send({error: error.message})
//     }
// })

const port = 5000
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})