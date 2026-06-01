import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from './index';

// ==========================================
// 1. USER MODEL
// ==========================================
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare name: CreationOptional<string | null>;
  declare passwordHash: CreationOptional<string | null>;
  declare role: 'ADMIN' | 'STUDENT';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'STUDENT'),
      allowNull: false,
      defaultValue: 'STUDENT',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

// ==========================================
// 2. COURSE MODEL
// ==========================================
export class Course extends Model<InferAttributes<Course, { omit: 'modules' }>, InferCreationAttributes<Course, { omit: 'modules' }>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare slug: string;
  declare description: string;
  declare duration: number; // in minutes
  declare level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  declare price: CreationOptional<number | null>;
  declare thumbnail: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // Eager-loaded association (populated by Sequelize at runtime)
  declare modules?: NonAttribute<Module[]>;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
      allowNull: false,
      defaultValue: 'BEGINNER',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
  }
);

// ==========================================
// 3. MODULE MODEL
// ==========================================
export class Module extends Model<InferAttributes<Module, { omit: 'lessons' }>, InferCreationAttributes<Module, { omit: 'lessons' }>> {
  declare id: CreationOptional<string>;
  declare courseId: ForeignKey<Course['id']>;
  declare title: string;
  declare order: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // Eager-loaded association (populated by Sequelize at runtime)
  declare lessons?: NonAttribute<Lesson[]>;
}

Module.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Module',
    tableName: 'modules',
  }
);

// ==========================================
// 4. LESSON MODEL
// ==========================================
export class Lesson extends Model<InferAttributes<Lesson>, InferCreationAttributes<Lesson>> {
  declare id: CreationOptional<string>;
  declare moduleId: ForeignKey<Module['id']>;
  declare title: string;
  declare type: 'VIDEO' | 'TEXT' | 'PDF' | 'QUIZ';
  declare content: string; // Video URL, Markdown text, PDF URL, or Quiz JSON
  declare order: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Lesson.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'modules',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('VIDEO', 'TEXT', 'PDF', 'QUIZ'),
      allowNull: false,
      defaultValue: 'TEXT',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Lesson',
    tableName: 'lessons',
  }
);

// ==========================================
// 5. ENROLLMENT MODEL
// ==========================================
export class Enrollment extends Model<InferAttributes<Enrollment>, InferCreationAttributes<Enrollment>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare courseId: ForeignKey<Course['id']>;
  declare batchMode: CreationOptional<'ONLINE' | 'OFFLINE'>;
  declare enrolledAt: CreationOptional<Date>;
  declare completedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Enrollment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    batchMode: {
      type: DataTypes.ENUM('ONLINE', 'OFFLINE'),
      allowNull: false,
      defaultValue: 'ONLINE',
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Enrollment',
    tableName: 'enrollments',
  }
);

// ==========================================
// 6. PROGRESS MODEL
// ==========================================
export class Progress extends Model<InferAttributes<Progress>, InferCreationAttributes<Progress>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare lessonId: ForeignKey<Lesson['id']>;
  declare completed: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Progress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Progress',
    tableName: 'progress_records',
  }
);

// ==========================================
// 7. CERTIFICATE MODEL
// ==========================================
export class Certificate extends Model<InferAttributes<Certificate>, InferCreationAttributes<Certificate>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare courseId: ForeignKey<Course['id']>;
  declare url: string;
  declare issuedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Certificate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    issuedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Certificate',
    tableName: 'certificates',
  }
);

// ==========================================
// 8. INQUIRY MODEL
// ==========================================
export class Inquiry extends Model<InferAttributes<Inquiry>, InferCreationAttributes<Inquiry>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare message: string;
  declare status: 'NEW' | 'CONTACTED' | 'RESOLVED';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Inquiry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('NEW', 'CONTACTED', 'RESOLVED'),
      allowNull: false,
      defaultValue: 'NEW',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Inquiry',
    tableName: 'inquiries',
  }
);

// ==========================================
// 9. PAYMENT MODEL
// ==========================================
export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare courseId: ForeignKey<Course['id']>;
  declare amount: number;
  declare transactionId: string;
  declare status: 'PENDING' | 'SUCCESS' | 'FAILED';
  declare provider: string;
  declare batchMode: 'ONLINE' | 'OFFLINE';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'PHONEPE',
    },
    batchMode: {
      type: DataTypes.ENUM('ONLINE', 'OFFLINE'),
      allowNull: false,
      defaultValue: 'ONLINE',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
  }
);

// ==========================================
// ASSOCIATIONS
// ==========================================

// Course has many Modules, Module belongs to Course
Course.hasMany(Module, { as: 'modules', foreignKey: 'courseId', onDelete: 'CASCADE' });
Module.belongsTo(Course, { foreignKey: 'courseId' });

// Module has many Lessons, Lesson belongs to Module
Module.hasMany(Lesson, { as: 'lessons', foreignKey: 'moduleId', onDelete: 'CASCADE' });
Lesson.belongsTo(Module, { foreignKey: 'moduleId' });

// User has many Enrollments, Enrollment belongs to User
User.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'userId', onDelete: 'CASCADE' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });

// Course has many Enrollments, Enrollment belongs to Course
Course.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'courseId', onDelete: 'CASCADE' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// User has many Progress records, Progress belongs to User
User.hasMany(Progress, { as: 'progressRecords', foreignKey: 'userId', onDelete: 'CASCADE' });
Progress.belongsTo(User, { foreignKey: 'userId' });

// Lesson has many Progress records, Progress belongs to Lesson
Lesson.hasMany(Progress, { as: 'progressRecords', foreignKey: 'lessonId', onDelete: 'CASCADE' });
Progress.belongsTo(Lesson, { foreignKey: 'lessonId' });

// User has many Certificates, Certificate belongs to User
User.hasMany(Certificate, { as: 'certificates', foreignKey: 'userId', onDelete: 'CASCADE' });
Certificate.belongsTo(User, { foreignKey: 'userId' });

// Course has many Certificates, Certificate belongs to Course
Course.hasMany(Certificate, { as: 'certificates', foreignKey: 'courseId', onDelete: 'CASCADE' });
Certificate.belongsTo(Course, { foreignKey: 'courseId' });

// User has many Payments, Payment belongs to User
User.hasMany(Payment, { as: 'payments', foreignKey: 'userId', onDelete: 'CASCADE' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// Course has many Payments, Payment belongs to Course
Course.hasMany(Payment, { as: 'payments', foreignKey: 'courseId', onDelete: 'CASCADE' });
Payment.belongsTo(Course, { foreignKey: 'courseId' });

// ==========================================
// 9. PASSWORD RESET TOKEN MODEL
// ==========================================
export class PasswordResetToken extends Model<
  InferAttributes<PasswordResetToken>,
  InferCreationAttributes<PasswordResetToken>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare token: string;      // hashed token stored in DB
  declare expiresAt: Date;
  declare used: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
}

PasswordResetToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'PasswordResetToken',
    tableName: 'password_reset_tokens',
    updatedAt: false,
  }
);

// User has many PasswordResetTokens
User.hasMany(PasswordResetToken, { as: 'resetTokens', foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });

