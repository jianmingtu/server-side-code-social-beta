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
API ENDPOINT: GET  /posts?search=bcitjimmy 
              GET  /posts?search=Brother Bang
```
a) see lambdafunctions.md for source codes

b)   Integration Request (When there are no templates defined (recommended) 
        application/json,

{
    "search": "$util.escapeJavaScript($input.params().querystring.get('search'))"
}

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

    f) see lambdafunctions.md for source codes
```

## 3) GetSinglePostMongDB 
```
 API ENDPOINT: POST  /posts/_id
_id above is the post id being previously created by database automatically

    a) ** Integration Request (When there are no templates defined (recommended) 
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

    b) see lambdafunctions.md for source codes

```

## 4. UpdateSinglePostMongoDB
```
API ENDPOINT: PUT  /posts/_id
             body : {content: xxx, imgUrl: xxx, type: xxx}
_id above is the post id being previously created by database automatically 

    a) ** Integration Request (When there are no templates defined (recommended) 
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

    b) see lambdafunctions.md for source codes

```

## 5. DeleteSinglePostMongoDB
```
API ENDPOINT: DELETE  /posts/_id
_id above is the post id being previously created by database automatically


    a)  Integration Request (When there are no templates defined (recommended) 
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

    b) see lambdafunctions.md for source codes

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
    d) see lambdafunctions.md for source codes
```


## 7. UpdateCommentMongoDB
```
API ENDPOINT: POST  /posts/{postId}/comments/{commentId}
    headers: { Authentication : JWT-token }
    body: {comment-string}

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
    d) see lambdafunctions.md for source codes
```

## 7. DeleteCommentMongoDB

API ENDPOINT: 
DELETE https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/{postId}/comments/{commentId}
headers: { Authentication : JWT-token }

   a) see lambdafunctions.md for source codes

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

## 8. GetCommentsMongoDB
API ENDPOINT: 
GET https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/{postId}/comments
headers: { Authentication : JWT-token }

   a)  see lambdafunctions.md for source codes


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

## 9. CreateLikesMongoDB

API ENDPOINT: 
POST https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/{postId}/likes
headers: { Authentication : JWT-token }

   a) see lambdafunctions.md for source codes

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

## 10. DeleteLikesMongoDB

API ENDPOINT: 
DELETE https://lpmp2m4ovd.execute-api.us-east-2.amazonaws.com/prod/posts/6050f0f60efe2d0007427875/likes

    a) see lambdafunctions.md for source codes


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

## 11 Create Users after email Confirmation
    in Cognitor,  when we create a user pool,  we trigger a Post confirmation function userAuthConfirmedMongoDB so that right after users register and confirm a verified email, cognitor will send a request to this Lambda function, which creates a new user in Users table.  

    ![](https://i.imgur.com/LgCExrd.png)

var aws = require('aws-sdk');
var ses = new aws.SES();

const socialCafeDB = require('./nodejs/socialCafeDatabase')

// https://aws.amazon.com/ses/pricing/
// https://medium.com/hackernoon/how-to-add-new-cognito-users-to-dynamodb-using-lambda-e3f55541297c
// https://datacadamia.com/aws/cognito/js_identity
// https://medium.com/@gmonne/custom-authentication-using-aws-cognito-e0b489badc3f
// https://www.npmjs.com/package/amazon-cognito-identity-js
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html
async function sendEmail(to, body) {
    var eParams = {
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Text: {
                    Data: body
                }
            },
            Subject: {
                Data: "Cognito Identity Provider registration completed"
            }
        },

        // Replace source_email with your SES validated email address
        Source: "<jtu@my.bcit.ca>"
    };

    await ses.sendEmail(eParams)

};


exports.handler = async (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;
        
    try {
        

        const db = await socialCafeDB()
        
        const post = await db.createUser({event})
        
        await sendEmail(event.request.userAttributes.email, "Congratulations " + event.userName + ", you have been confirmed: ")
        
        return event;
        
    } catch (err) {
        throw new Error(`Error while creating : ${err}`)
    }
};

## 12. [lambdafunctions.md contains the missing Lambda functions being part of the README.md's Lambda functions](lambdafunctions.md)

## 13. Conclusion 


most important is we do not use the proxy in our project anymore because we need more layers on the API Gateway. If using proxy, the API tree only supports up to 2 layers, which are the bottom /, /uppers, /{upper-id+}
    ![](https://i.imgur.com/sJNtODX.png)