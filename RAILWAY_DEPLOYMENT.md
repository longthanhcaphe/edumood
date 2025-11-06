# 🚂 Railway Deployment Guide

## Vấn đề đã được sửa

Frontend không thể login khi deploy lên Railway vì:
- Frontend sử dụng hardcoded `/api` path
- Khi build production, Vite proxy không hoạt động
- Frontend không biết backend URL ở đâu

**Đã sửa:** Frontend giờ sử dụng environment variable `VITE_API_URL` để cấu hình API URL.

---

## 📋 Cách Deploy lên Railway

### 1. Backend Deployment

1. **Tạo service mới trên Railway:**
   - Vào Railway dashboard
   - Click "New Project" → "New Service"
   - Chọn "GitHub Repo" và chọn repo của bạn
   - Chọn thư mục `backend`

2. **Cấu hình Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=sk-your-openai-api-key
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.railway.app
   ```

3. **Cấu hình Build Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Lấy Backend URL:**
   - Sau khi deploy xong, Railway sẽ tạo một URL cho backend
   - Ví dụ: `https://your-backend-service.railway.app`
   - URL đầy đủ cho API: `https://your-backend-service.railway.app/api`

### 2. Frontend Deployment

1. **Tạo service mới cho Frontend:**
   - Vào Railway dashboard
   - Trong cùng project, click "New Service"
   - Chọn "GitHub Repo" (cùng repo)
   - Chọn thư mục `frontend`

2. **Cấu hình Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-service.railway.app/api
   ```
   ⚠️ **QUAN TRỌNG:** Thay `your-backend-service.railway.app` bằng URL thực tế của backend service của bạn.

3. **Cấu hình Build Settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview -- --port $PORT --host`
   - Railway sẽ tự động set biến `$PORT`, nhưng Vite preview mặc định là port 4173
   - Hoặc có thể dùng: `npx vite preview --port $PORT --host`

### 3. Cấu hình CORS trên Backend

Đảm bảo trong `backend/server.js`, `allowedOrigins` có chứa URL frontend của bạn:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://your-frontend-service.railway.app', // Thêm URL frontend của bạn
  process.env.CLIENT_URL,
];
```

---

## 🔍 Kiểm tra Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend-service.railway.app/api/health
   ```
   Should return: `{"status":"OK",...}`

2. **Test Frontend:**
   - Mở browser và vào URL frontend
   - Mở Developer Tools → Console
   - Thử login
   - Không nên có lỗi 404 cho `/api/auth/login`

3. **Kiểm tra Network Tab:**
   - Mở Network tab trong DevTools
   - Thử login
   - Request đến `/api/auth/login` nên có status 200 (không phải 404)

---

## 🐛 Troubleshooting

### Lỗi 404 khi login

**Nguyên nhân:** `VITE_API_URL` không được set hoặc sai URL.

**Giải pháp:**
1. Kiểm tra Environment Variables trong Railway dashboard
2. Đảm bảo `VITE_API_URL` có giá trị đúng: `https://your-backend-service.railway.app/api`
3. Rebuild frontend service sau khi thay đổi env variables

### CORS Error

**Nguyên nhân:** Backend không cho phép origin của frontend.

**Giải pháp:**
1. Thêm frontend URL vào `allowedOrigins` trong `backend/server.js`
2. Redeploy backend

### Build failed

**Nguyên nhân:** Missing dependencies hoặc build command sai.

**Giải pháp:**
1. Kiểm tra `package.json` có đầy đủ dependencies
2. Thử build local trước: `cd frontend && npm run build`
3. Đảm bảo build command trong Railway đúng

---

## 📝 Notes

- **Environment Variables:** Vite chỉ expose các biến bắt đầu bằng `VITE_` cho frontend
- **Build Time:** `VITE_API_URL` được inject vào build tại build time, không phải runtime
- **Rebuild Required:** Mỗi khi thay đổi `VITE_API_URL`, bạn cần rebuild frontend service
- **Local Development:** Vẫn hoạt động bình thường với Vite proxy khi không set `VITE_API_URL`

---

## ✅ Checklist

- [ ] Backend deployed và có URL
- [ ] Frontend có env variable `VITE_API_URL` set đúng
- [ ] CORS configured trên backend
- [ ] Test login thành công
- [ ] Không có lỗi 404 trong console

