import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/prisma';

export class AuthService {
    
    // REGISTRO
    static async registerUser(email: string, password: string, name?: string) {
        // 1. Validar si existe (IGUAL QUE ANTES)
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        // 2. Hashear password (IGUAL QUE ANTES)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Crear Usuario (CAMBIO OBLIGATORIO POR NUEVA BD)
        // Antes: Guardábamos "role: 'client'" directo en el usuario.
        // Ahora: Usamos una transacción para crear el usuario Y conectarlo con el Rol en la tabla intermedia.
        
        const newUser = await prisma.$transaction(async (tx) => {
            // A. Buscamos el ID del rol 'client' en la tabla de Roles
            const clientRole = await tx.role.findUnique({ where: { name: 'client' } });
            
            if (!clientRole) {
                // Si esto pasa es porque no corriste el SEED
                throw new Error('Internal Error: Role "client" not found. Run seed.');
            }

            // B. Creamos el usuario (Sin el campo 'role', porque ya no existe)
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash, // Usamos tu nuevo nombre de campo en BD
                    isActive: true,
                    isVerified: false
                }
            });

            // C. Creamos la conexión en la tabla intermedia UserRole
            await tx.userRole.create({
                data: {
                    userId: user.id,
                    roleId: clientRole.id
                }
            });

            return user;
        });

        return {
            id: newUser.id,
            email: newUser.email,
            createdAt: newUser.createdAt
        };
    }

    // LOGIN
    static async login(email: string, password: string) {
        // 1. Buscar usuario (CAMBIO: Ahora debemos pedir que incluya la relación de roles)
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: { role: true } // Traemos el nombre del rol (ej: 'admin', 'seller')
                }
            }
        });

        // 2. Validación Anti-Hackers (IGUAL QUE ANTES - Lógica segura)
        if (!user || !user.isActive) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // 3. Preparar los roles para el Token (CAMBIO: Mapear desde la relación)
        // Antes: const roles = [user.role]
        // Ahora: Recorremos la lista de userRoles
        const roles = user.userRoles.map(ur => ur.role.name);

        // 4. Generar Token (IGUAL QUE ANTES - Tu corrección de tipos)
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            roles: roles // ['client'] o ['admin', 'seller']
        };

        const secret = process.env.JWT_SECRET || 'secret_default';
        
        const signOptions: SignOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 3600) as number | undefined
        };

        const token = jwt.sign(tokenPayload, secret, signOptions);

        return {
            user: {
                id: user.id,
                email: user.email,
                roles: roles
            },
            token
        };
    }
}