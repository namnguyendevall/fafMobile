import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dùng URL deploy thực tế trên Railway
const API_BASE_URL = "https://fafbe-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Helper to normalize response from various backend formats
 */
const handleResponse = (response) => {
  const data = response.data;
  // Format 1: { code: 0, data: [...] }
  // Format 2: { data: [...] }
  // Format 3: [...] (direct array or object)
  
  if (data && typeof data === 'object') {
    if ('data' in data) return { success: true, data: data.data };
    if ('code' in data && data.code === 0) return { success: true, data: data.data || data };
    return { success: true, data: data };
  }
  return { success: true, data: data };
};

const handleError = (error, defaultMsg) => {
  const serverError = error.response?.data?.error || 
                    error.response?.data?.message || 
                    error.response?.data?.errorMessage;
  
  console.error(`API Error [${defaultMsg}]:`, error.response?.data || error.message);
  
  return {
    success: false,
    error: serverError || error.message || defaultMsg,
    status: error.response?.status,
  };
};

export const getCurrentUserProfile = async () => {
  try {
    const response = await api.get("/users/me");
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy thông tin user thất bại");
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await api.put("/users/me", data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Cập nhật thông tin thất bại");
  }
};

export const register = async (email, password, role, fullName) => {
  try {
    const response = await api.post("/auth/register", { email, password, role, fullName });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Đăng ký thất bại");
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data;
    if (data.token || data.accessToken) {
      return {
        success: true,
        data: { accessToken: data.token || data.accessToken },
        message: "Đăng nhập thành công",
      };
    }
    return { success: true, data: data };
  } catch (error) {
    return handleError(error, "Đăng nhập thất bại");
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Xác thực OTP thất bại");
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await api.post("/auth/resend-otp", { email });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Gửi lại OTP thất bại");
  }
};

export const getJobs = async (params = {}) => {
  try {
    const response = await api.get("/jobs", { params });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy danh sách jobs thất bại");
  }
};

export const getJobById = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy chi tiết job thất bại");
  }
};

export const createProposal = async (proposalData) => {
  try {
    const response = await api.post("/proposals", proposalData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Ứng tuyển thất bại");
  }
};

export const getMyProposals = async () => {
  try {
    const response = await api.get("/proposals");
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy danh sách ứng tuyển thất bại");
  }
};

// --- Posts API ---

export const getPosts = async (page = 1, limit = 20) => {
  try {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy bảng tin thất bại");
  }
};

export const createPost = async (data) => {
  try {
    const response = await api.post("/posts", data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Đăng bài thất bại");
  }
};

export const toggleLikePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Thao tác like thất bại");
  }
};

export const getComments = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy bình luận thất bại");
  }
};

export const addComment = async (postId, content) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Bình luận thất bại");
  }
};

// --- Recommended Jobs API ---

export const getRecommendedJobs = async (params = {}) => {
  try {
    const response = await api.get("/matching/jobs/recommended", { params });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy gợi ý công việc thất bại");
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy thông báo thất bại");
  }
};

export const getConversations = async () => {
  try {
    const response = await api.get("/chat/conversations");
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy danh sách hội thoại thất bại");
  }
};

export const getChatMessages = async (conversationId) => {
  try {
    const response = await api.get(`/chat/${conversationId}/messages`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy tin nhắn thất bại");
  }
};

export const startChat = async (otherUserId) => {
  try {
    const response = await api.post("/chat/start", { otherUserId });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Khởi tạo hội thoại thất bại");
  }
};

export const sendChatMessage = async (conversationId, content) => {
  try {
    const response = await api.post(`/chat/${conversationId}/messages`, { content });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Gửi tin nhắn thất bại");
  }
};

export const requestWithdrawal = async (amount, bankInfo) => {
  try {
    const response = await api.post("/wallets/withdraw/request", { amount, bank_info: bankInfo });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Yêu cầu rút tiền thất bại");
  }
};

export const getMyWithdrawals = async () => {
  try {
    const response = await api.get("/wallets/withdraw/my");
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy lịch sử rút tiền thất bại");
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const res = await api.post("/auth/change-password", { oldPassword, newPassword });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const res = await api.post("/auth/reset-password", { email, otp, newPassword });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

export const getWallet = async () => {
  // Wallet balance is already in current user profile
  return getCurrentUserProfile();
};

export const getMyTransactions = async () => {
  try {
    const response = await api.get("/wallets/transactions/my");
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy lịch sử giao dịch thất bại");
  }
};

export const depositZaloPay = async (amount, redirecturl) => {
  try {
    const response = await api.post("/wallets/deposit/zalopay", { amount, redirecturl });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Khởi tạo thanh toán ZaloPay thất bại");
  }
};

export const depositMoMo = async (amount, redirectUrl) => {
  try {
    const response = await api.post("/wallets/deposit/momo", { amount, redirectUrl });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Khởi tạo thanh toán MoMo thất bại");
  }
};

export const checkPaymentStatus = async (paymentId, method) => {
  try {
    const endpoint = method === "zalopay" 
      ? `/wallets/check-status/zalopay/${paymentId}` 
      : `/wallets/check-status/momo/${paymentId}`;
    const response = await api.get(endpoint);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Kiểm tra trạng thái thanh toán thất bại");
  }
};

// --- Contracts API ---

export const getContractByJob = async (jobId) => {
  try {
    const response = await api.get(`/contracts/job/${jobId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Lấy hợp đồng thất bại");
  }
};

export const requestContractOtp = async (contractId) => {
  try {
    const response = await api.post(`/contracts/${contractId}/request-otp`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Yêu cầu mã xác thực ký hợp đồng thất bại");
  }
};

export const signContract = async (contractId, otp) => {
  try {
    const response = await api.post(`/contracts/${contractId}/sign`, { otp });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Ký hợp đồng thất bại");
  }
};

export const submitCheckpoint = async (checkpointId, workData) => {
  try {
    const response = await api.put(`/contracts/checkpoints/${checkpointId}/submit`, workData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Nộp bài làm thất bại");
  }
};

export const uploadFile = async (fileUri) => {
  try {
    const formData = new FormData();
    const uriParts = fileUri.split(".");
    const fileExtension = uriParts[uriParts.length - 1];

    formData.append("file", {
      uri: Platform.OS === "android" ? fileUri : fileUri.replace("file://", ""),
      name: `upload_${Date.now()}.${fileExtension}`,
      type: `image/${fileExtension}`, // Assuming image for now as per ImagePicker
    });

    const response = await api.post("/uploads/submission", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error, "Upload file thất bại");
  }
};
