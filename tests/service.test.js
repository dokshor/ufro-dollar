const request = require('supertest')
const app = require('../index')
describe('Dollar endpoint', () => {
  it('should respond 200', async () => {
    const res = await request(app)
      .get('/dollar');
    expect(res.statusCode).toEqual(200);
  });

  it('should respond msg SUCCESS', async () => {
    const res = await request(app)
      .get('/dollar');
      expect(res.body.msg).toBe('SUCCESS');
  })

  it('should respond dollar sell more than 0', async () => {
    const res = await request(app)
      .get('/dollar');
      expect(res.body.data.dollar.sell).toBeGreaterThan(0);
  })
  

  it('should respond msg SUCCESS for a certain day', async () => {
    const res = await request(app)
      .get('/dollar/2020-01-01');
      expect(res.body.msg).toBe('Dollar not found');
  })

  it('should respond dollar sell more than 0 for a certain day', async () => {
    const res = await request(app)
      .get('/dollar/2020-01-20');
      expect(res.body.data.dollar.sell).toBeGreaterThan(0);
  })
})
