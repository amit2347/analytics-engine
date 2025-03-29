const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation for Authentication and Analytics",
    },
    servers: [
      {
        url: "http://localhost:1055",
      },
    ],
    components: {
      securitySchemes: {
        AuthToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Use this token for /auth endpoints",
        },
        AnalyticsToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Use this token for /analytics endpoints",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Make sure this path is correct
};

// Generate Swagger docs
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
