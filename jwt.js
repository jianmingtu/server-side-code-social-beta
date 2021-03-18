// Generate aJWT on the server

const jwt = require("jsonwebtoken")

// Create a secret key for signing the token
// Later on we can store this in the server so it doesn't exist in the code
// 'my secret' is just for development
const secret = process.env.ACCESS_TOKEN_SECRET || 'my secret'

function generateToken(data) {
  const token = jwt.sign(data, secret, { expiresIn: "100000000000000000000000s" })
  return token
}
exports.generateToken = generateToken


// Custom jwt middleware function
function authorize(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader ? authHeader.split(' ')[1] : null

  if (!token) {
    console.error("no token sent to server")
    res.status(401).send({error: "no token sent to server"})
    return 
  }

  let decoded
  try {
    decoded = jwt.verify(token, secret);
  } catch(error) {
    console.error(error)
    res.status(403).send({error: "Invalid Token"})
    return
  }

  req.user = decoded
  next()
}
exports.authorize = authorize