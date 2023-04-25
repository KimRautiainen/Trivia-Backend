'use strict';
const express = require('express');
const cors = require('cors');
const userRoute = require('./database/routes/userRoute');
const passport = require('./utils/passport');
const authRoute = require('./database/routes/authRoute');
const session = require('express-session');
const app = express();
const port = 3000;


// Log middleware
app.use((req,res,next) => {
    console.log(Date.now() + ': request: ' + req.method + ' ' + req.path)
    next();
});

// Serve example-ui


app.use(express.static('registration', ));
//app.use(express.static('kuvat'));
app.use(express.static('profiili'));


// Serve image files
app.use('/uploads', express.static('uploads'));
// Add cors headers using cors middleware
app.use(cors());
// Middleware for parsing request body
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// Use passport for authentication
app.use(passport.initialize());

app.use('/auth', authRoute);
app.use('/user', passport.authenticate('jwt', {session: false}), userRoute);


//app.use('/user', userRoute);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));