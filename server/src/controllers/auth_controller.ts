// Strict naming: auth_controller.ts
import { Request, Response } from 'express';

export const F_Login_User = (p_req: Request, p_res: Response) => {
    const { username, password } = p_req.body;
    // logic here
    p_res.json({ message: `User ${username} logged in` });
};
