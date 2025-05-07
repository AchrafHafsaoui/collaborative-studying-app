import bcrypt from "bcryptjs";
import User from "../models/user.js";
import passport from "passport";
import passport_local from "passport-local";
const LocalStrategy  = passport_local.Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Local Strategy
passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        // Match User
        User.findOne({ email: email })
            .then(user => {
                // Create new User
                if (!user) {
                    return done(null, false, { message: "User not found" });
                    // const newUser = new User({ email, password });
                    // // Hash password before saving in database
                    // bcrypt.genSalt(10, (err, salt) => {
                    //     bcrypt.hash(newUser.password, salt, (err, hash) => {
                    //         if (err) throw err;
                    //         newUser.password = hash;
                    //         newUser
                    //             .save()
                    //             .then(user => {
                    //                 return done(null, user);
                    //             })
                    //             .catch(err => {
                    //                 return done(null, false, { message: err });
                    //             });
                    //     });
                    // });
                    // Return other user
                } else {
                    // Match password
                    console.log(password);
                    console.log(user.password);
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err)  console.log(err);

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Wrong password" });
                        }
                    });
                }
            })
            .catch(err => {
                return done(null, false, { message: err });
            });
    })
);

export default passport;