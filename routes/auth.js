const express = require('express');
const router = express.Router();
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const UserBalance = require('../models/UserBalance');

// Configure Discord Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('[AUTH] Discord login:', profile.username, profile.id);

    // Upsert user in MongoDB
    const user = await UserBalance.findOneAndUpdate(
      { discordId: profile.id },
      {
        $set: {
          userId: profile.id,
          discordId: profile.id,
          discordUsername: profile.username,
          discordAvatar: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.discriminator || 0) % 5}.png`,
          discordEmail: profile.email || null,
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return done(null, user);
  } catch (err) {
    console.error('[AUTH] Discord strategy error:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.discordId || user.userId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserBalance.findOne({ $or: [{ discordId: id }, { userId: id }] }).lean();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GET /auth/discord
router.get('/discord', passport.authenticate('discord'));

// GET /auth/discord/callback
router.get('/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/?auth=failed',
    successRedirect: '/?auth=success'
  })
);

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error('[AUTH] Logout error:', err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

// GET /auth/me — returns current user info
router.get('/me', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.json({ loggedIn: false });
  }
  const u = req.user;
  res.json({
    loggedIn: true,
    userId: u.discordId || u.userId,
    username: u.discordUsername || u.userId,
    avatar: u.discordAvatar || null,
    balance: u.balance || 0
  });
});

module.exports = router;
