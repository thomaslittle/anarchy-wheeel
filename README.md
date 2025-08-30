# 🎯 Twitch Wheel Giveaway

A professional giveaway tool for Twitch streamers built with Next.js, featuring spinning wheel animations, confetti celebrations, weighted probabilities, and real-time chat integration.

## ✨ Features

- 🎪 Interactive spinning wheel with customizable colors
- 🎊 Confetti animations when winners are chosen
- ⚖️ Weighted probability system (0.1x - 10x multipliers)
- 💬 Real-time Twitch chat integration
- 🎛️ Configurable spin duration (2-10 seconds)
- 👑 Moderator commands (!spin, !weight, !addentry, !removewinner)
- 🎨 Dark/light theme support
- 🔊 Sound effects toggle
- 📱 Responsive design

## 🚀 Getting Started

### Prerequisites

1. Create a Twitch application at [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
2. Note your **Client ID** for the environment setup

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Twitch application details:
```bash
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id_here
NEXT_PUBLIC_TWITCH_REDIRECT_URI=http://localhost:3000  # Update for production
```

### Development

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎮 Usage

### Chat Commands (Moderators/Broadcaster Only)

- `!spin` - Spin the wheel
- `!weight username 2.5` - Set a user's win probability (0.1x - 10x)
- `!addentry username` - Manually add a participant
- `!removewinner` - Remove the last winner from the wheel

### Entry System

Users can enter the giveaway by typing the configured keyword (default: `!enter`) in your Twitch chat.

### Settings

Access settings by clicking the gear icon to:
- Customize wheel colors
- Set spin duration
- Adjust participant weights
- Preview winner celebration text

## 🔧 Environment Variables

The application uses the following environment variables:

### Development (.env.local)
```bash
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id
NEXT_PUBLIC_TWITCH_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_TWITCH_API_URL=https://api.twitch.tv/helix
NEXT_PUBLIC_TWITCH_AUTH_URL=https://id.twitch.tv/oauth2/authorize
NEXT_PUBLIC_TWITCH_WEBSOCKET_URL=wss://irc-ws.chat.twitch.tv:443
```

### Production (.env.production)
```bash
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id
NEXT_PUBLIC_TWITCH_REDIRECT_URI=https://your-domain.com
# ... other variables remain the same
```

## 📦 Building for Production

```bash
npm run build
npm run start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
