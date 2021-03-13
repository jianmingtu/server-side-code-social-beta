"# server-side-code-social-alpha" 


Lambda Function on AWS 

ROOT API:  https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/

Test using CURL

Get Posts
> curl https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/

Create a Post
> curl -X POST -H "Content-Type: application/json" -d '{"imageUrl": "story book", "description": "Stuff and Things", "type": "An amazing blog post about both stuff and things."}' https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts

Get Post By Id
> curl https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/'6047fe3bfde94600074c889d'

Delete a Post By Id
> curl -X DELETE https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/'6046a9bd853435364a6bd40a'

Update a Post By Id
> curl -X PUT -H "Content-Type: application/json" -d '{"imageUrl": "wayne is awesome", "description": "Stuff and Things", "type": "image."}' https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/'6046a9c8853435364a6bd40b'


1)  CreatePostMongoDB
    API ENDPOINT: POST  /posts/
             body : {content: xxx, imgUrl: xxx}

    a) Database Layer, see socialCafeDatabase.js for detail:
    async function createPost({user, body})  {     
        return await db.collection('Posts').insertOne({
            ...body,
            totalLikes: 0,
            totalComments: 0,
            timestamp: Date.now(),
            ...user,            
        })
    }

    b) AWS Lambda API interface
        const socialCafeDB = require('/opt/nodejs/socialCafeDatabase')

        exports.handler = async (event, context, callback) => {
    
        context.callbackWaitsForEmptyEventLoop = false;
            
        try {
            
            const body = event.body
            const user = event.user
            
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


