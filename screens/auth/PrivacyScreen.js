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

export default function PrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={CYAN_ACCENT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QUYỀN RIÊNG TƯ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Thu thập thông tin</Text>
          <Text style={styles.text}>
            FAF thu thập các thông tin cần thiết để cung cấp và cải thiện dịch vụ, bao gồm: Họ tên, email, số điện thoại, và thông tin hồ sơ nghề nghiệp của bạn.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Sử dụng thông tin</Text>
          <Text style={styles.text}>
            Thông tin của bạn được sử dụng để:{"\n"}
            - Xác thực tài khoản.{"\n"}
            - Kết nối bạn với các cơ hội công việc phù hợp.{"\n"}
            - Gửi các thông báo quan trọng về tài khoản và hệ thống.{"\n"}
            - Xử lý các khiếu nại và tranh chấp nếu có.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Bảo mật thông tin</Text>
          <Text style={styles.text}>
            Chúng tôi sử dụng các biện pháp kỹ thuật tiên tiến để bảo vệ thông tin cá nhân của bạn khỏi việc truy cập, sử dụng hoặc tiết lộ trái phép. Dữ liệu của bạn được mã hóa và lưu trữ an toàn.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Chia sẻ thông tin</Text>
          <Text style={styles.text}>
            FAF cam kết không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin khi có sự đồng ý của bạn hoặc theo yêu cầu của pháp luật.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Quyền của bạn</Text>
          <Text style={styles.text}>
            Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua phần cài đặt tài khoản trong ứng dụng.
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
