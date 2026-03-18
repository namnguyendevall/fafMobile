import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { requestWithdrawal, getMyWithdrawals, getCurrentUserProfile } from "../../service/api";
import { LinearGradient } from "expo-linear-gradient";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";

export default function WithdrawalScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank"); // 'bank' or 'momo'
  const [bankInfo, setBankInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        getCurrentUserProfile(),
        getMyWithdrawals(),
      ]);

      if (profileRes.success) {
        setBalance(profileRes.data.balance_points || 0);
      }
      if (historyRes.success) {
        setRequests(historyRes.data);
      }
    } catch (err) {
      console.error("Fetch withdrawal data error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRequest = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (parseFloat(amount) > balance) {
      Alert.alert("Lỗi", "Số dư không đủ");
      return;
    }
    if (!bankInfo.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập thông tin ngân hàng (Số tài khoản, Tên ngân hàng, Tên chủ tài khoản)");
      return;
    }

    setSubmitting(true);
    try {
      // Gửi đúng cấu trúc object cho bank_info
      const res = await requestWithdrawal(parseFloat(amount), { 
        method: method, 
        details: bankInfo.trim() 
      });
      if (res.success) {
        Alert.alert("Thành công", "Yêu cầu rút tiền của bạn đã được gửi và đang chờ xử lý.");
        setAmount("");
        setBankInfo("");
        fetchData();
      } else {
        Alert.alert("Lỗi", res.error || "Không thể gửi yêu cầu");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING": return { color: AMBER, bg: AMBER + "15" };
      case "APPROVED": return { color: EMERALD, bg: EMERALD + "15" };
      case "REJECTED": return { color: ROSE, bg: ROSE + "15" };
      default: return { color: TEXT_SECONDARY, bg: "#1e293b" };
    }
  };

  const renderRequestItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={styles.requestItem}>
        <View style={styles.requestMain}>
          <Text style={styles.requestAmount}>
            -{parseFloat(item.amount).toLocaleString()} CRED
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status === 'PENDING' ? 'Đang xử lý' : 
               item.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
            </Text>
          </View>
        </View>
        <Text style={styles.requestBank} numberOfLines={1}>
          {typeof item.bank_info === 'string' ? item.bank_info : (item.bank_info?.details || JSON.stringify(item.bank_info))}
        </Text>
        <Text style={styles.requestDate}>
          {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CYAN_ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={CYAN_ACCENT}
            colors={[CYAN_ACCENT]}
          />
        }
      >
        <LinearGradient
          colors={["#0891b2", "#0369a1"]}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          <Text style={styles.balanceAmount}>{balance.toLocaleString()} CRED</Text>
          <Text style={styles.balanceVnd}>≈ {(balance * 1000).toLocaleString()} VNĐ</Text>
          <Ionicons name="wallet-outline" size={80} color="rgba(255,255,255,0.1)" style={styles.cardIcon} />
        </LinearGradient>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Yêu cầu rút tiền</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hình thức rút tiền</Text>
            <View style={styles.methodToggle}>
              <TouchableOpacity 
                style={[styles.methodBtn, method === 'bank' && styles.methodBtnActive]}
                onPress={() => setMethod('bank')}
              >
                <Ionicons name="business-outline" size={20} color={method === 'bank' ? "#FFF" : TEXT_SECONDARY} />
                <Text style={[styles.methodBtnText, method === 'bank' && styles.methodBtnTextActive]}>Ngân hàng</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodBtn, method === 'momo' && styles.methodBtnActive]}
                onPress={() => setMethod('momo')}
              >
                <Ionicons name="wallet-outline" size={20} color={method === 'momo' ? "#FFF" : TEXT_SECONDARY} />
                <Text style={[styles.methodBtnText, method === 'momo' && styles.methodBtnTextActive]}>MoMo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số tiền muốn rút</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Nhập số CRED"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text style={styles.currencyTag}>CRED</Text>
            </View>
            <Text style={styles.conversionHint}>* 1 CRED = 1.000 VNĐ</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {method === 'bank' ? 'Thông tin ngân hàng' : 'Số điện thoại MoMo'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={method === 'bank' ? "STK - Ngân hàng - Tên chủ TK" : "Nhập số điện thoại MoMo"}
              placeholderTextColor="#475569"
              multiline
              numberOfLines={3}
              value={bankInfo}
              onChangeText={setBankInfo}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.btnDisabled]} 
            onPress={handleRequest}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Gửi yêu cầu</Text>
                <Ionicons name="send" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Lịch sử rút tiền</Text>
          {requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#1e293b" />
              <Text style={styles.emptyText}>Chưa có yêu cầu rút tiền nào</Text>
            </View>
          ) : (
            requests.map(item => <View key={item.id}>{renderRequestItem({item})}</View>)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_BASE,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
  },
  balanceVnd: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  cardIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
  },
  formSection: {
    backgroundColor: BG_SURFACE,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 56,
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
  textArea: {
    height: 100,
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
    paddingTop: 16,
    textAlignVertical: "top",
  },
  currencyTag: {
    color: CYAN_ACCENT,
    fontWeight: "800",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: CYAN_ACCENT,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 4,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  methodToggle: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  methodBtn: {
    flex: 1,
    flexDirection: "row",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  methodBtnActive: {
    backgroundColor: CYAN_ACCENT,
  },
  methodBtnText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600",
  },
  methodBtnTextActive: {
    color: "#FFF",
    fontWeight: "800",
  },
  historySection: {
    marginTop: 10,
  },
  requestItem: {
    backgroundColor: BG_SURFACE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  requestMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  requestAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  requestBank: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#475569",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  conversionHint: {
    color: AMBER,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 4,
  },
});
