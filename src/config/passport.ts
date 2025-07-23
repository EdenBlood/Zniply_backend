import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from "passport-google-oauth20";
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from "passport-github2";
import User, { IUser, Provider } from "../models/User";
import { Types } from "mongoose";

passport.serializeUser((user: IUser, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: Types.ObjectId, done) => {
  try {
    const user = await User.findById(id).select("_id name email");
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// ── Google ──
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/api/oauth/google/callback`,
    },
    async (_, __, profile: GoogleProfile, done) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) return done(new Error("Google no devolvió email"), null);

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            provider: Provider.GOOGLE,
            confirmed: true,
            password: "",
          });
        }
        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

// ── GitHub ──
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/api/oauth/github/callback`,
    },
    async (_, __, profile: GitHubProfile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error("GitHub no devolvió email"), null);

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email,
            provider: Provider.GITHUB,
            confirmed: true,
            password: "",
          });
        }
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

export default passport;
