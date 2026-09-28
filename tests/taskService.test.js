const taskService = require('../src/services/taskService')

describe('Task Service Unit Tests', () => {
  // Reset the in-memory store before each test to ensure test isolation
  beforeEach(() => {
    taskService._reset();
  });

  test('create() should create a task with default values and a unique ID', () => {
    const taskData = { title: 'Test Task' };
    const task = taskService.create(taskData);

    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.dueDate).toBeNull();
    expect(task.completedAt).toBeNull();
    expect(task).toHaveProperty('createdAt');
  });

  test('getAll() should return all created tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });

    const tasks = taskService.getAll();
    expect(tasks.length).toBe(2);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[1].title).toBe('Task 2');
  });

  test('findById() should return the correct task or undefined', () => {
    const created = taskService.create({ title: 'Find Me' });
    
    const found = taskService.findById(created.id);
    expect(found).toBeDefined();
    expect(found.title).toBe('Find Me');

    const notFound = taskService.findById('non-existent-id');
    expect(notFound).toBeUndefined();
  });

  test('getByStatus() should filter tasks by status', () => {
    taskService.create({ title: 'Task 1', status: 'todo' });
    taskService.create({ title: 'Task 2', status: 'in_progress' });
    taskService.create({ title: 'Task 3', status: 'done' });

    const todoTasks = taskService.getByStatus('todo');
    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0].title).toBe('Task 1');
  });

  test('getPaginated() should return the correct slice of tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });
    taskService.create({ title: 'Task 3' });

    // Note: Testing the current pagination logic behavior
    const page1 = taskService.getPaginated(1, 2);
    expect(page1.length).toBe(2);
    expect(page1[0].title).toBe('Task 1');
  });

  test('update() should update task fields and return the updated task', () => {
    const created = taskService.create({ title: 'Original Title' });
    
    const updated = taskService.update(created.id, { title: 'Updated Title', priority: 'high' });
    expect(updated.title).toBe('Updated Title');
    expect(updated.priority).toBe('high');

    const failedUpdate = taskService.update('fake-id', { title: 'Nope' });
    expect(failedUpdate).toBeNull();
  });

  test('remove() should delete a task by ID', () => {
    const created = taskService.create({ title: 'Delete Me' });
    
    const deleted = taskService.remove(created.id);
    expect(deleted).toBe(true);
    expect(taskService.getAll().length).toBe(0);

    const deleteAgain = taskService.remove('fake-id');
    expect(deleteAgain).toBe(false);
  });

  test('completeTask() should mark a task as done and set completedAt', () => {
    const created = taskService.create({ title: 'Complete Me', status: 'todo' });
    
    const completed = taskService.completeTask(created.id);
    expect(completed.status).toBe('done');
    expect(completed.completedAt).not.toBeNull();

    const failedComplete = taskService.completeTask('fake-id');
    expect(failedComplete).toBeNull();
  });

  test('getStats() should calculate counts and overdue tasks correctly', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
    
    taskService.create({ title: 'Todo 1', status: 'todo' });
    taskService.create({ title: 'Overdue Todo', status: 'todo', dueDate: pastDate });
    taskService.create({ title: 'Done 1', status: 'done', dueDate: pastDate }); // Done tasks shouldn't count as overdue

    const stats = taskService.getStats();
    expect(stats.todo).toBe(2);
    expect(stats.in_progress).toBe(0);
    expect(stats.done).toBe(1);
    expect(stats.overdue).toBe(1); // Only the incomplete task with past due date
  });
});