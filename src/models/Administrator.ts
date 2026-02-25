import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Administrator extends Model {
    public id!: number;
    public email!: string;
    public password!: string;
}

Administrator.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
}, {
    sequelize,
    modelName: 'Administrator',
});

export default Administrator;