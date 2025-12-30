//tests/auth
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../server');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');

describe('Auth API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/school-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Teacher.deleteMany();
    await Student.deleteMany();
    await Parent.deleteMany();
  });

  describe('POST /api/auth/login', () => {
    it('should login teacher with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Teacher.create({
        id: 'teacher1',
        username: 'teacher1',
        password: hashedPassword,
        name: 'John',
        surname: 'Doe',
        email: 'john@school.com',
        phone: '+998901234567',
        address: 'Address',
        bloodType: 'A+',
        birthday: new Date('1990-01-01'),
        sex: 'MALE'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'teacher1',
          password: 'password123',
          role: 'teacher'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'teacher1');
    });

    it('should not login with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Teacher.create({
        id: 'teacher2',
        username: 'teacher2',
        password: hashedPassword,
        name: 'Jane',
        surname: 'Smith',
        email: 'jane@school.com',
        phone: '+998901234568',
        address: 'Address',
        bloodType: 'B+',
        birthday: new Date('1990-01-01'),
        sex: 'FEMALE'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'teacher2',
          password: 'wrongpassword',
          role: 'teacher'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
          role: 'teacher'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new teacher', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          id: 'newteacher1',
          username: 'newteacher1',
          password: 'password123',
          name: 'New',
          surname: 'Teacher',
          email: 'new@school.com',
          phone: '+998901234569',
          address: 'Address',
          bloodType: 'A+',
          birthday: '1990-01-01',
          sex: 'MALE',
          role: 'teacher'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should not register with duplicate username', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Teacher.create({
        id: 'existing1',
        username: 'existing1',
        password: hashedPassword,
        name: 'Existing',
        surname: 'Teacher',
        email: 'existing@school.com',
        phone: '+998901234570',
        address: 'Address',
        bloodType: 'A+',
        birthday: new Date('1990-01-01'),
        sex: 'MALE'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          id: 'newteacher2',
          username: 'existing1',
          password: 'password123',
          name: 'New',
          surname: 'Teacher',
          email: 'new2@school.com',
          phone: '+998901234571',
          address: 'Address',
          bloodType: 'A+',
          birthday: '1990-01-01',
          sex: 'MALE',
          role: 'teacher'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Teacher.create({
        id: 'teacher3',
        username: 'teacher3',
        password: hashedPassword,
        name: 'Test',
        surname: 'User',
        email: 'test@school.com',
        phone: '+998901234572',
        address: 'Address',
        bloodType: 'A+',
        birthday: new Date('1990-01-01'),
        sex: 'MALE'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'teacher3',
          password: 'password123',
          role: 'teacher'
        });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.user).toHaveProperty('username', 'teacher3');
    });

    it('should not get user without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});