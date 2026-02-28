import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Student extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public role!: string;
}

Student.init({
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
        defaultValue: "student",
    },
}, {
    sequelize,
    modelName: 'Student',
});

export default Student;