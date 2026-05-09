# 🎮 NexusRewards v2.0

> Premium Gaming Rewards Platform — Earn IQCoins, Redeem Real Rewards

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — add your DISCORD_CLIENT_SECRET

# 3. Run
npm start          # Production
npm run dev        # Development (auto-reload)
```

Open **http://localhost:3000**

---

## 🔐 Discord OAuth Setup

1. Go to https://discord.com/developers/applications
2. Click your app (Client ID: `1502195009779273758`)
3. **OAuth2 → General** → copy the **Client Secret**
4. Paste it as `DISCORD_CLIENT_SECRET` in `.env`
5. Add **Redirect URIs**:
   - `http://localhost:3000/auth/discord/callback` (local)
   - `https://your-railway-app.railway.app/auth/discord/callback` (deployed)

---

## 🚀 Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway new
railway add --plugin mongodb  # or use your Atlas URI
railway up
```

Set environment variables in Railway dashboard:
- `MONGODB_URI` → your Atlas URI
- `DISCORD_CLIENT_SECRET` → from Discord developer portal
- `DISCORD_CALLBACK_URL` → `https://your-app.railway.app/auth/discord/callback`
- `BASE_URL` → `https://your-app.railway.app`
- `SESSION_SECRET` → any long random string
- `NODE_ENV` → `production`

---

## 🌐 Deploy to Render

1. Push to GitHub
2. New Web Service → connect repo
3. Build: `npm install` | Start: `npm start`
4. Add all env vars in the dashboard

---

## 📁 File Structure

```
nexus-rewards/
├── server.js              # Express app entry point
├── .env                   # Your secrets (not committed)
├── models/
│   ├── Code.js            # Reward codes schema
│   ├── Invoice.js         # Invoice records schema
│   └── UserBalance.js     # User coins + Discord profile
├── routes/
│   ├── auth.js            # Discord OAuth2 (passport)
│   ├── redeem.js          # POST /api/redeem + GET check-code
│   ├── invoices.js        # GET /api/invoices/:userId
│   ├── balance.js         # GET coins + POST daily-claim
│   └── leaderboard.js     # GET leaderboard + stats
├── middleware/
│   ├── rateLimiter.js     # Express-rate-limit configs
│   └── validator.js       # Input validation
├── utils/
│   ├── sanitizer.js       # Code sanitization + format check
│   └── invoiceGenerator.js # WS-XXXXX-XXXX invoice IDs
└── public/
    ├── index.html         # Homepage
    ├── earn.html          # Earn IQCoins + daily claim
    ├── redeem.html        # Code redemption
    ├── coins.html         # Spend IQCoins on rewards
    ├── profile.html       # Order tracking + PDF invoices
    ├── leaderboard.html   # Top earners
    ├── style.css          # Complete UI styles
    └── script.js          # Shared frontend JS + auth
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/discord` | — | Start Discord OAuth login |
| GET | `/auth/discord/callback` | — | OAuth callback |
| GET | `/auth/logout` | — | Logout + clear session |
| GET | `/auth/me` | — | Current user info (JSON) |
| POST | `/api/redeem` | — | Redeem a code (atomic) |
| GET | `/api/check-code/:code` | — | Preview code (no redeem) |
| GET | `/api/invoices/:userId` | — | User's order history |
| GET | `/api/invoices/find/:invoiceNumber` | — | Find specific invoice |
| GET | `/api/available-coins/:userId` | — | IQCoin balance |
| POST | `/api/daily-claim/:userId` | — | Claim 1000 daily coins |
| GET | `/api/leaderboard` | — | Top 10 in all categories |
| GET | `/api/stats` | — | Homepage live stats |
| GET | `/api/health` | — | Server health check |

---

## ⚙️ Rate Limits

| Endpoint | Limit |
|----------|-------|
| Redeem | 5 per IP per 15 min |
| Check code | 30 per IP per min |
| General API | 60 per IP per min |
| Daily claim | 1 per user per 24h |

---

## 📦 Code Format

```
XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
```
5 groups × 5 alphanumeric characters. Auto-formatted in the UI.

## 🧾 Invoice Format

```
WS-{base36-timestamp}-{random4}
Example: WS-LQK3X9M2-7H4P
```

---

*© 2025 NexusRewards — All orders remain in Processing status until manually fulfilled.*
