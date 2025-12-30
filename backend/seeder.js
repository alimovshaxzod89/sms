const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');

// Load models
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Parent = require('./models/Parent');
const Subject = require('./models/Subject');
const Class = require('./models/Class');
const Grade = require('./models/Grade');
const Lesson = require('./models/Lesson');
const Exam = require('./models/Exam');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await Teacher.deleteMany();
    await Student.deleteMany();
    await Parent.deleteMany();
    await Subject.deleteMany();
    await Class.deleteMany();
    await Grade.deleteMany();
    await Lesson.deleteMany();
    await Exam.deleteMany();

    console.log('Data cleared...');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Grades
    const grades = await Grade.insertMany([
      { level: 1 },
      { level: 2 },
      { level: 3 },
      { level: 4 },
      { level: 5 },
      { level: 6 }
    ]);

    console.log('Grades created...');

    // Create Subjects
    const subjects = await Subject.insertMany([
      { name: 'Mathematics' },
      { name: 'English' },
      { name: 'Physics' },
      { name: 'Chemistry' },
      { name: 'Biology' },
      { name: 'History' },
      { name: 'Geography' },
      { name: 'Computer Science' }
    ]);

    console.log('Subjects created...');

    // Create Teachers
    const teachers = await Teacher.insertMany([
      {
        id: 'teacher1',
        username: 'johndoe',
        password: hashedPassword,
        name: 'John',
        surname: 'Doe',
        email: 'john@school.com',
        phone: '+998901234567',
        address: '123 Main St, Tashkent',
        bloodType: 'A+',
        birthday: new Date('1985-05-15'),
        sex: 'male',
        img: 'https://via.placeholder.com/150'
      },
      {
        id: 'teacher2',
        username: 'janesmith',
        password: hashedPassword,
        name: 'Jane',
        surname: 'Smith',
        email: 'jane@school.com',
        phone: '+998901234568',
        address: '456 Oak Ave, Tashkent',
        bloodType: 'B+',
        birthday: new Date('1988-08-20'),
        sex: 'female',
        img: 'https://via.placeholder.com/150'
      },
      {
        id: 'teacher3',
        username: 'mikejohnson',
        password: hashedPassword,
        name: 'Mike',
        surname: 'Johnson',
        email: 'mike@school.com',
        phone: '+998901234569',
        address: '789 Pine Rd, Tashkent',
        bloodType: 'O+',
        birthday: new Date('1990-03-10'),
        sex: 'male',
        img: 'https://via.placeholder.com/150'
      }
    ]);

    console.log('Teachers created...');

    // Create Classes
    const classes = await Class.insertMany([
      {
        name: '1A',
        capacity: 30,
        gradeId: grades[0]._id,
        supervisorId: teachers[0].id
      },
      {
        name: '1B',
        capacity: 30,
        gradeId: grades[0]._id,
        supervisorId: teachers[1].id
      },
      {
        name: '2A',
        capacity: 28,
        gradeId: grades[1]._id,
        supervisorId: teachers[2].id
      },
      {
        name: '3A',
        capacity: 25,
        gradeId: grades[2]._id,
        supervisorId: teachers[0].id
      }
    ]);

    console.log('Classes created...');

    // Create Parents
    const parents = await Parent.insertMany([
      {
        id: 'parent1',
        username: 'parent1',
        password: hashedPassword,
        name: 'Robert',
        surname: 'Williams',
        email: 'robert@parent.com',
        phone: '+998901234570',
        address: '111 Family St, Tashkent'
      },
      {
        id: 'parent2',
        username: 'parent2',
        password: hashedPassword,
        name: 'Sarah',
        surname: 'Brown',
                email: 'sarah@parent.com',
        phone: '+998901234571',
        address: '222 Family Ave, Tashkent'
      },
      {
        id: 'parent3',
        username: 'parent3',
        password: hashedPassword,
        name: 'David',
        surname: 'Miller',
        email: 'david@parent.com',
        phone: '+998901234572',
        address: '333 Family Rd, Tashkent'
      }
    ]);

    console.log('Parents created...');

    // Create Students
    const students = await Student.insertMany([
      {
        id: 'student1',
        username: 'student1',
        password: hashedPassword,
        name: 'Alex',
        surname: 'Williams',
        email: 'alex@student.com',
        phone: '+998901234580',
        address: '111 Family St, Tashkent',
        bloodType: 'A+',
        birthday: new Date('2010-01-15'),
        sex: 'male',
        gradeId: grades[0]._id,
        classId: classes[0]._id,
        parentId: parents[0].id,
        img: 'https://via.placeholder.com/150'
      },
      {
        id: 'student2',
        username: 'student2',
        password: hashedPassword,
        name: 'Emma',
        surname: 'Brown',
        email: 'emma@student.com',
        phone: '+998901234581',
        address: '222 Family Ave, Tashkent',
        bloodType: 'B+',
        birthday: new Date('2010-03-20'),
        sex: 'female',
        gradeId: grades[0]._id,
        classId: classes[0]._id,
        parentId: parents[1].id,
        img: 'https://via.placeholder.com/150'
      },
      {
        id: 'student3',
        username: 'student3',
        password: hashedPassword,
        name: 'Oliver',
        surname: 'Miller',
        email: 'oliver@student.com',
        phone: '+998901234582',
        address: '333 Family Rd, Tashkent',
        bloodType: 'O+',
        birthday: new Date('2009-05-10'),
        sex: 'male',
        gradeId: grades[1]._id,
        classId: classes[2]._id,
        parentId: parents[2].id,
        img: 'https://via.placeholder.com/150'
      },
      {
        id: 'student4',
        username: 'student4',
        password: hashedPassword,
        name: 'Sophia',
        surname: 'Davis',
        email: 'sophia@student.com',
        phone: '+998901234583',
        address: '444 Student St, Tashkent',
        bloodType: 'AB+',
        birthday: new Date('2010-07-25'),
        sex: 'female',
        gradeId: grades[0]._id,
        classId: classes[1]._id,
        parentId: parents[0].id,
        img: 'https://via.placeholder.com/150'
      },
      {
        id: 'student5',
        username: 'student5',
        password: hashedPassword,
        name: 'James',
        surname: 'Wilson',
        email: 'james@student.com',
        phone: '+998901234584',
        address: '555 Student Ave, Tashkent',
        bloodType: 'A-',
        birthday: new Date('2008-09-30'),
        sex: 'male',
        gradeId: grades[2]._id,
        classId: classes[3]._id,
        parentId: parents[1].id,
        img: 'https://via.placeholder.com/150'
      },
      {
        id: 'student6',
        username: 'student6',
        password: 'password123',
        name: 'James',
        surname: 'Wilson',
        email: 'james@student.com',
        phone: '+998901234584',
        address: '555 Student Ave, Tashkent',
        bloodType: 'A-',
        birthday: new Date('2008-09-30'),
        sex: 'male',
        gradeId: grades[2]._id,
        classId: classes[3]._id,
        parentId: parents[1].id,
        img: 'https://via.placeholder.com/150'
      }
    ]);

    console.log('Students created...');

    // Create Lessons
    const lessons = await Lesson.insertMany([
      {
        name: 'Math 101',
        day: 'MONDAY',
        startTime: '08:00',
        endTime: '09:00',
        subjectId: subjects[0]._id,
        classId: classes[0]._id,
        teacherId: teachers[0].id
      },
      {
        name: 'English 101',
        day: 'MONDAY',
        startTime: '09:00',
        endTime: '10:00',
        subjectId: subjects[1]._id,
        classId: classes[0]._id,
        teacherId: teachers[1].id
      },
      {
        name: 'Physics 101',
        day: 'TUESDAY',
        startTime: '08:00',
        endTime: '09:00',
        subjectId: subjects[2]._id,
        classId: classes[2]._id,
        teacherId: teachers[2].id
      },
      {
        name: 'Chemistry 101',
        day: 'WEDNESDAY',
        startTime: '10:00',
        endTime: '11:00',
        subjectId: subjects[3]._id,
        classId: classes[3]._id,
        teacherId: teachers[0].id
      },
      {
        name: 'Biology 101',
        day: 'THURSDAY',
        startTime: '08:00',
        endTime: '09:00',
        subjectId: subjects[4]._id,
        classId: classes[1]._id,
        teacherId: teachers[1].id
      }
    ]);

    console.log('Lessons created...');

    // Create Exams
    const exams = await Exam.insertMany([
      {
        title: 'Math Midterm Exam',
        startTime: new Date('2024-03-15T09:00:00'),
        endTime: new Date('2024-03-15T11:00:00'),
        lessonId: lessons[0]._id
      },
      {
        title: 'English Final Exam',
        startTime: new Date('2024-06-20T10:00:00'),
        endTime: new Date('2024-06-20T12:00:00'),
        lessonId: lessons[1]._id
      },
      {
        title: 'Physics Quiz',
        startTime: new Date('2024-02-10T08:00:00'),
        endTime: new Date('2024-02-10T09:00:00'),
        lessonId: lessons[2]._id
      },
      {
        title: 'Chemistry Lab Test',
        startTime: new Date('2024-04-05T10:00:00'),
        endTime: new Date('2024-04-05T11:30:00'),
        lessonId: lessons[3]._id
      },
      {
        title: 'Biology Practical Exam',
        startTime: new Date('2024-05-12T09:00:00'),
        endTime: new Date('2024-05-12T10:30:00'),
        lessonId: lessons[4]._id
      }
    ]);

    console.log('Exams created...');

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Teacher.deleteMany();
    await Student.deleteMany();
    await Parent.deleteMany();
    await Subject.deleteMany();
    await Class.deleteMany();
    await Grade.deleteMany();
    await Lesson.deleteMany();
    await Exam.deleteMany();

    console.log('✅ Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error destroying data:', error);
    process.exit(1);
  }
};

// Run seeder
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import or -d to delete data');
  process.exit();
}