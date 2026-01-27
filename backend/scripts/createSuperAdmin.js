import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Admin from '../src/models/admin.js';

// Cargar variables de entorno
dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Datos del super admin
    const superAdminData = {
      username: 'superadmin',
      password: await bcrypt.hash('admin123', 10), // Cambiar esta contraseña
      nombre: 'Super Administrador',
      rol: 'super_admin',
      sedes: [],
      areas: [],
      permisos: new Map([
        ['admin', ['create', 'read', 'update', 'delete']],
        ['user', ['create', 'read', 'update', 'delete']],
        ['sede', ['create', 'read', 'update', 'delete']],
        ['area', ['create', 'read', 'update', 'delete']],
        ['vehiculo', ['create', 'read', 'update', 'delete']],
        ['inventario', ['create', 'read', 'update', 'delete']]
      ]),
      activo: true
    };

    // Verificar si ya existe un super admin
    const existingSuperAdmin = await Admin.findOne({ rol: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Ya existe un super admin en el sistema');
      console.log(`Username: ${existingSuperAdmin.username}`);
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('¿Deseas crear otro super admin de todas formas? (s/n): ', async (answer) => {
        if (answer.toLowerCase() === 's') {
          const newAdmin = await Admin.create(superAdminData);
          console.log('✅ Super Admin creado exitosamente:');
          console.log(`   Username: ${newAdmin.username}`);
          console.log(`   Password: admin123`);
          console.log(`   Rol: ${newAdmin.rol}`);
        } else {
          console.log('❌ Operación cancelada');
        }
        rl.close();
        await mongoose.disconnect();
        process.exit(0);
      });
    } else {
      const newAdmin = await Admin.create(superAdminData);
      console.log('✅ Super Admin creado exitosamente:');
      console.log(`   Username: ${newAdmin.username}`);
      console.log(`   Password: admin123`);
      console.log(`   Rol: ${newAdmin.rol}`);
      console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
      
      await mongoose.disconnect();
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error al crear super admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createSuperAdmin();