import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import GlassCard from '../components/GlassCard';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const titleRef = useRef(null);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate(`/${user.role}`);
    }

    // GSAP animation for title
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1, ease: 'bounce.out' }
      );
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(identifier, password, role);

    if (result.success) {
      navigate(`/${role}`);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div ref={titleRef} className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">EduMood - HDSchool</h1>
          <p className="text-white/80 text-lg">Theo dõi cảm xúc, cùng nhau phát triển 🌟</p>
        </div>

        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Đăng Nhập</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-medium">Tôi là...</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'student', label: 'Học sinh' },
                  { value: 'teacher', label: 'Giáo viên' },
                  { value: 'admin', label: 'Quản trị' }
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`
                      py-2 rounded-lg font-semibold transition-all
                      ${role === r.value
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'glass-card text-white/70 hover:text-white'
                      }
                    `}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white mb-2 font-medium">
                {role === 'student' ? 'Mã học sinh' : 'Email'}
              </label>
              <input
                type={role === 'student' ? 'text' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field"
                placeholder={role === 'student' ? 'Nhập mã học sinh' : 'Nhập email'}
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-medium">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-200"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="spinner w-6 h-6 border-2"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Đăng Nhập</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-white/60 text-sm">
            <p>Chưa có tài khoản? Liên hệ quản trị viên</p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
