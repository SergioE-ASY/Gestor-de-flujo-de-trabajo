const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'db.env' });

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        dialect: 'postgres',
        logging: false
    }
);

sequelize.sync({ alter: true })
  .then(() => {
    console.log("DB sincronizada con Sequelize");
  })
  .catch(err => {
    console.error("Error sync:", err);
  });


// --- Importación de modelos usando require ---
const Attachment = require('../models/attachment.js')(sequelize);
const Comment = require('../models/comment.js')(sequelize);
const Notification = require('../models/notification.js')(sequelize);
const Organization = require('../models/organization.js')(sequelize);
const OrganizationUser = require('../models/organization_user.js')(sequelize);
const Project = require('../models/project.js')(sequelize);
const ProjectMember = require('../models/project_member.js')(sequelize);
const Sprint = require('../models/sprint.js')(sequelize);
const Tag = require('../models/tag.js')(sequelize);
const Task = require('../models/task.js')(sequelize);
const TaskTag = require('../models/task_tag.js')(sequelize);
const TimeLog = require('../models/time_log.js')(sequelize);
const User = require('../models/user.js')(sequelize);

// --- Asociaciones ---

// Organization <-> User (N:M a través de OrganizationUser)
Organization.belongsToMany(User, { through: OrganizationUser, foreignKey: 'organization_id', otherKey: 'user_id' });
User.belongsToMany(Organization, { through: OrganizationUser, foreignKey: 'user_id', otherKey: 'organization_id' });
Organization.hasMany(OrganizationUser, { foreignKey: 'organization_id' });
OrganizationUser.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(OrganizationUser, { foreignKey: 'user_id' });
OrganizationUser.belongsTo(User, { foreignKey: 'user_id' });

// Organization -> Projects
Organization.hasMany(Project, { foreignKey: 'organization_id' });
Project.belongsTo(Organization, { foreignKey: 'organization_id' });

// User -> Projects (owner)
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Project <-> User (N:M a través de ProjectMember)
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'project_id', otherKey: 'user_id', as: 'members' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'user_id', otherKey: 'project_id', as: 'memberProjects' });
Project.hasMany(ProjectMember, { foreignKey: 'project_id' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id' });
User.hasMany(ProjectMember, { foreignKey: 'user_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' });

// Project -> Sprints
Project.hasMany(Sprint, { foreignKey: 'project_id' });
Sprint.belongsTo(Project, { foreignKey: 'project_id' });

// Project -> Tasks
Project.hasMany(Task, { foreignKey: 'project_id' });
Task.belongsTo(Project, { foreignKey: 'project_id' });

// Sprint -> Tasks
Sprint.hasMany(Task, { foreignKey: 'sprint_id' });
Task.belongsTo(Sprint, { foreignKey: 'sprint_id' });

// User -> Tasks (assignee)
User.hasMany(Task, { foreignKey: 'assignee_id', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });

// Task -> Task (subtareas / parent)
Task.hasMany(Task, { foreignKey: 'parent_task_id', as: 'subtasks' });
Task.belongsTo(Task, { foreignKey: 'parent_task_id', as: 'parentTask' });

// Task <-> Tag (N:M a través de TaskTag)
Task.belongsToMany(Tag, { through: TaskTag, foreignKey: 'task_id', otherKey: 'tag_id' });
Tag.belongsToMany(Task, { through: TaskTag, foreignKey: 'tag_id', otherKey: 'task_id' });

// Project -> Tags
Project.hasMany(Tag, { foreignKey: 'project_id' });
Tag.belongsTo(Project, { foreignKey: 'project_id' });

// Task -> Comments
Task.hasMany(Comment, { foreignKey: 'task_id' });
Comment.belongsTo(Task, { foreignKey: 'task_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// Task -> Attachments
Task.hasMany(Attachment, { foreignKey: 'task_id' });
Attachment.belongsTo(Task, { foreignKey: 'task_id' });
User.hasMany(Attachment, { foreignKey: 'uploaded_by', as: 'uploads' });
Attachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Task -> TimeLogs
Task.hasMany(TimeLog, { foreignKey: 'task_id' });
TimeLog.belongsTo(Task, { foreignKey: 'task_id' });
User.hasMany(TimeLog, { foreignKey: 'user_id' });
TimeLog.belongsTo(User, { foreignKey: 'user_id' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });
Task.hasMany(Notification, { foreignKey: 'task_id' });
Notification.belongsTo(Task, { foreignKey: 'task_id' });
Project.hasMany(Notification, { foreignKey: 'project_id' });
Notification.belongsTo(Project, { foreignKey: 'project_id' });

sequelize.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida correctamente.');
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
    });

sequelize.afterSync(() => {
    console.log('Base de datos sincronizada correctamente.');
});

module.exports = {
    sequelize,
    Attachment,
    Comment,
    Notification,
    Organization,
    OrganizationUser,
    Project,
    ProjectMember,
    Sprint,
    Tag,
    Task,
    TaskTag,
    TimeLog,
    User
};
