'use strict';
const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const passport = require('./utils/passport');
const authRoute = require('./routes/authRoute');
const session = require('express-session');
const app = express();
const port = 3000;



// Log middleware
app.use((req,res,next) => {
    console.log(Date.now() + ': request: ' + req.method + '' + req.path)
    next();
});

// Add cors headers using cors middleware
app.use(cors());

// Serve example-ui



// Serve image files
app.use('/uploads', express.static('uploads'));

// Middleware for parsing request body
app.use(express.json());
// Middleware for parsing URL-encoded request bodies with extended options.
app.use(express.urlencoded({extended: true}));
// Initialize Passport for authentication.
app.use(passport.initialize());
// Use the authRoute for handling authentication-related routes
app.use('/auth', authRoute);
// Use the userRoute for handling user-related routes under the '/user' endpoint, and require authentication using the JWT strategy.
app.use('/user', passport.authenticate('jwt', {session: false}), userRoute);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));