const { sequelize, User, Organization, OrganizationUser, Project, Task } = require('./server/db');

async function seed() {
  await sequelize.sync(); // Asegurar sync

  // Clean tables
  await Task.destroy({ where: {} });
  await Project.destroy({ where: {} });
  await OrganizationUser.destroy({ where: {} });
  await Organization.destroy({ where: {} });
  await User.destroy({ where: {} });

  const userAdmin = await User.create({ name: 'Admin', email: 'admin@t.com', password_hash: '123' });
  const userMember = await User.create({ name: 'Member', email: 'member@t.com', password_hash: '123' });
  
  const org = await Organization.create({ name: 'Test Org' });
  
  await OrganizationUser.create({ organization_id: org.id, user_id: userAdmin.id, role: 'admin' });
  await OrganizationUser.create({ organization_id: org.id, user_id: userMember.id, role: 'member' });
  
  const project = await Project.create({ 
    organization_id: org.id, 
    owner_id: userAdmin.id, 
    name: 'Seeded Project',
    key: 'SEED',
    type: 'kanban'
  });
  
  // Tareas para admin
  await Task.create({ project_id: project.id, project_sequence: 1, type: 'task', title: 'Task 1', assignee_id: userAdmin.id, status: 'done', priority: 'high', position: 1 });
  await Task.create({ project_id: project.id, project_sequence: 2, type: 'task', title: 'Task 2', assignee_id: userAdmin.id, status: 'in_progress', priority: 'medium', position: 2 });
  
  // Tarea para member
  await Task.create({ project_id: project.id, project_sequence: 3, type: 'task', title: 'Task 3', assignee_id: userMember.id, status: 'done', priority: 'high', position: 3 });
  
  // Tarea sin asignar
  await Task.create({ project_id: project.id, project_sequence: 4, type: 'task', title: 'Task 4', status: 'backlog', priority: 'low', position: 4 });

  console.log('--- SEED COMPLETED ---');
  console.log('Admin ID:', userAdmin.id);
  console.log('Member ID:', userMember.id);
  console.log('Org ID:', org.id);
  console.log('Project ID:', project.id);
}

seed().catch(console.error).finally(() => process.exit(0));
