// server/__tests__/auth.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server'); 
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    password2: 'password123'
  };

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/users/register')
        .send(testUser);

      // Second registration with same email
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.email).toBe('Email already exists');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/users/register')
        .send(testUser);
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.passwordincorrect).toBe('Password incorrect');
    });
  });

  describe('Protected Routes', () => {
    let token;

    beforeEach(async () => {
      // Register and login to get token
      const registerRes = await request(app)
        .post('/api/users/register')
        .send(testUser);
      token = registerRes.body.token.replace('Bearer ', '');
    });

    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/users/current')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(testUser.email);
    });

    it('should not access protected route without token', async () => {
      const res = await request(app)
        .get('/api/users/current');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Admin Routes', () => {
    let adminToken;
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      password2: 'admin123',
      isAdmin: true
    };

    beforeEach(async () => {
      // Register admin user
      const adminRes = await request(app)
        .post('/api/users/register')
        .send(adminUser);
      adminToken = adminRes.body.token.replace('Bearer ', '');
    });

    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/users/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should not allow non-admin to access admin routes', async () => {
      // Register regular user and get token
      const userRes = await request(app)
        .post('/api/users/register')
        .send(testUser);
      const userToken = userRes.body.token.replace('Bearer ', '');

      const res = await request(app)
        .get('/api/users/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});