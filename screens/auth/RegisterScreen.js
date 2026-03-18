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
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { register } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";
const ROSE = "#f43f5e";
const EMERALD = "#10b981";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "success",
  });

  const handleRegister = async () => {
    setErrorMessage("");
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!agreeToTerms) {
      setErrorMessage("Bạn phải đồng ý với điều khoản dịch vụ");
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password, "worker", fullName);
      if (result.success) {
        navigation?.navigate("OTP", { email });
      } else {
        setAlertConfig({
          title: "LỖI ĐĂNG KÝ",
          message: result.error || "Không thể tạo tài khoản.",
          type: "error",
        });
        setAlertVisible(true);
      }
    } catch (err) {
      setAlertConfig({
        title: "LỖI HỆ THỐNG",
        message: "Có lỗi xảy ra, vui lòng thử lại sau.",
        type: "error",
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
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
            <View style={[styles.alertIconWrap, { backgroundColor: ROSE + '20' }]}>
               <Ionicons name="alert-circle" size={40} color={ROSE} />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity
              style={[styles.alertOKButton, { backgroundColor: ROSE }]}
              onPress={() => setAlertVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.alertOKText}>QUAY LẠI</Text>
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
            <Text style={styles.welcomeTitle}>USER<Text style={{color: CYAN_ACCENT}}>_JOIN</Text></Text>
            <Text style={styles.welcomeSubtitle}>
              Khởi tạo danh tính của bạn trên nền tảng <Text style={{color: "#FFF"}}>FAF</Text>.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputFieldContainer}>
                <Ionicons name="person-outline" size={20} color={TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Họ và tên"
                  placeholderTextColor={TEXT_MUTED}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputFieldContainer}>
                <Ionicons name="mail-outline" size={20} color={TEXT_SECONDARY} style={styles.inputIcon} />
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
                <Ionicons name="lock-closed-outline" size={20} color={TEXT_SECONDARY} style={styles.inputIcon} />
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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputFieldContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={TEXT_SECONDARY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor={TEXT_MUTED}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color={TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={ROSE} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[styles.checkbox, agreeToTerms && styles.checkboxActive]}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              {agreeToTerms && (
                <Ionicons name="checkmark" size={14} color="#FFF" />
              )}
            </TouchableOpacity>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>Tôi đồng ý với </Text>
              <TouchableOpacity onPress={() => navigation?.navigate("Terms")}>
                <Text style={styles.termsLink}>Điều khoản</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> & </Text>
              <TouchableOpacity onPress={() => navigation?.navigate("Privacy")}>
                <Text style={styles.termsLink}>Quyền riêng tư</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createAccountButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.createAccountButtonText}>KHỞI TẠO TÀI KHOẢN</Text>
            )}
          </TouchableOpacity>


          <View style={styles.loginLinkContainer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate("Login")}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
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
    marginBottom: 15,
  },
  logoImage: {
    width: 80,
    height: 80,
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
    marginBottom: 10,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
    height: 54,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    paddingVertical: 0,
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: CYAN_ACCENT,
    borderColor: CYAN_ACCENT,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  termsText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  termsLink: {
    fontSize: 13,
    color: CYAN_ACCENT,
    fontWeight: "600",
  },
  createAccountButton: {
    backgroundColor: CYAN_ACCENT,
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  createAccountButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
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
    marginBottom: 15,
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
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  loginLink: {
    fontSize: 14,
    color: CYAN_ACCENT,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 10,
    backgroundColor: ROSE + "10",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ROSE + "30",
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: ROSE,
    flex: 1,
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
