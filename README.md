# Kabak AI

Kabak-AI is an AI-powered web application that automates clothing product photography by generating high-quality, studio-grade images from simple inputs. It helps e-commerce teams streamline content creation, maintain visual consistency, and significantly reduce production costs.

## Full-Stack Project Structure

This project follows a strict architectural pattern to ensure scalability, maintainability, and no code duplication.

## Repository Structure

- **`/client`**: The Frontend application (React + Vite). Follows **Atomic Design**.
- **`/server`**: The Backend application (Node.js). Follows **Controller-Service-Model**.
- **`/shared`**: Code shared between client and server (Types, Constants, Utils). **Single Source of Truth.**

## Key Principles

1.  **No Code Duplication**: Any logic or type used by both ends is in `/shared`.
2.  **Clean Root**: The root directory is minimal.
3.  **Separation of Concerns**: Design (UI) is separated from Business Logic.
