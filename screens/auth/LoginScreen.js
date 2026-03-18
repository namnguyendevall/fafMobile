import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, getCurrentUserProfile } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";
const ROSE = "#f43f5e";
const EMERALD = "#10b981";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "success", // 'success' | 'error'
  });

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ email của bạn");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        if (result.data?.accessToken) {
          await AsyncStorage.setItem("token", result.data.accessToken);
        }

        // Kiểm tra vai trò người dùng sau khi đăng nhập thành công
        const profileRes = await getCurrentUserProfile();
        
        if (profileRes.success && profileRes.data?.role === "worker") {
          setAlertConfig({
            title: "THÀNH CÔNG",
            message: "Truy cập hệ thống thành công!",
            type: "success",
          });
          setAlertVisible(true);
        } else {
          // Nếu không phải worker, xóa token và thông báo lỗi
          await AsyncStorage.removeItem("token");
          setAlertConfig({
            title: "TRUY CẬP BỊ TỪ CHỐI",
            message: profileRes.success 
              ? "Ứng dụng Mobile chỉ dành cho Người làm việc (Worker). Các vai trò khác vui lòng sử dụng bản Web."
              : "Không thể xác minh thông tin người dùng. Vui lòng thử lại.",
            type: "error",
          });
          setAlertVisible(true);
        }
      } else {
        let errorMsg = "Email hoặc mật khẩu không đúng.";
        if (result.error === "User not found") errorMsg = "Email không tồn tại trong hệ thống.";
        else if (result.error === "Account not activated") errorMsg = "Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email.";
        else if (result.error === "Wrong password") errorMsg = "Mật khẩu không chính xác.";
        else if (result.error) errorMsg = result.error;

        setAlertConfig({
          title: "LỖI TRUY CẬP",
          message: errorMsg,
          type: "error",
        });
        setAlertVisible(true);
      }
    } catch (err) {
      setAlertConfig({
        title: "LỖI HỆ THỐNG",
        message: "Không thể kết nối máy chủ.",
        type: "error",
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertOK = () => {
    setAlertVisible(false);
    if (alertConfig.type === "success") {
      navigation?.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  };

  return (
    <View style={styles.safeArea}>
      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <Pressable
          style={styles.alertOverlay}
          onPress={() => setAlertVisible(false)}
        >
          <Pressable
            style={styles.alertDialog}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.alertIconWrap, { backgroundColor: alertConfig.type === 'success' ? EMERALD + '20' : ROSE + '20' }]}>
               <Ionicons 
                name={alertConfig.type === 'success' ? "checkmark-circle" : "alert-circle"} 
                size={40} 
                color={alertConfig.type === 'success' ? EMERALD : ROSE} 
               />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity
              style={[styles.alertOKButton, { backgroundColor: alertConfig.type === 'success' ? EMERALD : ROSE }]}
              onPress={handleAlertOK}
              activeOpacity={0.8}
            >
              <Text style={styles.alertOKText}>XÁC NHẬN</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.navigate("Main")}
        >
          <Ionicons name="arrow-back" size={24} color={CYAN_ACCENT} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>LOGIN<Text style={{color: CYAN_ACCENT}}>_PORTAL</Text></Text>
            <Text style={styles.welcomeSubtitle}>
              Nhập mã định danh để truy cập vào hệ thống <Text style={{color: "#FFF"}}>FAF</Text>.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputFieldContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={TEXT_SECONDARY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Địa chỉ email"
                  placeholderTextColor={TEXT_MUTED}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputFieldContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={TEXT_SECONDARY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Mật khẩu"
                  placeholderTextColor={TEXT_MUTED}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={TEXT_SECONDARY}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Duy trì đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation?.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={ROSE} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.signInButton,
              loading && styles.signInButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.signInButtonText}>XÁC THỰC TRUY CẬP</Text>
            )}
          </TouchableOpacity>


          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Chưa có tài khoản hê thống? </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate("Register")}
            >
              <Text style={styles.footerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BG_SURFACE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: CYAN_ACCENT + "30",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    letterSpacing: 2,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
    height: 56,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
    paddingVertical: 0,
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: TEXT_MUTED,
    backgroundColor: BG_CARD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: CYAN_ACCENT,
    borderColor: CYAN_ACCENT,
  },
  rememberMeText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: CYAN_ACCENT,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: ROSE + "10",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ROSE + "30",
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: ROSE,
    flex: 1,
  },
  signInButton: {
    backgroundColor: CYAN_ACCENT,
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  signInButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1e293b",
  },
  dividerText: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginHorizontal: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG_SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    height: 50,
    gap: 10,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  footerLink: {
    fontSize: 14,
    color: CYAN_ACCENT,
    fontWeight: "700",
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertDialog: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: BG_SURFACE,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  alertIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: 1,
  },
  alertMessage: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  alertOKButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  alertOKText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
});
