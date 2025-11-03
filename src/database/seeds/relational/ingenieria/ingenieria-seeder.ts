import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';

export class IngenieriaSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository('role');
    const statusRepository = dataSource.getRepository('status');
    const userRepository = dataSource.getRepository('user'); // Changed from 'usuarios' to 'user'
    const obraRepository = dataSource.getRepository('obras');
    const obraUsuarioRepository = dataSource.getRepository('obra_usuario');
    const materialRepository = dataSource.getRepository('materiales');
    const presupuestoRepository = dataSource.getRepository('presupuestos');

    console.log('🌱 Starting IngenierIA seed...');

    // 0. Ensure status entities exist
    let activeStatus = await statusRepository.findOne({
      where: { name: 'active' },
    });

    if (!activeStatus) {
      activeStatus = await statusRepository.save({
        id: 1,
        name: 'active',
      });
    }

    // 1. Check if roles exist, if not create them
    const existingRoles = await roleRepository.count();
    if (existingRoles === 0) {
      console.log('Creating basic roles...');
      await roleRepository.save([
        { id: 1, name: 'Admin', descripcion: 'Administrator' },
        { id: 2, name: 'User', descripcion: 'Regular User' },
      ]);
    }

    // Create IngenierIA specific roles
    const roles = await roleRepository.save([
      {
        name: 'Admin General',
        descripcion: 'Administrador general del sistema IngenierIA',
      },
      {
        name: 'Admin Obra',
        descripcion: 'Administrador de una obra específica',
      },
      { name: 'Supervisor', descripcion: 'Supervisor de obra' },
      { name: 'Operario', descripcion: 'Trabajador operativo' },
      { name: 'RRHH', descripcion: 'Recursos Humanos' },
    ]);

    console.log(`✅ Created ${roles.length} IngenierIA roles`);

    // 2. Create Admin General user
    const adminGeneralRole = roles.find((r) => r.name === 'Admin General');
    const adminObraRole = roles.find((r) => r.name === 'Admin Obra');
    const operarioRole = roles.find((r) => r.name === 'Operario');

    const salt = await bcrypt.genSalt();
    const adminPassword = await bcrypt.hash('secret', salt);

    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@ingenieria.com' },
    });

    let admin;
    if (!existingAdmin) {
      console.log('Creating Admin General user...');
      admin = await userRepository.save({
        email: 'admin@ingenieria.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'General',
        roleId: adminGeneralRole?.id,
        statusId: activeStatus.id,
        provider: 'email',
      });
      console.log('✅ Admin General created: admin@ingenieria.com / secret');
    } else {
      admin = existingAdmin;
      console.log('ℹ️  Admin General already exists');
    }

    // 3. Create additional users
    const obraAdminPassword = await bcrypt.hash('secret', salt);

    const existingObraAdmin = await userRepository.findOne({
      where: { email: 'admin.obra1@ingenieria.com' },
    });

    let obraAdmin1;
    if (!existingObraAdmin) {
      obraAdmin1 = await userRepository.save({
        email: 'admin.obra1@ingenieria.com',
        password: obraAdminPassword,
        firstName: 'Carlos',
        lastName: 'Administrador',
        roleId: adminObraRole?.id,
        statusId: activeStatus.id,
        provider: 'email',
      });
      console.log('✅ Admin Obra created: admin.obra1@ingenieria.com / secret');
    } else {
      obraAdmin1 = existingObraAdmin;
    }

    const existingOperario1 = await userRepository.findOne({
      where: { email: 'operario1@ingenieria.com' },
    });

    let operario1;
    if (!existingOperario1) {
      operario1 = await userRepository.save({
        email: 'operario1@ingenieria.com',
        password: await bcrypt.hash('secret', salt),
        firstName: 'Juan',
        lastName: 'Obrero',
        roleId: operarioRole?.id,
        statusId: activeStatus.id,
        provider: 'email',
      });
    } else {
      operario1 = existingOperario1;
    }

    const existingOperario2 = await userRepository.findOne({
      where: { email: 'operario2@ingenieria.com' },
    });

    let operario2;
    if (!existingOperario2) {
      operario2 = await userRepository.save({
        email: 'operario2@ingenieria.com',
        password: await bcrypt.hash('secret', salt),
        firstName: 'Pedro',
        lastName: 'Trabajador',
        roleId: operarioRole?.id,
        statusId: activeStatus.id,
        provider: 'email',
      });
    } else {
      operario2 = existingOperario2;
    }

    console.log('✅ Created IngenierIA users (password: secret for all)');

    // 4. Create Obras
    console.log('Creating obras...');
    const obras = await obraRepository.save([
      {
        nombre: 'Edificio Central',
        direccion: 'Av. Principal 123, Ciudad Central',
        estado: 'activa',
        fecha_inicio: new Date('2024-01-15'),
        admin_id: admin.id,
      },
      {
        nombre: 'Vía Panamericana',
        direccion: 'Km 45, Autopista Panamericana',
        estado: 'activa',
        fecha_inicio: new Date('2024-02-01'),
        admin_id: admin.id,
      },
    ]);

    console.log(`✅ Created ${obras.length} obras`);

    // 5. Assign users to obras (obra_usuario)
    console.log('Assigning users to obras...');
    const asignaciones: Array<{
      user_id: string;
      obra_id: string;
      role_name: string;
    }> = [];

    // Admin General to all obras
    for (const obra of obras) {
      asignaciones.push({
        user_id: admin.id,
        obra_id: obra.id,
        role_name: 'Admin General',
      });
    }

    // Obra Admin 1 to Edificio Central
    asignaciones.push({
      user_id: obraAdmin1.id,
      obra_id: obras[0].id,
      role_name: 'Admin Obra',
    });

    // Operarios to obras
    asignaciones.push(
      {
        user_id: operario1.id,
        obra_id: obras[0].id,
        role_name: 'Operario',
      },
      {
        user_id: operario2.id,
        obra_id: obras[0].id,
        role_name: 'Operario',
      },
      {
        user_id: operario1.id,
        obra_id: obras[1].id,
        role_name: 'Operario',
      },
    );

    await obraUsuarioRepository.save(asignaciones);
    console.log(`✅ Created ${asignaciones.length} user-obra assignments`);

    // 6. Create sample materials
    console.log('Creating sample materials...');
    const materiales = await materialRepository.save([
      {
        obra_id: obras[0].id,
        nombre: 'Cemento Portland',
        categoria: 'Construcción',
        cantidad: 100,
        unidad: 'bultos',
        proveedor: 'Cemex',
      },
      {
        obra_id: obras[0].id,
        nombre: 'Varillas 3/8"',
        categoria: 'Acero',
        cantidad: 500,
        unidad: 'unidades',
        proveedor: 'Siderúrgica Nacional',
      },
      {
        obra_id: obras[1].id,
        nombre: 'Asfalto',
        categoria: 'Pavimentación',
        cantidad: 50,
        unidad: 'toneladas',
        proveedor: 'Asfaltos SA',
      },
      {
        obra_id: obras[1].id,
        nombre: 'Concreto premezclado',
        categoria: 'Construcción',
        cantidad: 200,
        unidad: 'm³',
        proveedor: 'Concretos Unidos',
      },
    ]);

    console.log(`✅ Created ${materiales.length} materials`);

    // 7. Create sample presupuestos
    console.log('Creating sample presupuestos...');
    const presupuestos = await presupuestoRepository.save([
      {
        obra_id: obras[0].id,
        partida: 'Cimentación',
        unidad: 'm³',
        cantidad: 150,
        valor_unitario: 250000,
        valor_ejecutado: 75000,
      },
      {
        obra_id: obras[0].id,
        partida: 'Estructura metálica',
        unidad: 'ton',
        cantidad: 25,
        valor_unitario: 5000000,
        valor_ejecutado: 0,
      },
      {
        obra_id: obras[1].id,
        partida: 'Pavimento asfáltico',
        unidad: 'km',
        cantidad: 10,
        valor_unitario: 150000000,
        valor_ejecutado: 300000000,
      },
    ]);

    console.log(`✅ Created ${presupuestos.length} presupuestos`);

    console.log('');
    console.log('🎉 IngenierIA seed completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   - Roles: ${roles.length} IngenierIA roles`);
    console.log(`   - Users: 4 (1 Admin General, 1 Admin Obra, 2 Operarios)`);
    console.log(`   - Obras: ${obras.length}`);
    console.log(`   - Assignments: ${asignaciones.length}`);
    console.log(`   - Materials: ${materiales.length}`);
    console.log(`   - Presupuestos: ${presupuestos.length}`);
    console.log('');
    console.log('🔐 Test Credentials (password is "secret" for all):');
    console.log('   Admin General: admin@ingenieria.com');
    console.log('   Admin Obra: admin.obra1@ingenieria.com');
    console.log('   Operario 1: operario1@ingenieria.com');
    console.log('   Operario 2: operario2@ingenieria.com');
  }
}

export default IngenieriaSeeder;
