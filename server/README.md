# Server Architecture

This backend is built with **Node.js**. It follows a strict separation of concerns (Controller-Service-Model).

## Directory Structure

- **`config/`**: Configuration files (Environment variables loader, DB connection setup).
- **`controllers/`**: Handles incoming HTTP requests. validates inputs, calls the appropriate Service, and sends the response. **No business logic here.**
- **`services/`**: logic layer. Contains all business rules and interacts with Models.
- **`models/`**: Database schemas and data models.
- **`middlewares/`**: Express middlewares for auth, logging, error handling.
- **`routes/`**: Definitions of API endpoints.
- **`utils/`**: Helper functions specific to the backend.
