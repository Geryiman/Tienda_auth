import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el poblado de datos (Seeding)...');

  // =======================================================
  // 1. CREACIÓN DE ROLES (RBAC)
  // Usamos "upsert" (Update/Insert): Si existe, no hace nada. Si no, lo crea.
  // Esto evita errores si corres el script dos veces.
  // =======================================================
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Super Administrador con acceso total al sistema',
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'client' },
    update: {},
    create: {
      name: 'client',
      description: 'Usuario registrado que puede comprar',
    },
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: 'seller' },
    update: {},
    create: {
      name: 'seller',
      description: 'Vendedor que puede gestionar sus productos',
    },
  });

  console.log('Roles creados correctamente.');

  // =======================================================
  // 2. CREACIÓN DE PERMISOS BÁSICOS
  // =======================================================
  const permissionRead = await prisma.permission.upsert({
    where: { slug: 'users.read' },
    update: {},
    create: { slug: 'users.read', description: 'Puede ver lista de usuarios' },
  });

  // Asignamos permiso al Admin
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: permissionRead.id
      }
    },
    update: {},
    create: {
      roleId: adminRole.id,
      permissionId: permissionRead.id
    }
  });

  // =======================================================
  // 3. CREACIÓN DEL SUPER ADMIN
  // =======================================================
  const adminEmail = 'admin@tienda.com';
  

  // El "10" son los "Salt Rounds". Entre más alto, más seguro, pero más lento.
  // 10 es el estándar actual de la industria.
  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: passwordHash,
      isActive: true,
      isVerified: true,
      userRoles: {
        create: {
          roleId: adminRole.id // Le asignamos el rol de Admin
        }
      }
    },
  });

  console.log(`Usuario Admin creado: ${adminUser.email} (Pass: admin123)`);
  console.log('Seeding finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });