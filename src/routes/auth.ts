import express = require("express");
import User from "../db/models/user.models";
import bcrypt = require("bcrypt");
import passport = require("passport");
import passportlocal = require("passport-local");

const LocalStrategy = passportlocal.Strategy;
const router = express.Router();

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return cb(null, false, { message: "Incorrect username or password" });
      }
      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) {
        return cb(null, false, { message: "Incorrect username or password" });
      }
      return cb(null, {
        uid: String(user._id),
        username: user.username,
      });
    } catch (error) {
      return cb(error);
    }
  })
);

passport.serializeUser((user, cb) => {
  console.log("serializeUser", user);
  cb(null, user.uid);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, { uid: String(user._id), username: user.username });
  } catch (error) {
    done(error);
  }
});

router.post("/login", (req, res, next) => {
  if (req.body.remember) {
    // cookies 有效期7天
    req.session.cookie.maxAge = 7 * 24 * 3600 * 1000;
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        message: "Login successful",
        uid: user.uid,
        username: user.username,
      });
    });
  })(req, res, next);
});

router.post("/logout", async (req, res) => {
  req.logout();
  return res.send({ message: "Logout successful" });
});

export = router;
