# Shared Module

This folder contains code shared strictly between the Client and Server.
To prevent code duplication, any logic, constant, or type used by both ends MUST live here.

## Contents

- **`types/`**: TypeScript interfaces (DTOs, User objects, etc.).
- **`constants/`**: Error codes, shared configuration values, enums.
- **`utils/`**: Pure functions (e.g., date formatting, validation regex) that work in both Node.js and Browser environments.
