import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, otp.trim(), newPassword);
      if (res.success) {
        Alert.alert("Thành công", "Mật khẩu của bạn đã được thay đổi.", [
          { text: "Đăng nhập", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        let errorMsg = "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
        if (res.error === "OTP invalid") errorMsg = "Mã OTP không hợp lệ hoặc đã hết hạn.";
        else if (res.error === "OTP wrong") errorMsg = "Mã OTP không chính xác.";
        else if (res.error) errorMsg = res.error;
        
        Alert.alert("Lỗi", errorMsg);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={CYAN_ACCENT} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-open-outline" size={40} color={CYAN_ACCENT} />
            </View>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Mã xác thực đã được gửi tới:{"\n"}
              <Text style={{ color: CYAN_ACCENT, fontWeight: "600" }}>{email}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            {/* OTP Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã xác thực (OTP)</Text>
              <View style={styles.inputField}>
                <Ionicons
                  name="keypad-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập 6 số"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <View style={styles.inputField}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor={TEXT_MUTED}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={TEXT_MUTED}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View style={styles.inputField}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor={TEXT_MUTED}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Đổi mật khẩu</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BG_SURFACE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CYAN_ACCENT + "20",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CYAN_ACCENT + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: {
    backgroundColor: BG_SURFACE,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 16,
  },
  button: {
    backgroundColor: CYAN_ACCENT,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
