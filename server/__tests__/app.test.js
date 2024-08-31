jest.mock('@tensorflow/tfjs-node', () => ({
  // Add any mock implementations if needed
}));

const request = require('supertest');
const app = require('../index');

describe('Server', () => {
  it('should respond to the GET method', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  // Add more tests for your API endpoints here
});
