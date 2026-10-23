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
  declare credits: CreationOptional<number>;

  // Student Profile Fields
  declare phone: CreationOptional<string | null>;
  declare educationDetails: CreationOptional<{
    highestQualification?: string;
    collegeOrSchool?: string;
    passingYear?: string;
    percentageOrCgpa?: string;
    currentlyStudying?: boolean;
    currentCourse?: string;
    currentInstitution?: string;
  } | null>;
  declare addressDetails: CreationOptional<{
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null>;
  declare familyDetails: CreationOptional<{
    fatherName?: string;
    motherName?: string;
    guardianPhone?: string;
    familyOccupation?: string;
    annualIncome?: string;
  } | null>;
  declare studentCategory: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare assignedPackages?: NonAttribute<Package[]>;
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
    credits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    educationDetails: { type: DataTypes.JSON, allowNull: true },
    addressDetails: { type: DataTypes.JSON, allowNull: true },
    familyDetails: { type: DataTypes.JSON, allowNull: true },
    studentCategory: { type: DataTypes.STRING(50), allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'User', tableName: 'users' }
);

// ==========================================
// 1.5 CATEGORY MODEL
// ==========================================
export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare icon: CreationOptional<string | null>;
  declare image: CreationOptional<string | null>;
  declare content: CreationOptional<string | null>;
  declare metaTitle: CreationOptional<string | null>;
  declare metaDescription: CreationOptional<string | null>;
  declare metaKeywords: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Category.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    icon: { type: DataTypes.STRING(1024), allowNull: true },
    image: { type: DataTypes.STRING(1024), allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    metaTitle: { type: DataTypes.STRING(255), allowNull: true },
    metaDescription: { type: DataTypes.TEXT, allowNull: true },
    metaKeywords: { type: DataTypes.STRING(255), allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Category', tableName: 'categories' }
);

// ==========================================
// 2. PACKAGE MODEL
// ==========================================
export class Package extends Model<InferAttributes<Package, { omit: 'liveClasses' | 'assignedTutors' | 'schedules' }>, InferCreationAttributes<Package, { omit: 'liveClasses' | 'assignedTutors' | 'schedules' }>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare slug: string;
  declare description: string;
  declare category: CreationOptional<string>;
  declare price: CreationOptional<number | null>;
  declare thumbnail: CreationOptional<string | null>;
  declare status: CreationOptional<'DRAFT' | 'PUBLISHED'>;
  declare mode: CreationOptional<'ONLINE' | 'OFFLINE' | 'BOTH'>;
  declare whatYoullLearn: CreationOptional<string[] | null>;
  declare instructors: CreationOptional<{ name: string; role: string; bio: string; avatar: string }[] | null>;
  declare successStories: CreationOptional<{ name: string; role: string; quote: string; avatar: string }[] | null>;
  declare courseModules: CreationOptional<{ title: string; topics: string[] }[] | null>;
  declare highlights: CreationOptional<{ title: string; description: string }[] | null>;
  declare skills: CreationOptional<string[] | null>;
  declare techStack: CreationOptional<string[] | null>;
  declare projectDetails: CreationOptional<{ description: string; stages: { title: string; content: string }[] } | null>;
  declare targetAudience: CreationOptional<{ list: string[]; prerequisites: string } | null>;
  declare faqs: CreationOptional<{ question: string; answer: string }[] | null>;
  declare certificateData: CreationOptional<{ title: string; features: { title: string; body: string }[]; providers: { name: string; image: string }[] } | null>;
  declare benefits: CreationOptional<string[] | null>;
  declare videoUrl: CreationOptional<string | null>;
  declare rating: CreationOptional<number>;
  declare reviewsCount: CreationOptional<string | null>;
  declare level: CreationOptional<string | null>;
  declare duration: CreationOptional<string | null>;
  declare totalClasses: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  // Eager-loaded association
  declare liveClasses?: NonAttribute<LiveClass[]>;
  declare assignedTutors?: NonAttribute<User[]>;
  declare schedules?: NonAttribute<ClassSchedule[]>;
}

Package.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Uncategorized' },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    thumbnail: { type: DataTypes.STRING(1024), allowNull: true },
    videoUrl: { type: DataTypes.STRING(1024), allowNull: true },
    status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED'), allowNull: false, defaultValue: 'DRAFT' },
    mode: { type: DataTypes.ENUM('ONLINE', 'OFFLINE', 'BOTH'), allowNull: false, defaultValue: 'ONLINE' },
    totalClasses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 12 },
    whatYoullLearn: { type: DataTypes.JSON, allowNull: true },
    instructors: { type: DataTypes.JSON, allowNull: true },
    successStories: { type: DataTypes.JSON, allowNull: true },
    courseModules: { type: DataTypes.JSON, allowNull: true },
    highlights: { type: DataTypes.JSON, allowNull: true },
    skills: { type: DataTypes.JSON, allowNull: true },
    techStack: { type: DataTypes.JSON, allowNull: true },
    projectDetails: { type: DataTypes.JSON, allowNull: true },
    targetAudience: { type: DataTypes.JSON, allowNull: true },
    faqs: { type: DataTypes.JSON, allowNull: true },
    certificateData: { type: DataTypes.JSON, allowNull: true },
    benefits: { type: DataTypes.JSON, allowNull: true },
    rating: { type: DataTypes.DECIMAL(3, 1), allowNull: false, defaultValue: 4.9 },
    reviewsCount: { type: DataTypes.STRING(50), allowNull: true, defaultValue: '1.2k+' },
    level: { type: DataTypes.STRING(50), allowNull: true, defaultValue: 'Beginner to Advanced' },
    duration: { type: DataTypes.STRING(50), allowNull: true, defaultValue: '6 Months' },
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
  declare scheduleId: CreationOptional<string | null>;
  declare classNumber: CreationOptional<number | null>;
  declare title: string;
  declare meetLink: string;
  declare startTime: Date;
  declare duration: number; // in minutes
  declare status: CreationOptional<'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare package?: NonAttribute<Package>;
  declare tutor?: NonAttribute<User>;
}

LiveClass.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    packageId: { type: DataTypes.UUID, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
    tutorId: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    scheduleId: { type: DataTypes.UUID, allowNull: true, references: { model: 'class_schedules', key: 'id' }, onDelete: 'SET NULL' },
    classNumber: { type: DataTypes.INTEGER, allowNull: true },
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
// 3.1 CLASS SCHEDULE MODEL
// ==========================================
export class ClassSchedule extends Model<InferAttributes<ClassSchedule>, InferCreationAttributes<ClassSchedule>> {
  declare id: CreationOptional<string>;
  declare packageId: ForeignKey<Package['id']>;
  declare tutorId: ForeignKey<User['id']>;
  declare daysOfWeek: string[]; // e.g. ["Monday", "Wednesday"]
  declare startTime: string; // e.g. "18:00"
  declare duration: number; // in minutes
  declare meetLink: string;
  declare startDate: string; // YYYY-MM-DD
  declare totalClasses: CreationOptional<number>;
  declare status: CreationOptional<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare package?: NonAttribute<Package>;
  declare tutor?: NonAttribute<User>;
  declare liveClasses?: NonAttribute<LiveClass[]>;
}

ClassSchedule.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    packageId: { type: DataTypes.UUID, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
    tutorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    daysOfWeek: { type: DataTypes.JSON, allowNull: false },
    startTime: { type: DataTypes.STRING(20), allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    meetLink: { type: DataTypes.STRING(1024), allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    totalClasses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 12 },
    status: { type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED'), allowNull: false, defaultValue: 'ACTIVE' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'ClassSchedule', tableName: 'class_schedules' }
);

// ==========================================
// 3.2 PACKAGE TUTOR (ASSIGNMENT) MODEL
// ==========================================
export class PackageTutor extends Model<InferAttributes<PackageTutor>, InferCreationAttributes<PackageTutor>> {
  declare id: CreationOptional<string>;
  declare packageId: ForeignKey<Package['id']>;
  declare tutorId: ForeignKey<User['id']>;
  declare assignedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare package?: NonAttribute<Package>;
  declare tutor?: NonAttribute<User>;
}

PackageTutor.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    packageId: { type: DataTypes.UUID, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
    tutorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    assignedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'PackageTutor',
    tableName: 'package_tutors',
    indexes: [
      {
        unique: true,
        fields: ['packageId', 'tutorId'],
      },
    ],
  }
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
  declare totalCredits: CreationOptional<number>;
  declare usedCredits: CreationOptional<number>;
  declare totalClasses: CreationOptional<number>;
  declare conductedClasses: CreationOptional<number>;
  declare attendedClasses: CreationOptional<number>;
  declare status: CreationOptional<'ACTIVE' | 'EXPIRED' | 'COMPLETED'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare package?: NonAttribute<Package>;
  declare user?: NonAttribute<User>;
  declare attendances?: NonAttribute<ClassAttendance[]>;
}

Enrollment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    packageId: { type: DataTypes.UUID, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
    enrolledAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    totalCredits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
    usedCredits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    totalClasses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 12 },
    conductedClasses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    attendedClasses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'COMPLETED'), allowNull: false, defaultValue: 'ACTIVE' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Enrollment', tableName: 'enrollments' }
);

// ==========================================
// 4.1 CLASS ATTENDANCE MODEL
// ==========================================
export class ClassAttendance extends Model<InferAttributes<ClassAttendance>, InferCreationAttributes<ClassAttendance>> {
  declare id: CreationOptional<string>;
  declare enrollmentId: ForeignKey<Enrollment['id']>;
  declare studentId: ForeignKey<User['id']>;
  declare liveClassId: ForeignKey<LiveClass['id']>;
  declare status: CreationOptional<'ATTENDED' | 'ABSENT'>;
  declare joinedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare liveClass?: NonAttribute<LiveClass>;
  declare student?: NonAttribute<User>;
  declare enrollment?: NonAttribute<Enrollment>;
}

ClassAttendance.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    enrollmentId: { type: DataTypes.UUID, allowNull: false, references: { model: 'enrollments', key: 'id' }, onDelete: 'CASCADE' },
    studentId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    liveClassId: { type: DataTypes.UUID, allowNull: false, references: { model: 'live_classes', key: 'id' }, onDelete: 'CASCADE' },
    status: { type: DataTypes.ENUM('ATTENDED', 'ABSENT'), allowNull: false, defaultValue: 'ATTENDED' },
    joinedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'ClassAttendance',
    tableName: 'class_attendances',
    indexes: [
      {
        unique: true,
        fields: ['enrollmentId', 'liveClassId'],
      },
    ],
  }
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
  declare ogTitle: CreationOptional<string | null>;
  declare ogDescription: CreationOptional<string | null>;
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
    ogTitle: { type: DataTypes.STRING(255), allowNull: true },
    ogDescription: { type: DataTypes.TEXT, allowNull: true },
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
export class TutorAvailability extends Model<InferAttributes<TutorAvailability, { omit: 'bookings' }>, InferCreationAttributes<TutorAvailability, { omit: 'bookings' }>> {
  declare id: CreationOptional<string>;
  declare tutorId: ForeignKey<User['id']>;
  declare studentId: CreationOptional<ForeignKey<User['id']> | null>;
  declare date: string; // Storing as DATEONLY string 'YYYY-MM-DD'
  declare startTime: string; // e.g. '10:00'
  declare endTime: string; // e.g. '11:00'
  declare isBooked: CreationOptional<boolean>;
  declare maxStudents: CreationOptional<number>;
  declare bookedCount: CreationOptional<number>;
  declare meetLink: CreationOptional<string | null>;
  declare status: CreationOptional<'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare bookings?: NonAttribute<TutorSlotBooking[]>;
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
    maxStudents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
    bookedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
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
// 13B. TUTOR SLOT BOOKING MODEL (Max 100 students)
// ==========================================
export class TutorSlotBooking extends Model<InferAttributes<TutorSlotBooking>, InferCreationAttributes<TutorSlotBooking>> {
  declare id: CreationOptional<string>;
  declare slotId: ForeignKey<TutorAvailability['id']>;
  declare studentId: ForeignKey<User['id']>;
  declare status: CreationOptional<'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>;
  declare attendanceStatus: CreationOptional<'SCHEDULED' | 'ATTENDED' | 'ABSENT'>;
  declare creditDeducted: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare slot?: NonAttribute<TutorAvailability>;
  declare student?: NonAttribute<User>;
}

TutorSlotBooking.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    slotId: { type: DataTypes.UUID, allowNull: false, references: { model: 'tutor_availabilities', key: 'id' }, onDelete: 'CASCADE' },
    studentId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    status: { type: DataTypes.ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED'), allowNull: false, defaultValue: 'SCHEDULED' },
    attendanceStatus: { type: DataTypes.ENUM('SCHEDULED', 'ATTENDED', 'ABSENT'), allowNull: false, defaultValue: 'SCHEDULED' },
    creditDeducted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'TutorSlotBooking',
    tableName: 'tutor_slot_bookings',
    indexes: [
      {
        unique: true,
        fields: ['slotId', 'studentId'],
      },
    ],
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
  
  // SEO Fields
  declare metaTitle: CreationOptional<string | null>;
  declare metaDescription: CreationOptional<string | null>;
  declare keywords: CreationOptional<string | null>;
  declare ogTitle: CreationOptional<string | null>;
  declare ogDescription: CreationOptional<string | null>;
  declare headerScript: CreationOptional<string | null>;
  declare footerScript: CreationOptional<string | null>;

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
    
    // SEO Fields
    metaTitle: { type: DataTypes.STRING(255), allowNull: true },
    metaDescription: { type: DataTypes.TEXT, allowNull: true },
    keywords: { type: DataTypes.TEXT, allowNull: true },
    ogTitle: { type: DataTypes.STRING(255), allowNull: true },
    ogDescription: { type: DataTypes.TEXT, allowNull: true },
    headerScript: { type: DataTypes.TEXT, allowNull: true },
    footerScript: { type: DataTypes.TEXT, allowNull: true },

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
// 16. TESTIMONIAL MODEL (HOMEPAGE)
// ==========================================
export class Testimonial extends Model<InferAttributes<Testimonial>, InferCreationAttributes<Testimonial>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare role: string;
  declare content: string;
  declare avatar: CreationOptional<string | null>;
  declare rating: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Testimonial.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    avatar: { type: DataTypes.STRING(1024), allowNull: true },
    rating: { type: DataTypes.INTEGER, defaultValue: 5 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Testimonial', tableName: 'testimonials' }
);

// ==========================================
// 17. FAQ MODEL (HOMEPAGE)
// ==========================================
export class Faq extends Model<InferAttributes<Faq>, InferCreationAttributes<Faq>> {
  declare id: CreationOptional<string>;
  declare question: string;
  declare answer: string;
  declare order: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Faq.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    question: { type: DataTypes.STRING, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Faq', tableName: 'faqs' }
);

// ==========================================
// 18. GALLERY ITEM MODEL (SUCCESS STORIES & REVIEWS)
// ==========================================
export class GalleryItem extends Model<InferAttributes<GalleryItem>, InferCreationAttributes<GalleryItem>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare mediaType: 'IMAGE' | 'VIDEO';
  declare mediaUrl: string;
  declare thumbnailUrl: CreationOptional<string | null>;
  declare studentName: CreationOptional<string | null>;
  declare courseName: CreationOptional<string | null>;
  declare companyPlaced: CreationOptional<string | null>;
  declare salaryPackage: CreationOptional<string | null>;
  declare rating: CreationOptional<number>;
  declare category: CreationOptional<string>;
  declare order: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

GalleryItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    mediaType: { type: DataTypes.ENUM('IMAGE', 'VIDEO'), allowNull: false, defaultValue: 'IMAGE' },
    mediaUrl: { type: DataTypes.STRING(1024), allowNull: false },
    thumbnailUrl: { type: DataTypes.STRING(1024), allowNull: true },
    studentName: { type: DataTypes.STRING(255), allowNull: true },
    courseName: { type: DataTypes.STRING(255), allowNull: true },
    companyPlaced: { type: DataTypes.STRING(255), allowNull: true },
    salaryPackage: { type: DataTypes.STRING(100), allowNull: true },
    rating: { type: DataTypes.INTEGER, defaultValue: 5 },
    category: { type: DataTypes.STRING(100), defaultValue: 'SUCCESS_STORY' },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'GalleryItem', tableName: 'gallery_items' }
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

// TutorAvailability has many TutorSlotBookings (Up to 100 students)
TutorAvailability.hasMany(TutorSlotBooking, { as: 'bookings', foreignKey: 'slotId', onDelete: 'CASCADE' });
TutorSlotBooking.belongsTo(TutorAvailability, { as: 'slot', foreignKey: 'slotId' });

// User has many TutorSlotBookings
User.hasMany(TutorSlotBooking, { as: 'slotBookings', foreignKey: 'studentId', onDelete: 'CASCADE' });
TutorSlotBooking.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

// User has many BlogPosts
User.hasMany(BlogPost, { as: 'blogPosts', foreignKey: 'authorId', onDelete: 'CASCADE' });
BlogPost.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// Package & User (Tutors) Many-to-Many
Package.belongsToMany(User, { through: PackageTutor, as: 'assignedTutors', foreignKey: 'packageId' });
User.belongsToMany(Package, { through: PackageTutor, as: 'assignedPackages', foreignKey: 'tutorId' });
Package.hasMany(PackageTutor, { as: 'packageTutors', foreignKey: 'packageId', onDelete: 'CASCADE' });
PackageTutor.belongsTo(Package, { foreignKey: 'packageId' });
User.hasMany(PackageTutor, { as: 'tutorPackages', foreignKey: 'tutorId', onDelete: 'CASCADE' });
PackageTutor.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });

// ClassSchedule
Package.hasMany(ClassSchedule, { as: 'schedules', foreignKey: 'packageId', onDelete: 'CASCADE' });
ClassSchedule.belongsTo(Package, { as: 'package', foreignKey: 'packageId' });
User.hasMany(ClassSchedule, { as: 'tutorSchedules', foreignKey: 'tutorId', onDelete: 'CASCADE' });
ClassSchedule.belongsTo(User, { as: 'tutor', foreignKey: 'tutorId' });
ClassSchedule.hasMany(LiveClass, { as: 'liveClasses', foreignKey: 'scheduleId', onDelete: 'SET NULL' });
LiveClass.belongsTo(ClassSchedule, { as: 'schedule', foreignKey: 'scheduleId' });

// ClassAttendance
Enrollment.hasMany(ClassAttendance, { as: 'attendances', foreignKey: 'enrollmentId', onDelete: 'CASCADE' });
ClassAttendance.belongsTo(Enrollment, { foreignKey: 'enrollmentId' });
LiveClass.hasMany(ClassAttendance, { as: 'attendances', foreignKey: 'liveClassId', onDelete: 'CASCADE' });
ClassAttendance.belongsTo(LiveClass, { foreignKey: 'liveClassId' });
User.hasMany(ClassAttendance, { as: 'attendances', foreignKey: 'studentId', onDelete: 'CASCADE' });
ClassAttendance.belongsTo(User, { as: 'student', foreignKey: 'studentId' });


