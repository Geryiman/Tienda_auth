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

//     /**
//      * Maneja la solicitud de login de usuarios.
//      * Endpoint: POST /auth/login
//      */

static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            const result = await AuthService.login(email, password);

            res.status(200).json({
                message: 'Login successful',
                data: result
            });

        } catch (error: any) {
            if (error.message === 'Invalid credentials') {
                res.status(401).json({ error: 'Invalid email or password' });
            } else {
                console.error('Login error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
        
    }

// Este método solo se ejecutará si el middleware lo permite
    static async profile(req: any, res: Response) {
        // req.user contiene los datos que el middleware descifró del token
        res.json({
            message: 'You made it! This is a protected route.',
            user: req.user
        });
    }

    static async adminOnly(req: any, res: Response) {
        res.json({
            message: 'Welcome Boss! You are seeing admin-only data.',
            secretData: 'Ganancias del día: $1,000,000 USD 💰'
        });
    }

}