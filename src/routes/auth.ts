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
      const user = await User.findOne({ username }).exec();
      if (!user) {
        return cb(null, false, { message: "Incorrect username or password" });
      }
      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) {
        return cb(null, false, { message: "Incorrect username or password" });
      }
      return cb(null, {
        id: String(user._id),
        username: user.username,
      });
    } catch (error) {
      return cb(error);
    }
  })
);

passport.serializeUser((user, cb) => {
  console.log("serializeUser", user);
  cb(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    if (!user) {
      return done(null, false);
    }
    done(null, { id: String(user._id), username: user.username });
  } catch (error) {
    done(error);
  }
});

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.send({
      auth: true,
      id: req.user.id,
      username: req.user.username,
    });
  }
  return res.send({ auth: false });
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
      return res.status(401).json({ error: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        message: "Login successful",
        uid: user.id,
        username: user.username,
      });
    });
  })(req, res, next);
});

// (req, res, next) => {
//   req.session.save((err) => {
//     if (err) {
//       return next(err);
//     }

//     res.send({
//       message: "Login successful",
//       user: req.user,
//     });
//   });
// }
// );

router.post("/logout", async (req, res, next) => {
  req.logout();
  req.session.save((err) => {
    if (err) {
      return next(err);
    }
    res.send({ message: "Logout successful" });
  });
});

// async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(422).json({
//       message: "username, password are required",
//     });
//   }
//   try {
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(422).json({
//         message: "username or password is incorrect",
//       });
//     }
//     if (!bcrypt.compareSync(password, user.password)) {
//       return res.status(422).json({
//         message: "username or password is incorrect",
//       });
//     }
//     req.session.userId = String(user._id);
//     res.send({
//       user,
//       message: "login success",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// }
// );

export = router;
