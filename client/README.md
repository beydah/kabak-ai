# Client Architecture

This frontend is built with **React**, **Vite**, and **Tailwind CSS**. It follows the **Atomic Design** method strictly.

## Directory Structure

### `src/components` (Atomic Design)
- **`atoms/`**: The smallest building blocks. Examples: `Button`, `Input`, `Icon`. These components have no business logic and are purely presentational.
- **`molecules/`**: Groups of atoms working together. Examples: `SearchBox` (Input + Button), `FormField` (Label + Input).
- **`organisms/`**: Complex sections that form distinct parts of an interface. Examples: `Header`, `ProductCard`, `Footer`. They can handle some local state.
- **`templates/`**: Page layouts that define the structure but don't hold data. Examples: `DashboardTemplate`, `AuthTemplate`.

### Other Directories
- **`pages/`**: The "Pages" layer. These connect data (from services/store) to Templates.
- **`layouts/`**: high-level wrappers like `MainLayout` (which might include a specific Header and Footer).
- **`services/`**: API calls and external services. **UI components must NEVER make API calls directly.**
- **`store/`**: Global state management (e.g., Zustand, Redux context).
- **`routes/`**: Routing configuration (React Router).
- **`types/`**: Client-specific TypeScript interfaces.
