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

```


## <font color=green> 2)  CreatePostMongoDB </font>
```
    a) API ENDPOINT: POST  /posts/
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

```

## 3) GetSinglePostMongDB 
```
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
```

## 4. UpdateSinglePostMongoDB
```
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
```

## 5. DeleteSinglePostMongoDB
```
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
```

