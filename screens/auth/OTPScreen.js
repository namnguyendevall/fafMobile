import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { verifyOtp, resendOtp } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";
const ROSE = "#f43f5e";
const EMERALD = "#10b981";

const OTP_LENGTH = 6;

export default function OTPScreen({ navigation, route }) {
  const { email } = route.params || {};
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "success",
  });
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH) {
      setLoading(true);
      try {
        const result = await verifyOtp(email, code);
        if (result.success) {
          setAlertConfig({
            title: "THÀNH CÔNG",
            message: "Hệ thống đã xác thực định danh. Vui lòng đăng nhập để tiếp tục.",
            type: "success",
          });
          setAlertVisible(true);
        } else {
          setAlertConfig({
            title: "LỖI XÁC THỰC",
            message: result.error || "Mã OTP không hợp lệ.",
            type: "error",
          });
          setAlertVisible(true);
        }
      } catch (err) {
        setAlertConfig({
          title: "LỖI HỆ THỐNG",
          message: "Mất kết nối với máy chủ trung tâm.",
          type: "error",
        });
        setAlertVisible(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      const result = await resendOtp(email);
      if (result.success) {
        setAlertConfig({
          title: "THÔNG BÁO",
          message: "Mã xác thực mới đã được gửi tới email của bạn.",
          type: "success",
        });
        setAlertVisible(true);
      } else {
        setAlertConfig({
          title: "LỖI",
          message: result.error || "Yêu cầu gửi lại thất bại.",
          type: "error",
        });
        setAlertVisible(true);
      }
    } catch (err) {
      setAlertConfig({
        title: "LỖI",
        message: "Có lỗi xảy ra, vui lòng thử lại sau.",
        type: "error",
      });
      setAlertVisible(true);
    }
  };

  const handleAlertOK = () => {
    setAlertVisible(false);
    if (alertConfig.type === "success" && alertConfig.title === "THÀNH CÔNG") {
      navigation?.navigate("Login");
    }
  };

  const otpComplete = otp.every((d) => d !== "");

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Modal
          visible={alertVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAlertVisible(false)}
        >
          <Pressable style={styles.alertOverlay} onPress={() => setAlertVisible(false)}>
            <Pressable style={styles.alertDialog} onPress={(e) => e.stopPropagation()}>
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
              >
                <Text style={styles.alertOKText}>XÁC NHẬN</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={CYAN_ACCENT} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>VERIFY<Text style={{color: CYAN_ACCENT}}>_IDENTITY</Text></Text>
            <Text style={styles.description}>
              Xác thực định danh truy cập vào nền tảng <Text style={{color: "#FFF"}}>FAF</Text>. Mã 6 chữ số đã được gửi tới:{"\n"}
              <Text style={{color: CYAN_ACCENT, fontWeight: "600"}}>{email}</Text>
            </Text>
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                style={[
                  styles.otpBox, 
                  digit !== "" && styles.otpBoxFilled,
                  inputRefs.current[index]?.isFocused() && styles.otpBoxActive
                ]}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                placeholderTextColor={TEXT_MUTED}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!otpComplete || loading) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={!otpComplete || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.verifyButtonText}>XÁC THỰC TRUY CẬP</Text>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Không nhận được mã? </Text>
            <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
              <Text style={styles.resendLink}>Gửi lại mã OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    alignItems: "center",
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
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  otpBox: {
    width: 45,
    height: 56,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "800",
    color: CYAN_ACCENT,
    textAlign: "center",
    backgroundColor: BG_SURFACE,
  },
  otpBoxFilled: {
    borderColor: CYAN_ACCENT + "50",
    backgroundColor: BG_CARD,
  },
  otpBoxActive: {
    borderColor: CYAN_ACCENT,
    borderWidth: 2,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CYAN_ACCENT,
    borderRadius: 16,
    height: 56,
    width: "100%",
    gap: 10,
    marginBottom: 30,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resendLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  resendLink: {
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
