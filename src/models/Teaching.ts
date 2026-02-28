import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import Student from "./Student";

// ===== MODELO TEACHER =====
class Teacher extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public role!: string;
}

Teacher.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "teacher",
    },
}, {
    sequelize,
    modelName: 'Teacher',
});

// ===== MODELO SUBJECT (Asignatura) =====
class Subject extends Model {
    public id!: number;
    public name!: string;
    public teacherId!: number;
}

Subject.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Teacher,
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Subject',
});

// ===== MODELO GRADE (Nota de seguimiento) =====
class Grade extends Model {
    public id!: number;
    public subjectId!: number;
    public studentId!: number;
    public grade!: number;
    public description!: string;
    public date!: Date;
}

Grade.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Subject,
            key: 'id',
        },
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Student,
            key: 'id',
        },
    },
    grade: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'Grade',
});

// ===== ASOCIACIONES =====
Teacher.hasMany(Subject, { foreignKey: 'teacherId', as: 'subjects' });
Subject.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

Subject.hasMany(Grade, { foreignKey: 'subjectId', as: 'grades' });
Grade.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Student.hasMany(Grade, { foreignKey: 'studentId', as: 'grades' });
Grade.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.belongsToMany(Subject, { through: 'StudentSubjects', as: 'subjects', foreignKey: 'studentId' });
Subject.belongsToMany(Student, { through: 'StudentSubjects', as: 'students', foreignKey: 'subjectId' });

export { Teacher, Subject, Grade };