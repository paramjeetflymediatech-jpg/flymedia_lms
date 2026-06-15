import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from './index';

// ==========================================
// 1. USER MODEL
// ==========================================
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare name: CreationOptional<string | null>;
  declare bio: CreationOptional<string | null>;
  declare avatar: CreationOptional<string | null>;
  declare passwordHash: CreationOptional<string | null>;
  declare role: 'ADMIN' | 'STUDENT' | 'TUTOR';
  
  // Mentor/Tutor Specific Fields
  declare professionTitle: CreationOptional<string | null>;
  declare rating: CreationOptional<number>;
  declare reviewsCount: CreationOptional<number>;
  declare studentsMentored: CreationOptional<number>;
  declare skills: CreationOptional<string[] | null>;
  declare trialExpectations: CreationOptional<string[] | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    name: { type: DataTypes.STRING(255), allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    avatar: { type: DataTypes.STRING(1024), allowNull: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: true },
    role: { type: DataTypes.ENUM('ADMIN', 'STUDENT', 'TUTOR'), allowNull: false, defaultValue: 'STUDENT' },
    professionTitle: { type: DataTypes.STRING(255), allowNull: true },
    rating: { type: DataTypes.DECIMAL(3, 1), allowNull: false, defaultValue: 5.0 },
    reviewsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    studentsMentored: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    skills: { type: DataTypes.JSON, allowNull: true },
    trialExpectations: { type: DataTypes.JSON, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'User', tableName: 'users' }
);

// ==========================================
// 2. PACKAGE MODEL
// ==========================================
export class Package extends Model<InferAttributes<Package, { omit: 'liveClasses' }>, InferCreationAttributes<Package, { omit: 'liveClasses' }>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare slug: string;
  declare description: string;
  declare price: CreationOptional<number | null>;
  declare thumbnail: CreationOptional<string | null>;
  declare status: CreationOptional<'DRAFT' | 'PUBLISHED'>;
  declare mode: CreationOptional<'ONLINE' | 'OFFLINE' | 'BOTH'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // Eager-loaded association
  declare liveClasses?: NonAttribute<LiveClass[]>;
}

Package.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    thumbnail: { type: DataTypes.STRING(1024), allowNull: true },
    status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED'), allowNull: false, defaultValue: 'DRAFT' },
    mode: { type: DataTypes.ENUM('ONLINE', 'OFFLINE', 'BOTH'), allowNull: false, defaultValue: 'ONLINE' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Package', tableName: 'packages' }
);

// ==========================================
// 3. LIVE CLASS MODEL
// ==========================================
export class LiveClass extends Model<InferAttributes<LiveClass>, InferCreationAttributes<LiveClass>> {
  declare id: CreationOptional<string>;
  declare packageId: ForeignKey<Package['id']>;
  declare tutorId: ForeignKey<User['id']>;
  declare title: string;
  declare meetLink: string;
  declare startTime: Date;
  declare duration: number; // in minutes
  declare status: CreationOptional<'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

LiveClass.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    packageId: { type: DataTypes.UUID, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
    tutorId: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    meetLink: { type: DataTypes.STRING(1024), allowNull: true },
    startTime: { type: DataTypes.DATE, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    status: { type: DataTypes.ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED'), allowNull: false, defaultValue: 'SCHEDULED' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'LiveClass', tableName: 'live_classes' }
);

// ==========================================
// 4. ENROLLMENT MODEL
// ==========================================
export class Enrollment extends Model<InferAttributes<Enrollment>, InferCreationAttributes<Enrollment>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare packageId: ForeignKey<Package['id']>;
  declare enrolledAt: CreationOptional<Date>;
  declare completedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Enrollment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    packageId: { type: DataTypes.UUID, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
    enrolledAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Enrollment', tableName: 'enrollments' }
);

// ==========================================
// 5. CERTIFICATE MODEL
// ==========================================
export class Certificate extends Model<InferAttributes<Certificate>, InferCreationAttributes<Certificate>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare packageId: ForeignKey<Package['id']>;
  declare url: string;
  declare issuedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Certificate.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    packageId: { type: DataTypes.UUID, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
    url: { type: DataTypes.STRING(1024), allowNull: false },
    issuedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Certificate', tableName: 'certificates' }
);

// ==========================================
// 6. INQUIRY MODEL
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
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(50), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('NEW', 'CONTACTED', 'RESOLVED'), allowNull: false, defaultValue: 'NEW' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Inquiry', tableName: 'inquiries' }
);

// ==========================================
// 7. PAYMENT MODEL
// ==========================================
export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare packageId: ForeignKey<Package['id']>;
  declare amount: number;
  declare transactionId: string;
  declare status: 'PENDING' | 'SUCCESS' | 'FAILED';
  declare provider: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Payment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    packageId: { type: DataTypes.UUID, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    transactionId: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    status: { type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'), allowNull: false, defaultValue: 'PENDING' },
    provider: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'PHONEPE' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Payment', tableName: 'payments' }
);

// ==========================================
// 8. PASSWORD RESET TOKEN MODEL
// ==========================================
export class PasswordResetToken extends Model<InferAttributes<PasswordResetToken>, InferCreationAttributes<PasswordResetToken>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare token: string;
  declare expiresAt: Date;
  declare used: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
}

PasswordResetToken.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    token: { type: DataTypes.STRING(255), allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'PasswordResetToken', tableName: 'password_reset_tokens', updatedAt: false }
);

// ==========================================
// 9. COUPON MODEL
// ==========================================
export class Coupon extends Model<InferAttributes<Coupon>, InferCreationAttributes<Coupon>> {
  declare id: CreationOptional<string>;
  declare code: string;
  declare discountPercentage: number;
  declare expiresAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Coupon.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    discountPercentage: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 100 } },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Coupon', tableName: 'coupons' }
);

// ==========================================
// 10. TUTOR APPLICATION MODEL
// ==========================================
export class TutorApplication extends Model<InferAttributes<TutorApplication>, InferCreationAttributes<TutorApplication>> {
  declare id: CreationOptional<string>;
  declare fullName: string;
  declare email: string;
  declare phone: string;
  declare expertise: string;
  declare experience: string;
  declare status: CreationOptional<'PENDING' | 'APPROVED' | 'REJECTED'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TutorApplication.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fullName: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(50), allowNull: false },
    expertise: { type: DataTypes.STRING(255), allowNull: false },
    experience: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'TutorApplication', tableName: 'tutor_applications' }
);

// ==========================================
// 11. SEO SETTING MODEL
// ==========================================
export class SeoSetting extends Model<InferAttributes<SeoSetting>, InferCreationAttributes<SeoSetting>> {
  declare id: CreationOptional<string>;
  declare pagePath: string; // e.g. '/', '/courses', or 'GLOBAL'
  declare title: string;
  declare description: string;
  declare keywords: CreationOptional<string | null>;
  declare headerScript: CreationOptional<string | null>;
  declare footerScript: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SeoSetting.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pagePath: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    keywords: { type: DataTypes.TEXT, allowNull: true },
    headerScript: { type: DataTypes.TEXT, allowNull: true },
    footerScript: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'SeoSetting', tableName: 'seo_settings' }
);

// ==========================================
// 12. REVIEW MODEL
// ==========================================
export class Review extends Model<InferAttributes<Review>, InferCreationAttributes<Review>> {
  declare id: CreationOptional<string>;
  declare studentId: ForeignKey<User['id']>;
  declare tutorId: ForeignKey<User['id']>;
  declare rating: number;
  declare comment: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Review.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    tutorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Review', tableName: 'reviews' }
);

// ==========================================
// 13. TUTOR AVAILABILITY MODEL
// ==========================================
export class TutorAvailability extends Model<InferAttributes<TutorAvailability>, InferCreationAttributes<TutorAvailability>> {
  declare id: CreationOptional<string>;
  declare tutorId: ForeignKey<User['id']>;
  declare studentId: CreationOptional<ForeignKey<User['id']> | null>;
  declare date: string; // Storing as DATEONLY string 'YYYY-MM-DD'
  declare startTime: string; // e.g. '10:00'
  declare endTime: string; // e.g. '11:00'
  declare isBooked: CreationOptional<boolean>;
  declare meetLink: CreationOptional<string | null>;
  declare status: CreationOptional<'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TutorAvailability.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tutorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    studentId: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.STRING(20), allowNull: false },
    endTime: { type: DataTypes.STRING(20), allowNull: false },
    isBooked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    meetLink: { type: DataTypes.STRING(1024), allowNull: true },
    status: { type: DataTypes.ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED'), allowNull: false, defaultValue: 'SCHEDULED' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { 
    sequelize, 
    modelName: 'TutorAvailability', 
    tableName: 'tutor_availabilities',
    indexes: [
      {
        unique: true,
        fields: ['tutorId', 'date', 'startTime', 'endTime']
      }
    ]
  }
);

// ==========================================
// 14. BLOG POST MODEL
// ==========================================
export class BlogPost extends Model<InferAttributes<BlogPost, { omit: 'author' }>, InferCreationAttributes<BlogPost, { omit: 'author' }>> {
  declare id: CreationOptional<string>;
  declare authorId: ForeignKey<User['id']>;
  declare title: string;
  declare slug: string;
  declare category: string;
  declare excerpt: string;
  declare content: string;
  declare readTime: CreationOptional<string | null>;
  declare image: CreationOptional<string | null>;
  declare status: CreationOptional<'DRAFT' | 'PUBLISHED'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare author?: NonAttribute<User>;
}

BlogPost.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    authorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    category: { type: DataTypes.STRING(100), allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    readTime: { type: DataTypes.STRING(50), allowNull: true },
    image: { type: DataTypes.STRING(1024), allowNull: true },
    status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED'), allowNull: false, defaultValue: 'DRAFT' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'BlogPost', tableName: 'blog_posts' }
);

// ==========================================
// 15. NEWSLETTER SUBSCRIBER MODEL
// ==========================================
export class NewsletterSubscriber extends Model<InferAttributes<NewsletterSubscriber>, InferCreationAttributes<NewsletterSubscriber>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

NewsletterSubscriber.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'NewsletterSubscriber', tableName: 'newsletter_subscribers' }
);

// ==========================================
// ASSOCIATIONS
// ==========================================

// Package has many LiveClasses
Package.hasMany(LiveClass, { as: 'liveClasses', foreignKey: 'packageId', onDelete: 'CASCADE' });
LiveClass.belongsTo(Package, { foreignKey: 'packageId' });

// Tutor has many LiveClasses
User.hasMany(LiveClass, { as: 'teachingClasses', foreignKey: 'tutorId' });
LiveClass.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });

// User has many Enrollments
User.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'userId', onDelete: 'CASCADE' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });

// Package has many Enrollments
Package.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'packageId', onDelete: 'CASCADE' });
Enrollment.belongsTo(Package, { foreignKey: 'packageId' });

// User has many Certificates
User.hasMany(Certificate, { as: 'certificates', foreignKey: 'userId', onDelete: 'CASCADE' });
Certificate.belongsTo(User, { foreignKey: 'userId' });

// Package has many Certificates
Package.hasMany(Certificate, { as: 'certificates', foreignKey: 'packageId', onDelete: 'CASCADE' });
Certificate.belongsTo(Package, { foreignKey: 'packageId' });

// User has many Payments
User.hasMany(Payment, { as: 'payments', foreignKey: 'userId', onDelete: 'CASCADE' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// Package has many Payments
Package.hasMany(Payment, { as: 'payments', foreignKey: 'packageId', onDelete: 'CASCADE' });
Payment.belongsTo(Package, { foreignKey: 'packageId' });

// User has many PasswordResetTokens
User.hasMany(PasswordResetToken, { as: 'resetTokens', foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });

// User (Student) has many Reviews (written by them)
User.hasMany(Review, { as: 'writtenReviews', foreignKey: 'studentId', onDelete: 'CASCADE' });
Review.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

// User (Tutor) has many Reviews (received by them)
User.hasMany(Review, { as: 'receivedReviews', foreignKey: 'tutorId', onDelete: 'CASCADE' });
Review.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });

// User (Tutor) has many Availabilities
User.hasMany(TutorAvailability, { as: 'availabilities', foreignKey: 'tutorId', onDelete: 'CASCADE' });
TutorAvailability.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });

// User (Student) has many booked Sessions
User.hasMany(TutorAvailability, { as: 'bookedSessions', foreignKey: 'studentId', onDelete: 'SET NULL' });
TutorAvailability.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

// User has many BlogPosts
User.hasMany(BlogPost, { as: 'blogPosts', foreignKey: 'authorId', onDelete: 'CASCADE' });
BlogPost.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

