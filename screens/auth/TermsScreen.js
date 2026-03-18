import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={CYAN_ACCENT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐIỀU KHOẢN DỊCH VỤ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Chấp thuận điều khoản</Text>
          <Text style={styles.text}>
            Bằng việc đăng ký tài khoản và sử dụng nền tảng FAF, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Trách nhiệm người dùng</Text>
          <Text style={styles.text}>
            Người dùng có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn sẽ do bạn chịu trách nhiệm hoàn toàn.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Dịch vụ và Thanh toán</Text>
          <Text style={styles.text}>
            FAF cung cấp nền tảng kết nối giữa người thuê và người làm. Các giao dịch tài chính phải được thực hiện thông qua hệ thống thanh toán của FAF để đảm bảo an toàn và quyền lợi cho các bên.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Hành vi bị nghiêm cấm</Text>
          <Text style={styles.text}>
            - Cung cấp thông tin giả mạo hoặc lừa đảo.{"\n"}
            - Gây rối, đe dọa hoặc quấy rối người dùng khác.{"\n"}
            - Vi phạm bản quyền hoặc quyền sở hữu trí tuệ của FAF.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Chấm dứt dịch vụ</Text>
          <Text style={styles.text}>
            FAF có quyền tạm khóa hoặc chấm dứt vĩnh viễn tài khoản của người dùng nếu phát hiện vi phạm nghiêm trọng các điều khoản dịch vụ mà không cần báo trước.
          </Text>
        </View>

        <Text style={styles.lastUpdated}>Cập nhật lần cuối: 18/03/2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BG_SURFACE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: CYAN_ACCENT,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SECONDARY,
    textAlign: "justify",
  },
  lastUpdated: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});
