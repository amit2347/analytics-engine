const jwt = require("jsonwebtoken");
module.exports.getProfileDetails = async (req, res) => {
  const jsonSecret = process.env.JSON_SECRET_KEY
  const userDetails = req.user;
  if(!userDetails){
    return res.redirect('/')
  }
  if (userDetails.appId) {
    return res.send({
      message: "You already have an app registered with you.",
      appId: userDetails.appId,
    });
  }
  const secretToken =  jwt.sign({id : userDetails.id} ,jsonSecret , {expiresIn : '1h'} )
  return res.send({
    message:
      "You dont have an appId registered with you please register the same.",
    secretToken
  });
};
