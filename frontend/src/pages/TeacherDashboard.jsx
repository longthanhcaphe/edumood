import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { EmotionPieChart, EmotionBarChart, WeeklyTrendChart } from '../components/Charts';
import AIInsightBox from '../components/AIInsightBox';
import { 
  Users, Plus, Trash2, Edit2, FileText, TrendingUp, CheckCircle, XCircle,
  Calendar, BarChart3, Sparkles, UserPlus, Save, X, Search, Filter
} from 'lucide-react';
import {
  getStudentsByClass,
  createStudent,
  updateStudent,
  deleteStudent,
  getClassAnalytics,
  getAIAnalysis,
  checkTodaySubmission,
  getAllClasses
} from '../utils/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const [studentForm, setStudentForm] = useState({
    studentId: '',
    name: '',
    password: ''
  });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
      loadAnalytics();
      checkStudentSubmissions();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const allClasses = await getAllClasses();
      const teacherClasses = allClasses.filter(c => 
        user.classIds.includes(c._id)
      );
      setClasses(teacherClasses);
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]._id);
      }
    } catch (error) {
      console.error('Không thể tải danh sách lớp:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await getStudentsByClass(selectedClass);
      setStudents(data);
    } catch (error) {
      console.error('Không thể tải học sinh:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await getClassAnalytics(selectedClass);
      setAnalytics(data);
    } catch (error) {
      console.error('Không thể tải phân tích:', error);
    }
  };

  const checkStudentSubmissions = async () => {
    try {
      const data = await getStudentsByClass(selectedClass);
      const status = {};
      
      for (const student of data) {
        const result = await checkTodaySubmission(student._id);
        status[student._id] = result.submitted;
      }
      
      setSubmissionStatus(status);
    } catch (error) {
      console.error('Không thể kiểm tra trạng thái:', error);
    }
  };

  const handleAIAnalysis = async () => {
    setLoadingAI(true);
    try {
      const data = await getAIAnalysis(selectedClass);
      setAiAnalysis(data);
    } catch (error) {
      console.error('Lỗi phân tích AI:', error);
      alert('Không thể phân tích AI. Vui lòng kiểm tra OpenAI API key.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await createStudent({
        ...studentForm,
        classId: selectedClass
      });
      setShowStudentForm(false);
      setStudentForm({ studentId: '', name: '', password: '' });
      loadStudents();
      alert('Tạo học sinh thành công!');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể tạo học sinh');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await updateStudent(editingStudent._id, {
        name: studentForm.name,
        password: studentForm.password || undefined
      });
      setEditingStudent(null);
      setStudentForm({ studentId: '', name: '', password: '' });
      loadStudents();
      alert('Cập nhật học sinh thành công!');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể cập nhật học sinh');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa học sinh này?')) {
      try {
        await deleteStudent(id);
        loadStudents();
        alert('Xóa học sinh thành công!');
      } catch (error) {
        alert(error.response?.data?.message || 'Không thể xóa học sinh');
      }
    }
  };

  const startEdit = (student) => {
    setEditingStudent(student);
    setStudentForm({
      studentId: student.studentId,
      name: student.name,
      password: ''
    });
    setShowStudentForm(true);
  };

  const cancelForm = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
    setStudentForm({ studentId: '', name: '', password: '' });
  };

  const exportPDF = async () => {
    try {
      const className = classes.find(c => c._id === selectedClass)?.name || 'Lớp';
      
      // Tạo HTML content cho PDF
      const pdfContent = document.createElement('div');
      pdfContent.style.width = '794px'; // A4 width in pixels (210mm)
      pdfContent.style.padding = '40px';
      pdfContent.style.backgroundColor = '#ffffff';
      pdfContent.style.fontFamily = '"Segoe UI", Arial, "Helvetica Neue", sans-serif';
      pdfContent.style.color = '#000000';
      pdfContent.style.lineHeight = '1.6';
      
      // Header
      const header = document.createElement('div');
      header.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
      header.style.padding = '30px';
      header.style.marginBottom = '30px';
      header.style.borderRadius = '10px';
      header.style.color = '#ffffff';
      header.style.textAlign = 'center';
      header.innerHTML = `
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; margin-bottom: 10px;">
          📊 BÁO CÁO CẢM XÚC HỌC SINH
        </h1>
        <p style="margin: 5px 0; font-size: 16px;">Lớp: ${className}</p>
        <p style="margin: 5px 0; font-size: 14px;">Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}</p>
      `;
      pdfContent.appendChild(header);

      // Tổng quan
      if (analytics) {
        const overviewSection = document.createElement('div');
        overviewSection.style.marginBottom = '30px';
        
        const overviewTitle = document.createElement('h2');
        overviewTitle.style.fontSize = '24px';
        overviewTitle.style.fontWeight = 'bold';
        overviewTitle.style.marginBottom = '20px';
        overviewTitle.style.color = '#1f2937';
        overviewTitle.textContent = '📊 TỔNG QUAN';
        overviewSection.appendChild(overviewTitle);

        // Stats grid
        const statsGrid = document.createElement('div');
        statsGrid.style.display = 'grid';
        statsGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
        statsGrid.style.gap = '15px';
        statsGrid.style.marginBottom = '20px';

        const emotionStats = [
          { emotion: 'happy', label: 'Vui vẻ', emoji: '😊', color: '#fcd34d', bgColor: '#fef3c7' },
          { emotion: 'sad', label: 'Buồn', emoji: '😔', color: '#60a5fa', bgColor: '#dbeafe' },
          { emotion: 'angry', label: 'Giận dữ', emoji: '😡', color: '#ef4444', bgColor: '#fee2e2' },
          { emotion: 'tired', label: 'Mệt mỏi', emoji: '😴', color: '#a78bfa', bgColor: '#ede9fe' },
          { emotion: 'neutral', label: 'Bình thường', emoji: '😐', color: '#94a3b8', bgColor: '#f1f5f9' }
        ];

        emotionStats.forEach(stat => {
          const count = analytics.emotionDistribution[stat.emotion] || 0;
          const statBox = document.createElement('div');
          statBox.style.backgroundColor = stat.bgColor;
          statBox.style.border = `2px solid ${stat.color}`;
          statBox.style.borderRadius = '12px';
          statBox.style.padding = '20px';
          statBox.style.textAlign = 'center';
          statBox.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 10px;">${stat.emoji}</div>
            <div style="font-size: 32px; font-weight: bold; color: ${stat.color}; margin-bottom: 5px;">${count}</div>
            <div style="font-size: 14px; color: #4b5563; font-weight: 500;">${stat.label}</div>
          `;
          statsGrid.appendChild(statBox);
        });

        overviewSection.appendChild(statsGrid);

        // Thông tin thêm
        const totalEmotions = Object.values(analytics.emotionDistribution).reduce((sum, count) => sum + count, 0);
        const infoDiv = document.createElement('div');
        infoDiv.style.backgroundColor = '#f9fafb';
        infoDiv.style.borderRadius = '8px';
        infoDiv.style.padding = '15px';
        infoDiv.style.fontSize = '14px';
        infoDiv.style.color = '#374151';
        infoDiv.innerHTML = `
          <p style="margin: 5px 0;"><strong>📈 Tổng số lượt gửi:</strong> ${totalEmotions}</p>
          <p style="margin: 5px 0;"><strong>✅ Tỷ lệ gửi hôm nay:</strong> ${submissionRate}% (${submittedCount}/${students.length} học sinh)</p>
        `;
        overviewSection.appendChild(infoDiv);

        pdfContent.appendChild(overviewSection);
      }

      // Phân tích AI
      if (aiAnalysis && aiAnalysis.summary) {
        const aiSection = document.createElement('div');
        aiSection.style.marginBottom = '30px';
        aiSection.style.pageBreakInside = 'avoid';
        
        const aiTitle = document.createElement('h2');
        aiTitle.style.fontSize = '24px';
        aiTitle.style.fontWeight = 'bold';
        aiTitle.style.marginBottom = '20px';
        aiTitle.style.color = '#1f2937';
        aiTitle.textContent = '🤖 PHÂN TÍCH AI';
        aiSection.appendChild(aiTitle);

        // Parse và format AI summary thành HTML đẹp hơn
        const aiText = aiAnalysis.summary;
        const aiBox = document.createElement('div');
        aiBox.style.backgroundColor = '#f9fafb';
        aiBox.style.borderLeft = '4px solid #8b5cf6';
        aiBox.style.borderRadius = '8px';
        aiBox.style.padding = '25px';
        aiBox.style.fontSize = '14px';
        aiBox.style.lineHeight = '1.8';
        aiBox.style.color = '#1f2937';
        aiBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        
        // Format text: convert markdown-style headers and lists to HTML
        let formattedText = aiText
          // Convert ### headers
          .replace(/###\s+(.+)/g, '<h3 style="font-size: 18px; font-weight: bold; color: #8b5cf6; margin-top: 20px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb;">$1</h3>')
          // Convert **bold**
          .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #4b5563; font-weight: 600;">$1</strong>')
          // Convert numbered lists (1. 2. 3.)
          .replace(/(\d+\.\s+)(.+)/g, '<div style="margin: 12px 0; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #8b5cf6; font-weight: bold;">$1</span><span style="display: block; margin-left: 25px;">$2</span></div>')
          // Convert bullet points (- or •)
          .replace(/^[-•]\s+(.+)$/gm, '<div style="margin: 8px 0; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #8b5cf6;">•</span><span style="display: block; margin-left: 15px;">$1</span></div>');
        
        // Split by double line breaks to create paragraphs
        const paragraphs = formattedText.split(/\n\n+/).filter(p => p.trim());
        paragraphs.forEach((para, index) => {
          const p = document.createElement('div');
          p.style.marginBottom = index < paragraphs.length - 1 ? '15px' : '0';
          p.innerHTML = para.trim();
          aiBox.appendChild(p);
        });

        aiSection.appendChild(aiBox);
        pdfContent.appendChild(aiSection);
      }

      // Bảng chi tiết
      if (analytics) {
        const tableSection = document.createElement('div');
        tableSection.style.marginBottom = '30px';
        
        const tableTitle = document.createElement('h2');
        tableTitle.style.fontSize = '24px';
        tableTitle.style.fontWeight = 'bold';
        tableTitle.style.marginBottom = '15px';
        tableTitle.style.color = '#1f2937';
        tableTitle.textContent = '📈 CHI TIẾT PHÂN BỐ';
        tableSection.appendChild(tableTitle);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.borderRadius = '8px';
        table.style.overflow = 'hidden';
        table.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

        // Table header
        const thead = document.createElement('thead');
        thead.style.backgroundColor = '#8b5cf6';
        thead.style.color = '#ffffff';
        thead.innerHTML = `
          <tr>
            <th style="padding: 12px; text-align: left; font-weight: bold;">Cảm xúc</th>
            <th style="padding: 12px; text-align: center; font-weight: bold;">Số lượt</th>
            <th style="padding: 12px; text-align: right; font-weight: bold;">Tỷ lệ</th>
          </tr>
        `;
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');
        const totalCount = Object.values(analytics.emotionDistribution).reduce((sum, count) => sum + count, 0);
        const emotionLabels = {
          happy: '😊 Vui vẻ',
          neutral: '😐 Bình thường',
          sad: '😔 Buồn',
          angry: '😡 Giận dữ',
          tired: '😴 Mệt mỏi'
        };

        Object.entries(analytics.emotionDistribution)
          .sort(([, a], [, b]) => b - a)
          .forEach(([emotion, count], index) => {
            const row = document.createElement('tr');
            row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
            const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
            row.innerHTML = `
              <td style="padding: 12px; font-size: 14px; font-weight: 500;">${emotionLabels[emotion] || emotion}</td>
              <td style="padding: 12px; text-align: center; font-size: 14px;">${count}</td>
              <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold; color: #8b5cf6;">${percentage}%</td>
            `;
            tbody.appendChild(row);
          });

        table.appendChild(tbody);
        tableSection.appendChild(table);
        pdfContent.appendChild(tableSection);
      }

      // Footer
      const footer = document.createElement('div');
      footer.style.marginTop = '40px';
      footer.style.paddingTop = '20px';
      footer.style.borderTop = '2px solid #e5e7eb';
      footer.style.textAlign = 'center';
      footer.style.fontSize = '12px';
      footer.style.color = '#6b7280';
      footer.textContent = 'Trường Cảm Xúc - Hệ thống theo dõi cảm xúc học sinh';
      pdfContent.appendChild(footer);

      // Append to body temporarily
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      document.body.appendChild(pdfContent);

      // Convert to canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        removeContainer: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied in cloned document
          const clonedElement = clonedDoc.querySelector('body').lastChild;
          if (clonedElement) {
            clonedElement.style.fontFamily = '"Segoe UI", Arial, "Helvetica Neue", sans-serif';
          }
        }
      });

      // Remove temp element
      document.body.removeChild(pdfContent);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const fileName = `bao-cao-${className.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('Không thể xuất PDF. Vui lòng thử lại sau.');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Tổng Quan', icon: BarChart3 },
    { id: 'students', label: 'Học Sinh', icon: Users },
    { id: 'analytics', label: 'Phân Tích', icon: TrendingUp },
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const submittedCount = Object.values(submissionStatus).filter(Boolean).length;
  const submissionRate = students.length > 0 
    ? Math.round((submittedCount / students.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen pb-8">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Bảng Điều Khiển Giáo Viên
          </h1>
          <p className="text-white/70">Quản lý và theo dõi cảm xúc học sinh</p>
        </motion.div>

        {/* Class Selector & Quick Actions */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="lg:col-span-2 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-white/80 mb-2 text-sm font-medium">
                  Chọn Lớp
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="input-field"
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id} className="bg-gray-800">
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAIAnalysis}
                  disabled={loadingAI}
                  className="btn-primary flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {loadingAI ? 'Đang phân tích...' : 'AI Phân Tích'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportPDF}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Xuất PDF
                </motion.button>
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats */}
          <GlassCard className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {submissionRate}%
              </div>
              <div className="text-white/70 text-sm">Tỷ lệ gửi hôm nay</div>
              <div className="mt-2 text-white/60 text-xs">
                {submittedCount}/{students.length} học sinh
              </div>
            </div>
          </GlassCard>
        </div>

        {/* AI Insights */}
        <AnimatePresence>
          {(aiAnalysis || loadingAI) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <AIInsightBox analysis={aiAnalysis} loading={loadingAI} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="mb-6">
          <GlassCard className="p-2">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 py-3 px-4 rounded-xl font-semibold transition-all
                      flex items-center justify-center gap-2
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-6 text-center bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                  <div className="text-4xl mb-2">😊</div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.emotionDistribution.happy}
                  </div>
                  <div className="text-white/70 text-sm">Vui vẻ</div>
                </GlassCard>

                <GlassCard className="p-6 text-center bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                  <div className="text-4xl mb-2">😔</div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.emotionDistribution.sad}
                  </div>
                  <div className="text-white/70 text-sm">Buồn</div>
                </GlassCard>

                <GlassCard className="p-6 text-center bg-gradient-to-br from-red-500/20 to-red-600/20">
                  <div className="text-4xl mb-2">😡</div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.emotionDistribution.angry}
                  </div>
                  <div className="text-white/70 text-sm">Giận dữ</div>
                </GlassCard>

                <GlassCard className="p-6 text-center bg-gradient-to-br from-indigo-500/20 to-indigo-600/20">
                  <div className="text-4xl mb-2">😴</div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.emotionDistribution.tired}
                  </div>
                  <div className="text-white/70 text-sm">Mệt mỏi</div>
                </GlassCard>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    Phân Bố Cảm Xúc
                  </h3>
                  <EmotionPieChart data={analytics.emotionDistribution} />
                </GlassCard>

                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Số Lượng Theo Loại
                  </h3>
                  <EmotionBarChart data={analytics.emotionDistribution} />
                </GlassCard>
              </div>

              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Xu Hướng Theo Tuần
                </h3>
                <WeeklyTrendChart data={analytics.dailyTrends} />
              </GlassCard>
            </motion.div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <GlassCard>
                {/* Header with Search */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-7 h-7" />
                        Học Sinh ({students.length})
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="input-field pl-10 pr-4"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowStudentForm(!showStudentForm)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        Thêm Học Sinh
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Student Form */}
                <AnimatePresence>
                  {showStudentForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6 border-b border-white/10 bg-white/5"
                    >
                      <form
                        onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent}
                        className="space-y-4"
                      >
                        <h4 className="text-white font-semibold text-lg mb-4">
                          {editingStudent ? 'Sửa Học Sinh' : 'Thêm Học Sinh Mới'}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {!editingStudent && (
                            <input
                              type="text"
                              placeholder="Mã học sinh"
                              value={studentForm.studentId}
                              onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                              className="input-field"
                              required
                            />
                          )}

                          <input
                            type="text"
                            placeholder="Họ tên"
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            className="input-field"
                            required
                          />

                          <input
                            type="password"
                            placeholder={editingStudent ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                            value={studentForm.password}
                            onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                            className="input-field"
                            required={!editingStudent}
                          />
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn-primary flex items-center gap-2"
                          >
                            <Save className="w-5 h-5" />
                            {editingStudent ? 'Cập Nhật' : 'Tạo'}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={cancelForm}
                            className="btn-secondary flex items-center gap-2"
                          >
                            <X className="w-5 h-5" />
                            Hủy
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Student List */}
                <div className="p-6">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/70">
                        {searchTerm ? 'Không tìm thấy học sinh' : 'Chưa có học sinh nào'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredStudents.map((student) => (
                        <motion.div
                          key={student._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -5 }}
                          className="glass-card p-4 rounded-xl"
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {getInitials(student.name)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold truncate">
                                {student.name}
                              </h4>
                              <p className="text-white/60 text-sm">
                                Mã: {student.studentId}
                              </p>

                              {/* Status Badge */}
                              <div className="mt-2">
                                {submissionStatus[student._id] ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">
                                    <CheckCircle className="w-3 h-3" />
                                    Đã gửi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs">
                                    <XCircle className="w-3 h-3" />
                                    Chưa gửi
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => startEdit(student)}
                                className="p-2 glass-card hover:bg-white/20 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4 text-white" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteStudent(student._id)}
                                className="p-2 glass-card hover:bg-red-500/20 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Thống Kê Chi Tiết
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center glass-card p-4 rounded-xl">
                    <div className="text-3xl font-bold text-white">
                      {analytics.totalEmotions}
                    </div>
                    <div className="text-white/70 text-sm mt-1">
                      Tổng lượt gửi
                    </div>
                  </div>

                  <div className="text-center glass-card p-4 rounded-xl">
                    <div className="text-3xl font-bold text-white">
                      {students.length}
                    </div>
                    <div className="text-white/70 text-sm mt-1">
                      Học sinh
                    </div>
                  </div>

                  <div className="text-center glass-card p-4 rounded-xl">
                    <div className="text-3xl font-bold text-white">
                      {submittedCount}
                    </div>
                    <div className="text-white/70 text-sm mt-1">
                      Đã gửi hôm nay
                    </div>
                  </div>

                  <div className="text-center glass-card p-4 rounded-xl">
                    <div className="text-3xl font-bold text-white">
                      {submissionRate}%
                    </div>
                    <div className="text-white/70 text-sm mt-1">
                      Tỷ lệ tham gia
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-white font-semibold mb-4">
                    Phân Bố Chi Tiết
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(analytics.emotionDistribution).map(([emotion, count]) => {
                      const emotionLabels = {
                        happy: { label: 'Vui vẻ', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
                        neutral: { label: 'Bình thường', emoji: '😐', color: 'from-gray-400 to-gray-500' },
                        sad: { label: 'Buồn', emoji: '😔', color: 'from-blue-400 to-blue-600' },
                        angry: { label: 'Giận dữ', emoji: '😡', color: 'from-red-400 to-red-600' },
                        tired: { label: 'Mệt mỏi', emoji: '😴', color: 'from-purple-400 to-indigo-500' },
                      };
                      const info = emotionLabels[emotion];
                      const percentage = analytics.totalEmotions > 0 
                        ? ((count / analytics.totalEmotions) * 100).toFixed(1) 
                        : 0;

                      return (
                        <div key={emotion} className="flex items-center gap-3">
                          <div className="text-2xl">{info.emoji}</div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-white">{info.label}</span>
                              <span className="text-white/70">{count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full bg-gradient-to-r ${info.color}`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeacherDashboard;
