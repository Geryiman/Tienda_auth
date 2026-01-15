import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { User } from '@prisma/client';
import jwt, {SignOptions} from 'jsonwebtoken';

const secret: jwt.Secret = process.env.JWT_SECRET!;

export class AuthService {
    
    /**
     * Registra un nuevo usuario en la base de datos.
     * Realiza validación de existencia previa y hasheo de contraseña.
     * @param email Email del usuario
     * @param password Contraseña en texto plano
     * @param name Nombre opcional
     * @returns Objeto de usuario creado (sin contraseña)
     */
    static async registerUser(email: string, password: string, name?: string) {
        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Generar hash de contraseña
        // Cost factor: 10 (Estándar de industria balanceado entre seguridad/rendimiento)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Crear usuario con rol por defecto (CLIENT)
        // Se asume que la base de datos tiene configurado el default para role
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                userRoles: {
                    create: {
                        role: {
                            connect: { name: 'client' }
                        }
                    }
                }
            },
            // Seleccionamos campos específicos para no retornar el hash de la contraseña
            select: {
                id: true,
                email: true,
                isActive: true,
                createdAt: true
            }
        });

        return newUser;
    }

 /**
     * Autentica un usuario y genera un token JWT.
     * @param email Correo del usuario
     * @param password Contraseña plana
     * @returns Objeto con token y datos del usuario
     */
    static async login(email: string, password: string) {
        // 1. Buscar usuario
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: { role: true } // Traemos los roles para meterlos al token
                }
            }
        });

        if (!user || !user.isActive) {
            // Por seguridad, no decimos si el email existe o no, mensaje genérico.
            throw new Error('Invalid credentials');
        }

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // 3. Generar JWT (Payload)
        // Guardamos ID y Roles en el token para usarlos en el frontend/middleware
     const tokenPayload = {
            userId: user.id,
            email: user.email,
            roles: user.userRoles.map(ur => ur.role.name)
        };

        const secret = process.env.JWT_SECRET || 'secret_default';
const signOptions: SignOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 3600) as number | undefined
        };

const token = jwt.sign(tokenPayload, secret, signOptions);
        // 4. (Opcional pero recomendado para seguridad Nivel 10)
        // Aquí deberíamos guardar el hash del token en la tabla RefreshToken
        // Lo omitiremos por un momento para probar lo básico primero.

        return {
            user: {
                id: user.id,
                email: user.email,
                roles: tokenPayload.roles
            },
            token
        };
    }
}