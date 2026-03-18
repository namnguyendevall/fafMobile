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
import { changePassword } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";
const ROSE = "#f43f5e";

export default function ChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các trường");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới phải khác với mật khẩu cũ");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        Alert.alert("Thành công", "Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.", [
          { text: "Đăng nhập lại", onPress: handleLogoutAfterPasswordChange }
        ]);
      } else {
        const errorMsg = res.error === "Wrong old password" 
          ? "Mật khẩu cũ không chính xác." 
          : (res.error || "Không thể đổi mật khẩu. Vui lòng thử lại sau.");
        Alert.alert("Lỗi", errorMsg);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAfterPasswordChange = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err) {
      navigation.navigate("Login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={40} color={CYAN_ACCENT} />
          </View>
          <Text style={styles.title}>Đổi mật khẩu</Text>
          <Text style={styles.subtitle}>
            Vui lòng nhập mật khẩu hiện tại và mật khẩu mới bạn muốn sử dụng.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.inputField}>
              <Ionicons name="key-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                <Ionicons name={showOld ? "eye-off-outline" : "eye-outline"} size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.inputField}>
              <Ionicons name="shield-checkmark-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.inputField}>
              <Ionicons name="repeat-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Cập nhật mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 40,
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
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: BG_SURFACE,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
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
    fontWeight: "600",
  },
  button: {
    backgroundColor: CYAN_ACCENT,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 4,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
