const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

let mongoServer;
let server;

describe('Stock Controller Tests', () => {
  let token;
  let testUser;

  beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });

    // Create a test token with the real user ID
    token = jwt.sign(
      { 
        id: testUser._id,
        name: testUser.name,
        email: testUser.email
      },
      config.secretOrKey,
      { expiresIn: '1h' }
    );

    // Start the server
    server = app.listen(0); // Let the OS assign a random port
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await server.close();
  });

  describe('GET /api/stocks/price/:symbol', () => {
    it('should return stock price data for valid symbol', async () => {
      const res = await request(app)
        .get('/api/stocks/price/AAPL')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'AAPL');
      expect(res.body).toHaveProperty('currentPrice');
      expect(res.body).toHaveProperty('openPrice');
      expect(res.body).toHaveProperty('high');
      expect(res.body).toHaveProperty('low');
      expect(res.body).toHaveProperty('volume');
    });

    it('should return 404 for invalid symbol', async () => {
      const res = await request(app)
        .get('/api/stocks/price/INVALID')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .get('/api/stocks/price/AAPL');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/stocks/history/:symbol', () => {
    it('should return historical price data', async () => {
      const res = await request(app)
        .get('/api/stocks/history/AAPL')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('date');
      expect(res.body[0]).toHaveProperty('price');
    });
  });

  describe('GET /api/stocks/news/:symbol', () => {
    it('should return news and company info', async () => {
      const res = await request(app)
        .get('/api/stocks/news/AAPL')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Check for company overview
      const overview = res.body.find(item => item.type === 'overview');
      expect(overview).toBeDefined();
      expect(overview).toHaveProperty('title');
      expect(overview).toHaveProperty('summary');

      // Check for news articles
      const news = res.body.filter(item => item.type === 'news');
      expect(news.length).toBeGreaterThan(0);
      expect(news[0]).toHaveProperty('title');
      expect(news[0]).toHaveProperty('url');
    });
  });
});
