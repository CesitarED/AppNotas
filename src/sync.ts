import sequelize from './config/database';
import Administrator from './models/Administrator';
import Student from './models/Student';
import { Teacher, Subject, Grade } from './models/Teaching';

const syncDatabase = async () => {
    try {
        // Force models to be loaded
        console.log('📦 Loading models:', Administrator.name, Student.name, Teacher.name, Subject.name, Grade.name);

        await sequelize.authenticate();
        console.log('✅ Database connected!');

        // Force sync for educational/dev purposes
        // WARN: force: true drops all tables before recreating them.
        await sequelize.sync({ force: true });
        console.log('✅ Database synced!');

        // Seed admin user
        await Administrator.create({
            email: 'admin@appnotas.com',
            password: 'admin', // En producción esto debe estar hasheado
            role: 'admin'
        });
        console.log('👤 Admin user created');

        // Seed sample teachers
        const teachers: any = await Promise.all([
            Teacher.create({ name: 'Prof. Garcia', email: 'garcia@school.edu', password: 'password123', role: 'teacher' }),
            Teacher.create({ name: 'Prof. Lopez', email: 'lopez@school.edu', password: 'password123', role: 'teacher' }),
            Teacher.create({ name: 'Prof. Martinez', email: 'martinez@school.edu', password: 'password123', role: 'teacher' })
        ]);
        console.log(`👨‍🏫 ${teachers.length} sample teachers created`);

        // Seed sample subjects
        const subjects: any = await Promise.all([
            Subject.create({ name: 'Matemáticas Avanzadas', teacherId: teachers[0].id }),
            Subject.create({ name: 'Física Universitaria', teacherId: teachers[0].id }),
            Subject.create({ name: 'Historia Mundial', teacherId: teachers[1].id }),
            Subject.create({ name: 'Literatura Contemporánea', teacherId: teachers[1].id }),
            Subject.create({ name: 'Programación Web', teacherId: teachers[2].id }),
            Subject.create({ name: 'Bases de Datos', teacherId: teachers[2].id })
        ]);
        console.log(`📚 ${subjects.length} sample subjects created`);

        // Seed sample students
        const students: any = await Promise.all([
            Student.create({ name: 'Juan Perez', email: 'juan@student.edu', password: 'password123', role: 'student' }),
            Student.create({ name: 'Maria Gomez', email: 'maria@student.edu', password: 'password123', role: 'student' }),
            Student.create({ name: 'Carlos Ruiz', email: 'carlos@student.edu', password: 'password123', role: 'student' }),
            Student.create({ name: 'Ana Silva', email: 'ana@student.edu', password: 'password123', role: 'student' }),
            Student.create({ name: 'Luis Torres', email: 'luis@student.edu', password: 'password123', role: 'student' })
        ]);
        console.log(`👥 ${students.length} sample students created`);

        // Associate students with subjects
        await students[0].addSubjects([subjects[0], subjects[1], subjects[4]]); // Juan
        await students[1].addSubjects([subjects[2], subjects[3], subjects[5]]); // Maria
        await students[2].addSubjects([subjects[0], subjects[4], subjects[5]]); // Carlos
        await students[3].addSubjects([subjects[1], subjects[2], subjects[3]]); // Ana
        await students[4].addSubjects([subjects[0], subjects[1], subjects[2], subjects[3], subjects[4], subjects[5]]); // Luis

        console.log('🔗 Students associated with subjects');

        // Seed some sample grades
        await Promise.all([
            Grade.create({ subjectId: subjects[0].id, studentId: students[0].id, grade: 4.5, description: 'Primer Parcial' }),
            Grade.create({ subjectId: subjects[0].id, studentId: students[0].id, grade: 4.0, description: 'Trabajo Final' }),
            Grade.create({ subjectId: subjects[1].id, studentId: students[0].id, grade: 3.5, description: 'Examen 1' }),

            Grade.create({ subjectId: subjects[2].id, studentId: students[1].id, grade: 5.0, description: 'Ensayo' }),
            Grade.create({ subjectId: subjects[5].id, studentId: students[1].id, grade: 4.8, description: 'Proyecto BD' }),

            Grade.create({ subjectId: subjects[4].id, studentId: students[2].id, grade: 3.0, description: 'Parcial 1' }),
            Grade.create({ subjectId: subjects[5].id, studentId: students[2].id, grade: 3.2, description: 'Quiz 1' })
        ]);

        console.log('📝 Sample grades created');
        console.log('🎉 Database seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

syncDatabase();
