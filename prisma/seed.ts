import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seeding...');

  // 1. CREAR ROLES
  // Usamos upsert para que si ya existen, no de error
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrador del Sistema' },
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: 'seller' },
    update: {},
    create: { name: 'seller', description: 'Vendedor de Productos' },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'client' },
    update: {},
    create: { name: 'client', description: 'Cliente Comprador' },
  });

  // 2. PASSWORD COMÚN (Para pruebas)
  const passwordHash = await bcrypt.hash('12345', 10);

  // 3. CREAR USUARIO ADMIN
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tienda.com' },
    update: {},
    create: {
      email: 'admin@tienda.com',
      passwordHash,
      isActive: true,
      isVerified: true,
      userRoles: {
        create: { roleId: adminRole.id } // <--- Le asignamos rol ADMIN
      }
    },
  });

  // 4. CREAR USUARIO VENDEDOR
  const sellerUser = await prisma.user.upsert({
    where: { email: 'vendedor@tienda.com' },
    update: {},
    create: {
      email: 'vendedor@tienda.com',
      passwordHash,
      isActive: true,
      isVerified: true,
      userRoles: {
        create: { roleId: sellerRole.id } // <--- Le asignamos rol SELLER
      }
    },
  });

  // 5. CREAR USUARIO CLIENTE
  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@tienda.com' },
    update: {},
    create: {
      email: 'cliente@tienda.com',
      passwordHash,
      isActive: true,
      isVerified: true,
      userRoles: {
        create: { roleId: clientRole.id } // <--- Le asignamos rol CLIENT
      }
    },
  });

  console.log('Base de datos poblada con éxito:');
  console.log({ admin: adminUser.email, seller: sellerUser.email, client: clientUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });