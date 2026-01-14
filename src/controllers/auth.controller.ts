import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {

    /**
     * Maneja la solicitud de registro de nuevos usuarios.
     * Endpoint: POST /auth/register
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name } = req.body;

            // Validación básica de entrada
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            // Llamada a la capa de servicio
            const user = await AuthService.registerUser(email, password, name);

            res.status(201).json({
                message: 'User registered successfully',
                data: user
            });

        } catch (error: any) {
            // Manejo de errores de negocio vs errores de servidor
            if (error.message === 'User already exists') {
                res.status(409).json({ error: 'User already exists' });
            } else {
                console.error('Error in register controller:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
}