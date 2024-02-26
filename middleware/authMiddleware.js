const jwt = require('jsonwebtoken');

const validateAdmin = (req, res, next) => {
  const token = req.cookies.token;
  // console.log(token);
  if (!token) {
    return res.redirect('/admin');
  }

  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) {
      return res.redirect('/admin');
    }
    req.user = decoded;
    next();
  });
};



const validateUser = (req,res,next) => {
  const token = req.cookies.UserToken;
  if(!token){
   return res.redirect('/login');
  }
  jwt.verify(token,'secretKeyUser',(err,decoded)=>{
    if(err){
      return res.redirect('/login');
    }
    next();

  })

}

module.exports = {
  validateAdmin,
  validateUser
};
