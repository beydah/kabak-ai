// Example of a SHARED Type.
// Used by both Client (frontend) and Server (backend) to ensure data consistency.

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
}
