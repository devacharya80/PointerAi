import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../../lib/prisma.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Get email from Google
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account does not have an email"));
        }

        // 2. Check if user already exists
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        // 3. Existing user
        if (user) {
          // Link Google account if not already linked
          if (!user.oauthProvider || !user.oauthId) {
            const updatedUser = await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                oauthProvider: "GOOGLE",
                oauthId: profile.id,
              },
            });

            return done(null, updatedUser);
          }

          return done(null, user);
        }

        // 4. New user
        const newUser = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              firstName: profile.name?.givenName ?? "",
              lastName: profile.name?.familyName ?? "",
              oauthProvider: "GOOGLE",
              oauthId: profile.id,
              password: null,
            },
          });

          // 5. Create empty profile
          await tx.profile.create({
            data: {
              userId: newUser.id,
              learningGoals: [],
            },
          });

          return newUser;
        });

        // 6. Tell Passport authentication succeeded
        return done(null, newUser);

      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;