const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API Integration Tests', () => {
  // Reset the in-memory database before each test
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks', () => {
    test('should return an empty list initially', async () => {
      const res = await request(app).get('/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('should return all created tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const res = await request(app).get('/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Task 1');
    });
  });

  describe('POST /tasks', () => {
    test('should create a task successfully with valid data', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'New API Task', priority: 'high' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('New API Task');
      expect(res.body.priority).toBe('high');
    });

    test('should return 400 if title is missing (validation check)', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ description: 'Missing title' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('should delete an existing task', async () => {
      const task = taskService.create({ title: 'Delete me via API' });

      const res = await request(app).delete(`/tasks/${task.id}`);
      expect(res.statusCode).toBe(204);

      // Verify it's gone
      expect(taskService.getAll().length).toBe(0);
    });

    test('should return 404 for non-existent task ID', async () => {
      const res = await request(app).delete('/tasks/non-existent-id');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /tasks/stats', () => {
    test('should return correct task stats', async () => {
      taskService.create({ title: 'Task 1', status: 'todo' });
      taskService.create({ title: 'Task 2', status: 'done' });

      const res = await request(app).get('/tasks/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body.todo).toBe(1);
      expect(res.body.done).toBe(1);
      expect(res.body.in_progress).toBe(0);
    });
  });
});