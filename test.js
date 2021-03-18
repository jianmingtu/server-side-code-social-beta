//
//  Local express test
//
const express = require('express')
const mongoDB = require('./nodejs/socialCafeDatabase')

const app = express()
app.use(express.json())


// const CreatePostMongoDB = async ({body, user}) => {
//     try {
//         const Post = await mongoDB.createPost();      
//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 posts: posts
//             }),
//         };
//     } catch (err) {
//         return {
//             statusCode: 500,
//             body: JSON.stringify({
//                 errorMsg: `Error while creating a user: ${err}`,
//             }),
//         };
//     }
// }

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