import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Teacher from './models/Teacher.js';
import Class from './models/Class.js';
import Student from './models/Student.js';
import Reward from './models/Reward.js';

dotenv.config();

const names = [
  'Phan Thùy An',
  'Đỗ Thị Lan Anh',
  'Huỳnh Kim Quỳnh Anh',
  'Trần Hoàng Diệu Anh',
  'Huỳnh Trần Mai Ân',
  'Phạm Quỳnh Chi',
  'Lê Công Hoàng Duy',
  'Huỳnh Ánh Dương',
  'Nguyễn Trần Quốc Đạt',
  'Lê Trần Đức Hải',
  'Đặng Thanh Ngọc Hân',
  'Lê Hoàng Gia Huy',
  'Nguyễn Hưng',
  'Đặng Chí Khang',
  'Trần Thanh Khang',
  'Hồ Trọng Khoa',
  'Mai Trần Đình Khôi',
  'Lê Viết Lam',
  'Trần Quang Long',
  'Ngô Kim Ngân',
  'Nguyễn Ngọc Bảo Nghi',
  'Nguyễn Khánh Ngọc',
  'Nguyễn An Nguyên',
  'Lê Trương Quỳnh Như',
  'Tạ Liên Như',
  'Hồ Ân Phúc',
  'Trần Khánh Phụng',
  'Ngô Thị Thu Phương',
  'Nguyễn Khải Tâm',
  'Nguyễn Thanh Thảo',
  'Phan Nguyễn Diệp Thảo',
  'Phạm Thị Anh Thư',
  'Trần Anh Thư',
  'Phan Dương Cát Tiên',
  'Nguyễn Mai Bảo Trâm',
  'Võ Hoàng Bảo Trâm',
  'Nguyễn Viết Trung',
  'Võ Thị Phương Uyên',
  'Nguyễn Huỳnh Uyên Vy',
  'Nguyên Gia Vỹ'
];

// Convert Vietnamese name to studentId (slug): remove accents, spaces, lowercase
const toStudentId = (fullName) => {
  return fullName
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
};

const importData = async () => {
  try {
    // 1) Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2) Clear collections
    await Admin.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Reward.deleteMany({});
    console.log('🧹 Cleared existing data in Admin, Teacher, Class, Student, Reward');

    // 3) Create Admin
    const adminPassword = await bcrypt.hash('692009', 10);
    await Admin.create({
      name: 'Admin',
      email: 'admin@hdschool.com',
      password: adminPassword
    });
    console.log('👑 Admin created: admin@hdschool.com / 692009');

    // 4) Create Teacher
    const teacherPassword = await bcrypt.hash('692009', 10);
    const teacher = await Teacher.create({
      name: 'Ngọc Tài',
      email: 'ngoctaintss@gmail.com',
      password: teacherPassword,
      classIds: []
    });
    console.log('👩‍🏫 Teacher created: ngoctaintss@gmail.com / 692009');

    // 5) Create Class Lớp 6/2
    const class62 = await Class.create({
      name: 'Lớp 6/2',
      teacherId: teacher._id,
      studentIds: []
    });
    // update teacher
    teacher.classIds.push(class62._id);
    await teacher.save();
    console.log('🏫 Class created: Lớp 6/2 (Ngọc Tài)');

    // 6) Create 40 Students (password 123456)
    const studentPassword = await bcrypt.hash('123456', 10);
    const usedIds = new Set();
    const studentIdsForClass = [];

    for (const fullName of names) {
      let baseId = toStudentId(fullName);
      let finalId = baseId;
      let suffix = 1;
      while (usedIds.has(finalId)) {
        finalId = `${baseId}${suffix++}`;
      }
      usedIds.add(finalId);

      const student = await Student.create({
        studentId: finalId,
        name: fullName,
        password: studentPassword,
        classId: class62._id,
        points: 0
      });
      studentIdsForClass.push(student._id);
    }

    class62.studentIds = studentIdsForClass;
    await class62.save();
    console.log(`👨‍🎓 Created ${studentIdsForClass.length} students for Lớp 6/2`);

    // 7) Create Rewards (2 items)
    await Reward.create([
      {
        name: 'Móc khóa',
        cost: 20,
        description: 'Phần thưởng móc khóa',
        imageUrl: ''
      },
      {
        name: 'Bút chì',
        cost: 10,
        description: 'Phần thưởng bút chì',
        imageUrl: ''
      }
    ]);
    console.log('🎁 Rewards created: Móc khóa, Bút chì');

    // 8) Print login info
    console.log('\n================= ĐĂNG NHẬP MẪU =================');
    console.log('Admin:');
    console.log('  Email: admin@hdschool.com');
    console.log('  Password: 692009');
    console.log('\nGiáo viên:');
    console.log('  Email: ngoctaintss@gmail.com');
    console.log('  Password: 692009');
    console.log('\nHọc sinh (ví dụ):');
    console.log('  ID: thuyan');
    console.log('  Password: 123456');
    console.log('=================================================\n');

    console.log('✅ Import completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Import error:', err);
    process.exit(1);
  }
};

importData();


