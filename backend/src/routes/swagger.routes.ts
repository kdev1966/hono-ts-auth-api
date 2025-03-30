// src/routes/swagger.routes.ts
import { Hono } from "hono";
import swaggerDocument from "../swagger.json" assert { type: "json" };

const swaggerRoutes = new Hono();

// Route pour renvoyer le document OpenAPI
swaggerRoutes.get("/swagger.json", (c) => c.json(swaggerDocument));

// Route pour servir l’interface Swagger UI
const swaggerHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      const ui = SwaggerUIBundle({
        url: '/swagger/swagger.json',
        dom_id: '#swagger-ui',
      });
    </script>
  </body>
</html>`;

swaggerRoutes.get("/docs", (c) => c.html(swaggerHtml));

export default swaggerRoutes;
