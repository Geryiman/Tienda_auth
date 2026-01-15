"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    /**
     * Maneja la solicitud de registro de nuevos usuarios.
     * Endpoint: POST /auth/register
     */
    static async register(req, res) {
        try {
            const { email, password, name } = req.body;
            // Validación básica de entrada
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            // Llamada a la capa de servicio
            const user = await auth_service_1.AuthService.registerUser(email, password, name);
            res.status(201).json({
                message: 'User registered successfully',
                data: user
            });
        }
        catch (error) {
            // Manejo de errores de negocio vs errores de servidor
            if (error.message === 'User already exists') {
                res.status(409).json({ error: 'User already exists' });
            }
            else {
                console.error('Error in register controller:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
    //     /**
    //      * Maneja la solicitud de login de usuarios.
    //      * Endpoint: POST /auth/login
    //      */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            const result = await auth_service_1.AuthService.login(email, password);
            res.status(200).json({
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            if (error.message === 'Invalid credentials') {
                res.status(401).json({ error: 'Invalid email or password' });
            }
            else {
                console.error('Login error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
    // Este método solo se ejecutará si el middleware lo permite
    static async profile(req, res) {
        // req.user contiene los datos que el middleware descifró del token
        res.json({
            message: 'You made it! This is a protected route.',
            user: req.user
        });
    }
}
exports.AuthController = AuthController;
