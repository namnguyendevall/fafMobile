import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { depositZaloPay, depositMoMo, checkPaymentStatus } from "../../service/api";

const { width } = Dimensions.get("window");

const BG_BASE = "#020617";
const BG_SURFACE = "#0b1120";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";

export default function DepositScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [points, setPoints] = useState("100");
  const [vndAmount, setVndAmount] = useState(100000);
  const [paymentMethod, setPaymentMethod] = useState("zalopay");
  const [loading, setLoading] = useState(false);
  const exchangeRate = 1000;

  useEffect(() => {
    const p = parseInt(points) || 0;
    setVndAmount(p * exchangeRate);
  }, [points]);

  const handlePayment = async () => {
    const p = parseInt(points);
    if (!p || p < 1) {
      Alert.alert("Lỗi", "Vui lòng nhập số CRED tối thiểu là 1");
      return;
    }

    setLoading(true);
    const REDIRECT_URL = "fafapp://payment-result";
    try {
      let res;
      let paymentId;
      let method;

      if (paymentMethod === "zalopay") {
        res = await depositZaloPay(p, REDIRECT_URL);
        if (res.success && res.data.order_url) {
          paymentId = res.data.app_trans_id;
          method = "zalopay";
          await WebBrowser.openBrowserAsync(res.data.order_url);
        } else {
          Alert.alert("Lỗi", res.error || "Không nhận được link thanh toán ZaloPay");
          setLoading(false);
          return;
        }
      } else {
        res = await depositMoMo(p, REDIRECT_URL);
        if (res.success && res.data.payUrl) {
          paymentId = res.data.orderId;
          method = "momo";
          await WebBrowser.openBrowserAsync(res.data.payUrl);
        } else {
          Alert.alert("Lỗi", res.error || "Không nhận được link thanh toán MoMo");
          setLoading(false);
          return;
        }
      }

      // After browser closes or returns, check status
      if (paymentId) {
        setLoading(true);
        let checkCount = 0;
        const maxChecks = 5; // Check for ~15 seconds
        
        const check = async () => {
          console.log(`Checking payment status for ${paymentId}...`);
          const statusRes = await checkPaymentStatus(paymentId, method);
          
          if (statusRes.success && statusRes.data.status === 'done') {
            navigation.navigate("PaymentResult", { 
              status: 'success', 
              message: `Thanh toán ${p} CRED thành công!`,
              amount: p
            });
            return true;
          } else if (statusRes.success && statusRes.data.status === 'fail') {
            navigation.navigate("PaymentResult", { 
              status: 'fail', 
              message: `Thanh toán ${p} CRED thất bại hoặc đã bị hủy.`,
              amount: 0
            });
            return true;
          }
          return false;
        };

        // Try checking immediately
        const done = await check();
        if (done) {
          setLoading(false);
          return;
        }

        // Setup polling if not done
        const interval = setInterval(async () => {
          checkCount++;
          const isDone = await check();
          if (isDone || checkCount >= maxChecks) {
            clearInterval(interval);
            setLoading(false);
            if (!isDone) {
               Alert.alert("Thông báo", "Giao dịch đang được xử lý. Vui lòng kiểm tra ví sau ít phút.");
               navigation.navigate("Wallet");
            }
          }
        }, 3000);
      }

    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi khởi tạo thanh toán");
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>NẠP CREDITS</Text>
        <Text style={styles.subtitle}>1 CRED = 1,000 VND</Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>SỐ LƯỢNG QUY ĐỔI</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyTag}>CRED</Text>
            <TextInput
              style={styles.input}
              value={points}
              onChangeText={setPoints}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#475569"
            />
          </View>
          <FontAwesome name="exchange" size={16} color={CYAN_ACCENT} style={{ marginHorizontal: 12 }} />
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyTag}>VND</Text>
            <Text style={styles.vndDisplay}>{vndAmount.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Payment Methods */}
      <Text style={styles.sectionTitle}>PHƯƠNG THỨC THANH TOÁN</Text>
      
      <TouchableOpacity 
        style={[styles.methodCard, paymentMethod === "zalopay" && styles.activeMethod]}
        onPress={() => setPaymentMethod("zalopay")}
      >
        <View style={styles.methodIconBg}>
           <Image 
            source={{ uri: "https://images.careerbuilder.vn/employer_folders/lot1/231161/410x410/121016zalopay-logo-ngan.png" }} 
            style={styles.methodLogo} 
          />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>ZaloPay</Text>
          <Text style={styles.methodDesc}>Thanh toán qua ví hoặc ngân hàng</Text>
        </View>
        <View style={[styles.radio, paymentMethod === "zalopay" && styles.radioActive]}>
          {paymentMethod === "zalopay" && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.methodCard, paymentMethod === "momo" && styles.activeMethod]}
        onPress={() => setPaymentMethod("momo")}
      >
        <View style={[styles.methodIconBg, { backgroundColor: "#a50064" }]}>
          <Image 
            source={{ uri: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" }} 
            style={styles.methodLogo} 
          />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>MoMo</Text>
          <Text style={styles.methodDesc}>Thanh toán qua ví MoMo</Text>
        </View>
        <View style={[styles.radio, paymentMethod === "momo" && styles.radioActive]}>
          {paymentMethod === "momo" && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>{vndAmount.toLocaleString()} VND</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí dịch vụ</Text>
          <Text style={styles.summaryValue}>0 VND</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
          <Text style={styles.totalValue}>{vndAmount.toLocaleString()} VND</Text>
        </View>
      </View>

      {/* Pay Button */}
      <TouchableOpacity 
        style={styles.payButton}
        onPress={handlePayment}
        disabled={loading}
      >
        <LinearGradient
          colors={["#0891b2", "#06b6d4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBtn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>THANH TOÁN NGAY</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Manual Check Button - Shows up if user is stuck */}
      {!loading && (
        <TouchableOpacity 
          style={styles.manualCheckBtn}
          onPress={() => navigation.navigate("Wallet")}
        >
          <Text style={styles.manualCheckText}>Đã thanh toán? Quay lại Ví</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.securityNote}>🔒 Giao dịch được bảo mật bởi FAF_PROTOCOL</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 4,
  },
  subtitle: {
    color: CYAN_ACCENT,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: BG_SURFACE,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 30,
  },
  inputLabel: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    position: 'relative',
  },
  currencyTag: {
    position: 'absolute',
    top: -8,
    left: 10,
    backgroundColor: "#020617",
    color: CYAN_ACCENT,
    fontSize: 8,
    fontWeight: "900",
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    color: CYAN_ACCENT,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  vndDisplay: {
    color: "#4ade80",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  sectionTitle: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  activeMethod: {
    borderColor: CYAN_ACCENT,
    backgroundColor: "rgba(34, 211, 238, 0.05)",
  },
  methodIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  methodLogo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodName: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "800",
  },
  methodDesc: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: {
    borderColor: CYAN_ACCENT,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CYAN_ACCENT,
  },
  summaryCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderRadius: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  summaryValue: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: "600",
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  totalLabel: {
    color: CYAN_ACCENT,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  totalValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  payButton: {
    marginTop: 30,
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
  },
  securityNote: {
    textAlign: "center",
    marginTop: 20,
    color: "#475569",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  manualCheckBtn: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
  },
  manualCheckText: {
    color: "#94a3b8",
    fontSize: 12,
    textDecorationLine: 'underline',
    fontWeight: "600",
  },
});
