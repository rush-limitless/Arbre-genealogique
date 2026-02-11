// Backend Tests - Jest
import request from 'supertest';
import app from '../src/index';

describe('API Tests', () => {
  describe('Health Check', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Persons API', () => {
    let createdPersonId: string;

    it('should get all persons', async () => {
      const res = await request(app).get('/api/persons');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('persons');
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should create a person', async () => {
      const newPerson = {
        firstName: 'Test',
        lastName: 'Jest',
        gender: 'male',
        birthDate: '1990-01-01',
        birthPlace: 'Paris'
      };

      const res = await request(app)
        .post('/api/persons')
        .send(newPerson);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Test');
      createdPersonId = res.body.data.id;
    });

    it('should get person by id', async () => {
      if (!createdPersonId) return;

      const res = await request(app).get(`/api/persons/${createdPersonId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdPersonId);
    });

    it('should update a person', async () => {
      if (!createdPersonId) return;

      const res = await request(app)
        .put(`/api/persons/${createdPersonId}`)
        .send({ profession: 'Developer' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should delete a person', async () => {
      if (!createdPersonId) return;

      const res = await request(app).delete(`/api/persons/${createdPersonId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/persons')
        .send({ firstName: 'Test' }); // Missing required fields

      expect(res.status).toBe(400);
    });
  });
});
