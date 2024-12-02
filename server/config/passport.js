// your config/passport.js file:
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = require("../models/User");
const keys = require("./keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    console.log('Configuring passport with opts:', { 
        jwtFromRequest: 'fromAuthHeaderAsBearerToken', 
        secretOrKey: '***' 
    });
    
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            console.log('Processing JWT payload:', {
                id: jwt_payload.id,
                email: jwt_payload.email,
                timestamp: new Date().toISOString()
            });
            
            try {
                const user = await User.findById(jwt_payload.id);
                
                if (user) {
                    console.log('User authenticated:', {
                        id: user.id,
                        email: user.email,
                        timestamp: new Date().toISOString()
                    });
                    return done(null, user);
                }
                
                console.warn('No user found for payload ID:', {
                    payloadId: jwt_payload.id,
                    timestamp: new Date().toISOString()
                });
                
                return done(null, false);
            } catch (err) {
                console.error("Error in passport strategy:", {
                    error: err.message,
                    stack: err.stack,
                    timestamp: new Date().toISOString()
                });
                return done(err, false);
            }
        })
    );
};