import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const BG_BASE = "#020617";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#94a3b8";

export default function PaymentResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { status, message, amount } = route.params || { status: 'pending', message: 'Giao dịch đang được xử lý', amount: 0 };
  
  const isSuccess = status === 'success' || status === '1' || status === '0'; // Depending on ZaloPay/MoMo result codes
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative Grid */}
      <View style={styles.gridOverlay} />

      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <View style={[styles.iconContainer, { borderColor: isSuccess ? "#34d399" : "#f43f5e" }]}>
          <View style={[styles.iconBg, { backgroundColor: isSuccess ? "rgba(52, 211, 153, 0.1)" : "rgba(244, 63, 94, 0.1)" }]}>
            <Ionicons 
              name={isSuccess ? "checkmark-circle" : "close-circle"} 
              size={100} 
              color={isSuccess ? "#34d399" : "#f43f5e"} 
            />
          </View>
          {/* HUD corners */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <Text style={[styles.statusText, { color: isSuccess ? "#34d399" : "#f43f5e" }]}>
          {isSuccess ? "THANH TOÁN THÀNH CÔNG" : "THANH TOÁN THẤT BẠI"}
        </Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.messageText}>{message}</Text>

        {amount > 0 && (
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>SỐ DƯ ĐÃ THAY ĐỔI</Text>
            <Text style={styles.amountValue}>+{amount.toLocaleString()} <Text style={{fontSize: 14, color: CYAN_ACCENT}}>CRED</Text></Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  { 
                    name: 'Home',
                    state: {
                      routes: [
                        { name: 'Profile' }
                      ]
                    }
                  }
                ],
              })
            );
            // After resetting to Profile, push Wallet so user is back where they started
            navigation.navigate("Wallet");
          }}
        >
          <LinearGradient
            colors={[CYAN_ACCENT, "#0891b2"]}
            style={styles.gradient}
          >
            <Text style={styles.btnText}>QUAY LẠI VÍ</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.footerNote}>ENCRYPTED TRANSACTION v2.4.9</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
    justifyContent: "center",
    alignItems: "center",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    borderWidth: 0.5,
    borderColor: CYAN_ACCENT,
  },
  content: {
    width: width * 0.85,
    alignItems: "center",
    padding: 30,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.2)",
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    position: 'relative',
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderColor: CYAN_ACCENT,
    borderWidth: 2,
  },
  tl: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  
  statusText: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 20,
  },
  messageText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  amountBox: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  amountLabel: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },
  actionBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  footerNote: {
    position: 'absolute',
    bottom: 40,
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
