const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server'); // We'll need to modify server.js to export the app
const User = require('../../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication Routes', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123',
    password2: 'password123'
  };

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should fail registration with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/users/register')
        .send(testUser);

      // Second registration with same email
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.email).toBe('Email already exists');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app)
        .post('/api/users/register')
        .send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.passwordincorrect).toBe('Password incorrect');
    });
  });

  describe('Protected Routes', () => {
    let token;

    beforeEach(async () => {
      // Register and login to get token
      await request(app)
        .post('/api/users/register')
        .send(testUser);

      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      token = loginRes.body.token;
    });

    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/users/current')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(testUser.email);
    });

    it('should fail accessing protected route without token', async () => {
      const res = await request(app)
        .get('/api/users/current');

      expect(res.status).toBe(401);
    });
  });
});