const express = require('express');
const app = express();
const ejs = require('ejs');
require('./dbConfig/database');
const path = require('path');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();


const session = require('express-session');
const flash = require('connect-flash');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/adminRoutes');
const shopRouter = require('./routes/shopRoutes');


app.set('view engine','ejs');
app.set('views',__dirname+'/views');
// app.set('layout','layouts/layout');
// app.set(ejs);

app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave:false,
  saveUninitialized:false
}));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', 0);
  next();
});

app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());


app.use(methodOverride('_method'));


app.use(flash());
app.use('/',authRouter);
app.use('/',adminRouter);
app.use('/',shopRouter);



app.use(express.json());





//for the static files.
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'uploadedImages')));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); 

  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Internal Server Error';

  
  if (statusCode === 404) {
      res.status(statusCode).render('error/error404', { title: 'Not Found', errorMessage });
  } else {
      res.status(statusCode).render('error/error500', { title: 'Internal Server Error', errorMessage });
  }
});

app.listen(process.env.PORT||7000,()=>{
  console.log('Running');
});