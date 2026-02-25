export class Teaching {
    id: number;
    subjectName: string;
    teacherName: string;
    studentId: number;
    grade: number;
    date: Date;

    constructor(
        id: number,
        subjectName: string,
        teacherName: string,
        studentId: number,
        grade: number,
        date: Date
    ) {
        this.id = id;
        this.subjectName = subjectName;
        this.teacherName = teacherName;
        this.studentId = studentId;
        this.grade = grade;
        this.date = date;
    }
}