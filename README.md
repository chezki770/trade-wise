# Trade-Wise 📈

> A modern stock trading simulation platform for risk-free practice with real market data.

## Quick Start 🚀

```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev
```

## Core Features 💡

- Real-time trading simulation
- Portfolio tracking & analysis
- Live market news feed
- Admin dashboard & analytics
- Educational resources

## Tech Stack 🛠️

- **Frontend:** React, Redux, Material-UI
- **Backend:** Node.js, Express, MongoDB
- **APIs:** Alpha Vantage (market data)

## Setup ⚙️

1. Clone repo
2. Create `.env` file:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
ALPHAVANTAGE_API_KEY=your_key
```
3. Run `npm run install-all`
4. Start with `npm run dev`

## API Routes 🔌

```
POST /api/users/register    # Register user
POST /api/users/login      # Login user
GET  /api/stocks/search    # Search stocks
POST /api/users/buyStock   # Buy stocks
POST /api/users/sellStock  # Sell stocks
```

## Testing 🧪

```bash
cd server && npm test
```

## License 📝

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Alpha Vantage API for providing stock market data
- All contributors who have helped to build and improve Trade-Wise
