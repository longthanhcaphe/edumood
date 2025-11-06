import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import EmojiSelector from '../components/EmojiSelector';
import RewardCard from '../components/RewardCard';
import { Star, Send, Gift, Lock, X } from 'lucide-react';
import { submitEmotion, getAllRewards, redeemReward, changePassword } from '../utils/api';

const StudentDashboard = () => {
  const { user, updateUser } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [showShop, setShowShop] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await getAllRewards();
      setRewards(data);
    } catch (error) {
      console.error('Không thể tải phần thưởng:', error);
    }
  };

  const handleSubmitEmotion = async () => {
    if (!selectedEmotion) {
      alert('Vui lòng chọn cảm xúc!');
      return;
    }

    setSubmitting(true);
    
    try {
      const result = await submitEmotion(selectedEmotion, message);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Update user points
      updateUser({ points: (user.points || 0) + 10 });

      setSuccessMessage(result.message);
      setSelectedEmotion('');
      setMessage('');

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limit error
        const hoursLeft = error.response?.data?.hoursLeft || 0;
        alert(error.response?.data?.message || `Bạn đã gửi cảm xúc trong 24 giờ qua. Vui lòng đợi ${hoursLeft} giờ nữa.`);
      } else {
        alert(error.response?.data?.message || 'Không thể gửi cảm xúc. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeemReward = async (reward) => {
    if (window.confirm(`Đổi "${reward.name}" với ${reward.cost} điểm?`)) {
      try {
        const result = await redeemReward(reward._id);
        updateUser({ points: result.remainingPoints });
        alert(result.message);
      } catch (error) {
        alert(error.response?.data?.message || 'Không thể đổi phần thưởng');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      alert('Đổi mật khẩu thành công!');
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Chào, {user?.name}! 👋
          </h1>
          <div className="flex items-center justify-center gap-2 text-2xl text-white">
            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{user?.points || 0}</span>
            <span className="text-white/80">Điểm Năng Lượng</span>
          </div>
        </motion.div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 max-w-2xl mx-auto"
          >
            <GlassCard className="bg-green-500/20 border-green-400">
              <p className="text-white text-center font-semibold">{successMessage}</p>
            </GlassCard>
          </motion.div>
        )}

        {/* Emotion Submission */}
        <div className="max-w-3xl mx-auto mb-8">
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Hôm nay bạn cảm thấy thế nào?
            </h2>

            <EmojiSelector selected={selectedEmotion} onSelect={setSelectedEmotion} />

            <div className="mt-6">
              <label className="block text-white mb-2 font-medium">
                Bạn muốn chia sẻ thêm gì không? (Không bắt buộc)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field resize-none"
                rows="3"
                placeholder="Chia sẻ những gì bạn đang nghĩ..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitEmotion}
              disabled={submitting || !selectedEmotion}
              className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="spinner w-6 h-6 border-2"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Gửi & Nhận 10 Điểm</span>
                </>
              )}
            </motion.button>
          </GlassCard>
        </div>

        {/* Actions */}
        <div className="text-center mb-6 flex flex-wrap justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShop(!showShop)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Gift className="w-5 h-5" />
            <span>{showShop ? 'Ẩn' : 'Hiện'} Cửa Hàng Quà Tặng</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Lock className="w-5 h-5" />
            <span>Đổi Mật Khẩu</span>
          </motion.button>
        </div>

        {/* Change Password Form */}
        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Đổi Mật Khẩu
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="p-2 glass-card hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-white mb-2 font-medium">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field w-full"
                    required
                    minLength={6}
                  />
                  <p className="text-white/60 text-sm mt-1">Tối thiểu 6 ký tự</p>
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field w-full"
                    required
                    minLength={6}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={changingPassword}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {changingPassword ? (
                    <div className="spinner w-6 h-6 border-2"></div>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Đổi Mật Khẩu</span>
                    </>
                  )}
                </motion.button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Reward Shop */}
        {showShop && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Gift className="w-7 h-7" />
                Cửa Hàng Quà Tặng
              </h2>

              {rewards.length === 0 ? (
                <p className="text-white/70 text-center py-10">
                  Chưa có quà tặng nào. Quay lại sau nhé!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {rewards.map((reward) => (
                    <RewardCard
                      key={reward._id}
                      reward={reward}
                      onRedeem={handleRedeemReward}
                      userPoints={user?.points || 0}
                    />
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
