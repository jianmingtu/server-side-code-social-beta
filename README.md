# AWS Lambda Functions and API End Points

## API End Points and testing

ROOT API:  https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/

Test using CURL

Get Posts
> curl https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/

```diff
+ Create a Post
+ > curl -X POST -H "Content-Type: application/json" -d '{"imageUrl": "story book", "content": "Stuff and Things"}' https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts
```

Get Post By Id
> curl https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/'6047fe3bfde94600074c889d'

Delete a Post By Id
> curl -X DELETE https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/'6046a9bd853435364a6bd40a'

Update a Post By Id
> curl -X PUT -H "Content-Type: application/json" -d '{"imageUrl": "wayne is awesome", "description": "Stuff and Things", "type": "image."}' https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/'6046a9c8853435364a6bd40b'

## Cognito User Pool:
    Cognito service,  manage User Pool, create SocialCafeUser, ...

We should have already created a cognito user pool, but since we did not document it anyway, so we are going to add the cognitor section here and move this content to somewhere (maybe the front-end readme file or )  

## 1) GetPostsMongoDB
API ENDPOINT: GET  /posts/
```
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
exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        // Connect to mongodb database
        const db = await connectToDatabase();
        
        const posts = await db.collection('Posts').find({}).toArray();
            
        return {
            posts: posts
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers:{ 'Access-Control-Allow-Origin' : '*' },
            body: JSON.stringify({
                errorMsg: `Error while doing getPostsMongoDB: ${err}`,
            }),
        };
    }
};

```

## 2)  CreatePostMongoDB 
```
    a) API ENDPOINT: POST  /posts/
            headers: { Authentication : JWT-token }
             body : {content: xxx, imgUrl: xxx}
    
   b) Add JWT authorizer:
    Steps: API GateWay, select socialCafeAPI, Authorizers ( left panel), create New Authorizer as 'socialCafe', select 'Cognito' as Type, select 'SocialCafeUser' as Cognito User Pool, and select 'Authorization' as Token Source. 

   c) Add Authorization:
    Steps: API GateWay, select socialCafeAPI, resources ( left panel), select POST,  Method Request, select 'socialCafe' as Authorization

    d) Add Mapping
    Steps: API GateWay, select socialCafeAPI, resources ( left panel), select POST,  Integration Request, Mapping Templates, select 'When there are no templates defined (recommended)', add 'application/json', add the code snippet below into the template,

    #set($allParams = $input.params())
    {
        "body" : $input.json('$'),
        "user" : {
            "id" : "$context.authorizer.claims.sub",
            "username" : "$context.authorizer.claims['cognito:username']",
            "email" : "$context.authorizer.claims.email"
        }
    }

    e) enable CORS,  either one will do the same job,
        1) we have add 'Access-Control-Allow-Origin' : '*' in API Lambda's response
        2) API GateWay, select socialCafeAPI, resources (left panel), select POST,  Method Response, add 'Access-Control-Allow-Origin'. go back to the POST's Integration Response, write '*' as Mapping value to Response header 'Access-Control-Allow-Origin'

    f) AWS Lambda API interface CreatePostMongoDB

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

```

## 3) GetSinglePostMongDB 
```
 API ENDPOINT: POST  /posts/_id
_id above is the post id being previously created by database automatically

    ** Integration Request (When there are no templates defined (recommended) 
    application/json,
    {
        "body" : $input.json('$'),
        "user" : {
            "id" : "$context.authorizer.claims.sub",
            "username" : "$context.authorizer.claims['cognito:username']",
            "email" : "$context.authorizer.claims.email"
        },
        "postId" : "$util.escapeJavaScript($input.params('postId'))"
    }

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
        const post = await db.collection('Posts').findOne({"_id" : ObjectId(event.postId)});
        
        // do not remove the statusCode below, otherwise,  it will cause malformed Proxy response
        return {post}
        
    } catch (err) {
        throw new Error(`Error while doing GetSinglePostMongoDB: ${err}`)
    }
};

```

## 4. UpdateSinglePostMongoDB
```
API ENDPOINT: PUT  /posts/_id
             body : {content: xxx, imgUrl: xxx, type: xxx}
_id above is the post id being previously created by database automatically 

    ** Integration Request (When there are no templates defined (recommended) 
    application/json,
    {
        "body" : $input.json('$'),
        "user" : {
            "id" : "$context.authorizer.claims.sub",
            "username" : "$context.authorizer.claims['cognito:username']",
            "email" : "$context.authorizer.claims.email"
        },
        "postId" : "$util.escapeJavaScript($input.params('postId'))"
    }


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

```

## 5. DeleteSinglePostMongoDB
```
API ENDPOINT: DELETE  /posts/_id
_id above is the post id being previously created by database automatically


    ** Integration Request (When there are no templates defined (recommended) 
    application/json,
    {
        "body" : $input.json('$'),
        "user" : {
            "id" : "$context.authorizer.claims.sub",
            "username" : "$context.authorizer.claims['cognito:username']",
            "email" : "$context.authorizer.claims.email"
        },
        "postId" : "$util.escapeJavaScript($input.params('postId'))"
    }

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

```


## 6. CreateCommentMongoDB
```
API ENDPOINT: POST  /posts/{postId}/comments
    headers: { Authentication : JWT-token }
    body: {comment-string}

    AWS Lambda Function: 
    a) Method Request - Authorization (socialCafe User Pool), 
    b) Integration Request (When there are no templates defined (recommended) 
        application/json,
        {
            "body" : $input.json('$'),
            "user" : {
                "id" : "$context.authorizer.claims.sub",
                "username" : "$context.authorizer.claims['cognito:username']",
                "email" : "$context.authorizer.claims.email"
            },
            "postId" : "$util.escapeJavaScript($input.params('postId'))"
        }

        see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#context-variable-reference :  "id" : "$input.params('id')",
    c)  Method Response, Integration Response - "Access-Control-Allow-Origin" '*' 
    d) Lambda function


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

    e) database function
    see the function createComment in ./nodejs/socialCafeDatabase.js 
```


## 7. UpdateCommentMongoDB
```
API ENDPOINT: POST  /posts/{postId}/comments/{commentId}
    headers: { Authentication : JWT-token }
    body: {comment-string}

    AWS Lambda Function: 
    a) Method Request - Authorization (socialCafe User Pool), 
    b) Integration Request (When there are no templates defined (recommended) 
        application/json,


        {
            "body" : $input.json('$'),
            "user" : {
                "id" : "$context.authorizer.claims.sub",
                "username" : "$context.authorizer.claims['cognito:username']",
                "email" : "$context.authorizer.claims.email"
            },
            "postId" : "$util.escapeJavaScript($input.params('postId'))",
            "commentId" : "$util.escapeJavaScript($input.params('commentId'))"
        }


        see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#context-variable-reference :  "id" : "$input.params('id')",
    c)  Method Response, Integration Response - "Access-Control-Allow-Origin" '*' 
    d) Lambda function

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
    e) database function
    see the function createComment in ./nodejs/socialCafeDatabase.js 
```


## 7. DeleteCommentMongoDB

API ENDPOINT: 
DELETE https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/{postId}/comments/{commentId}
headers: { Authentication : JWT-token }

   a) const socialCafeDB = require('./nodejs/socialCafeDatabase')

    exports.handler = async (event, context, callback) => {

        context.callbackWaitsForEmptyEventLoop = false;
            
        try {
            
            const db = await socialCafeDB()
            
            const post = await db.deleteComment({event})
            
            return {post};
            
        } catch (err) {
            throw new Error(`Error while doing DeleteSingleCommentMongoDB : ${err}`)
        }
    };

    b) Integration Request (When there are no templates defined (recommended) 
        application/json,


        {
            "body" : $input.json('$'),
            "user" : {
                "id" : "$context.authorizer.claims.sub",
                "username" : "$context.authorizer.claims['cognito:username']",
                "email" : "$context.authorizer.claims.email"
            },
            "postId" : "$util.escapeJavaScript($input.params('postId'))",
            "commentId" : "$util.escapeJavaScript($input.params('commentId'))"
        }    


updated 8 lambda functions above, see the picture below:
most important is we do not use the proxy in our project anymore because we need more layers on the API Gateway. If using proxy, the API tree only supports up to 2 layers, which are the bottom /, /uppers, /{upper-id+}
![](https://i.imgur.com/0y8ec2y.png)        
