import Emotion from '../models/Emotion.js';
import Student from '../models/Student.js';

// @desc    Submit emotion
// @route   POST /api/emotions
// @access  Private (Student)
export const submitEmotion = async (req, res) => {
  try {
    const { emotion, message } = req.body;

    if (!emotion) {
      return res.status(400).json({ message: 'Vui lòng chọn cảm xúc' });
    }

    // Check if student has already submitted in the last 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentSubmission = await Emotion.findOne({
      studentId: req.user._id,
      date: { $gte: twentyFourHoursAgo }
    }).sort({ date: -1 });

    if (recentSubmission) {
      const timeUntilNext = new Date(recentSubmission.date.getTime() + 24 * 60 * 60 * 1000);
      const hoursLeft = Math.ceil((timeUntilNext - now) / (1000 * 60 * 60));
      
      return res.status(429).json({ 
        message: `Bạn đã gửi cảm xúc trong 24 giờ qua. Vui lòng đợi ${hoursLeft} giờ nữa để gửi lại.`,
        canSubmitAt: timeUntilNext,
        hoursLeft: hoursLeft
      });
    }

    // Create emotion record
    const emotionRecord = await Emotion.create({
      studentId: req.user._id,
      emotion,
      message: message || '',
      date: new Date()
    });

    // Award points to student (e.g., 10 points per submission)
    await Student.findByIdAndUpdate(req.user._id, {
      $inc: { points: 10 }
    });

    const populatedEmotion = await Emotion.findById(emotionRecord._id)
      .populate('studentId', 'name studentId');

    res.status(201).json({
      emotion: populatedEmotion,
      message: 'Gửi cảm xúc thành công! Bạn nhận được 10 điểm! 🌟'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Get emotions for a class
// @route   GET /api/emotions/class/:classId
// @access  Private (Teacher)
export const getEmotionsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if teacher has access to this class
    if (req.user.role === 'teacher' && !req.user.classIds.some(id => id.toString() === classId)) {
      return res.status(403).json({ message: 'Not authorized to access this class' });
    }

    // Get all students in class
    const students = await Student.find({ classId }).select('_id');
    const studentIds = students.map(s => s._id);

    // Build query
    let query = { studentId: { $in: studentIds } };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const emotions = await Emotion.find(query)
      .populate('studentId', 'name studentId')
      .sort({ date: -1 });

    res.json(emotions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if student submitted emotion today
// @route   GET /api/emotions/check/:studentId
// @access  Private (Teacher/Student)
export const checkTodaySubmission = async (req, res) => {
  try {
    const { studentId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const emotion = await Emotion.findOne({
      studentId,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json({ submitted: !!emotion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's emotion history
// @route   GET /api/emotions/student/:studentId
// @access  Private (Student/Teacher)
export const getStudentEmotions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 30 } = req.query;

    const emotions = await Emotion.find({ studentId })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json(emotions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
