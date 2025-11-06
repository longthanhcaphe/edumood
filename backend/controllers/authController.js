import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Login user (Student/Teacher/Admin)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    let user;
    let Model;

    // Determine which model to use based on role
    if (role === 'student') {
      user = await Student.findOne({ studentId: identifier });
      Model = Student;
    } else if (role === 'teacher') {
      user = await Teacher.findOne({ email: identifier });
      Model = Teacher;
    } else if (role === 'admin') {
      user = await Admin.findOne({ email: identifier });
      Model = Admin;
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, role);

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      role: role,
      ...(role === 'student' && { 
        studentId: user.studentId, 
        classId: user.classId,
        points: user.points 
      }),
      ...(role === 'teacher' && { 
        email: user.email,
        classIds: user.classIds 
      }),
      ...(role === 'admin' && { 
        email: user.email 
      })
    };

    res.json({
      token,
      user: userData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user info
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      ...(req.user.role === 'student' && { 
        studentId: req.user.studentId,
        classId: req.user.classId,
        points: req.user.points 
      }),
      ...(req.user.role === 'teacher' && { 
        email: req.user.email,
        classIds: req.user.classIds 
      }),
      ...(req.user.role === 'admin' && { 
        email: req.user.email 
      })
    };

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password (Student)
// @route   PUT /api/auth/change-password
// @access  Private (Student)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Only allow students to change password
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Chỉ học sinh mới có thể đổi mật khẩu' });
    }

    // Get full user with password
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy học sinh' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, student.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    student.password = hashedPassword;
    await student.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
