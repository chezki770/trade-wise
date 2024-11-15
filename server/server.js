const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const path = require('path');

const db = require("./config/keys").mongoURI;
const users = require("./routes/auth/users");
// Passport config
// const passport = require("./config/passport")(passport);

const app = express();

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// DB Config

// Connect to MongoDB
mongoose.connect(db, {useNewUrlParser: true}
    )
    .then(() => console.log("MongoDB successfully connected!"))
    .catch(err => console.log(err));

    // Routes
    app.use("/api/users", users);
    // Passport middleware
    app.use(passport.initialize());

// Serve Static Assets if in production
if(process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const port = process.env.PORT || 8080
// process.env.pot is Heroku's port if one chooses to deploy there

app.listen(port, () => console.log(`Server up and running on port ${port} !`));