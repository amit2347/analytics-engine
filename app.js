const { connectToDB, AppDataSource } = require("./config/db");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const authRoutes = require("./routes/auth.route");
const analyticsRoutes = require("./routes/analytics.route");
const User = require("./entities/User");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:1055/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userRepository = await AppDataSource.getRepository(User);
        const userExistence = await userRepository.findOne({
          where: {
            email: profile.emails[0].value,
          },
        });
        if (!userExistence) {
          const user = userRepository.create({
            email: profile.emails[0].value,
            name: profile.displayName,
            googleId: profile.id,
          });
          const userDetails = await userRepository.save(user);
          return done(null, userDetails.id);
        }

        return done(null, userExistence.id);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((id, done) => {
  done(null, id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      return done(new Error("User not found"), null);
    }

    done(null, user); // Attach full user object to req.user
  } catch (error) {
    done(error, null);
  }
});
const startApp = async () => {
  try {
    await connectToDB();
    await require("./config/redis");
    // Redirect user to Google for authentication
    app.use("/auth", authRoutes);
    app.use("/analytics", analyticsRoutes);
    app.get("/", (req, res) => {
      res.send(`<a href="/auth/google">Login with google</a>`);
    });
    app.listen(1055, () => {
      console.log("listening");
    });
    require("./jobs/logQueue");
    require("./jobs/logWorker");
  } catch (error) {
    console.error("Error initializing connections:", error);
  }
};
startApp();
