const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mellifera App API',
      version: '1.0.0',
      description: 'API documentation for the Mellifera beekeeping application',
    },
    servers: [
      {
        url: 'http://localhost:5050',
        description: 'Development server',
      },
    ],
  },
  apis: ['./server/routes/*.js'], // Path to the API routes files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
