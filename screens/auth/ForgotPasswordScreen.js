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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { forgotPassword } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Định dạng email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        Alert.alert("Thành công", "Mã OTP đã được gửi về email của bạn.", [
          {
            text: "Tiếp tục",
            onPress: () => navigation.navigate("ResetPassword", { email: email.trim() }),
          },
        ]);
      } else {
        const errorMsg = res.error === "Email not found"
          ? "Địa chỉ email không tồn tại trong hệ thống."
          : (res.error || "Không thể gửi OTP. Vui lòng thử lại.");
        Alert.alert("Lỗi", errorMsg);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi yêu cầu mã OTP");
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
              <Ionicons name="mail-open-outline" size={40} color={CYAN_ACCENT} />
            </View>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>
              Đừng lo lắng! Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email định danh</Text>
              <View style={styles.inputField}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={TEXT_MUTED}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Gửi mã OTP</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Nhớ lại mật khẩu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={[styles.footerText, { color: CYAN_ACCENT, fontWeight: "700" }]}>
                Đăng nhập
              </Text>
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
    marginBottom: 24,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
});
