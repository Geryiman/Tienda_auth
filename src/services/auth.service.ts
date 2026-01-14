import bcrypt from 'bcrypt';
import prisma from '../config/prisma'; // Asegúrate de que esta ruta apunte a tu instancia de Prisma
import { User } from '@prisma/client';

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
                // name: name || null, // Descomentar si agregaste el campo name al modelo
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
}