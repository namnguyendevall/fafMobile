import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getWallet, getMyTransactions } from "../../service/api";

const { width } = Dimensions.get("window");

const BG_BASE = "#020617";
const BG_SURFACE = "#0b1120";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";

const TransactionItem = ({ item }) => {
  const isDeposit = item.type === "DEPOSIT" || item.amount > 0;
  
  // Custom title based on reference_type if description is missing
  const title = item.description || (
    item.reference_type === 'ZALOPAY_DEPOSIT' ? 'Nạp tiền ZaloPay' :
    item.reference_type === 'MOMO_DEPOSIT' ? 'Nạp tiền MoMo' :
    (isDeposit ? "Nạp tiền" : "Thanh toán")
  );

  const statusColor = item.status === 'SUCCESS' || item.status === 'COMPLETED' ? '#34d399' : 
                      item.status === 'PENDING' ? '#fbbf24' : '#94a3b8';

  return (
    <View style={styles.transactionCard}>
      <View style={[styles.iconContainer, { backgroundColor: isDeposit ? "#064e3b" : "#450a0a" }]}>
        <FontAwesome 
          name={isDeposit ? "arrow-down" : "arrow-up"} 
          size={16} 
          color={isDeposit ? "#34d399" : "#f87171"} 
        />
      </View>
      <View style={styles.transDetails}>
        <Text style={styles.transTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.transDate}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.transAmount, { color: isDeposit ? "#34d399" : "#f87171" }]}>
          {isDeposit ? "+" : "-"}{Math.abs(item.amount).toLocaleString()}
        </Text>
        <Text style={[styles.transStatus, { color: statusColor }]}>
          {item.status === 'SUCCESS' || item.status === 'COMPLETED' ? '[THÀNH CÔNG]' : 
           item.status === 'PENDING' ? '[ĐANG XỬ LÝ]' : '[THẤT BẠI]'}
        </Text>
      </View>
    </View>
  );
};

export default function WalletScreen() {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [walletRes, transRes] = await Promise.all([
        getWallet(),
        getMyTransactions(),
      ]);

      if (walletRes.success) {
        setBalance(walletRes.data.balance_points || 0);
      }
      if (transRes.success) {
        setTransactions(transRes.data);
      }
    } catch (error) {
      console.error("Fetch wallet data error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Automatically refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    // Add Home button to header
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={{ marginRight: 15 }} 
          onPress={() => navigation.navigate("Home", { screen: "Feed" })}
        >
          <FontAwesome name="home" size={24} color={CYAN_ACCENT} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={CYAN_ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <LinearGradient
        colors={["#0891b2", "#0e7490", "#164e63"]}
        style={styles.balanceCard}
      >
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>SỐ DƯ KHẢ DỤNG</Text>
          <FontAwesome name="shield" size={16} color="rgba(255,255,255,0.6)" />
        </View>
        <View style={styles.balanceAmountRow}>
          <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
          <Text style={styles.balanceCurrency}>CRED</Text>
        </View>
        <View style={styles.balanceFooter}>
          <Text style={styles.walletId}>ID: FAF_W_00{balance % 1337}</Text>
          <Text style={styles.statusLive}>• LIVE PROTOCOL</Text>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate("Deposit")}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome name="plus" size={20} color={CYAN_ACCENT} />
          </View>
          <Text style={styles.actionText}>NẠP TIỀN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate("Withdrawal")}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome name="bank" size={18} color={CYAN_ACCENT} />
          </View>
          <Text style={styles.actionText}>RÚT TIỀN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => fetchData()}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome name="refresh" size={20} color={TEXT_SECONDARY} />
          </View>
          <Text style={styles.actionText}>LÀM MỚI</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LỊCH SỬ GIAO DỊCH</Text>
          <FontAwesome name="sliders" size={16} color={TEXT_SECONDARY} />
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TransactionItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={CYAN_ACCENT}
              colors={[CYAN_ACCENT]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome name="file-text-o" size={40} color="#1e293b" />
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: BG_BASE,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    height: 180,
    justifyContent: "space-between",
    elevation: 10,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 30,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  balanceAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  balanceValue: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
  },
  balanceCurrency: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  walletId: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  statusLive: {
    color: "#4ade80",
    fontSize: 10,
    fontWeight: "900",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    alignItems: "center",
    width: width * 0.25,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: BG_SURFACE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 8,
  },
  actionText: {
    color: TEXT_SECONDARY,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  historySection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transDetails: {
    flex: 1,
    marginLeft: 16,
  },
  transTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  transDate: {
    color: TEXT_SECONDARY,
    fontSize: 10,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  transAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
  transCurrency: {
    color: TEXT_SECONDARY,
    fontSize: 9,
    fontWeight: "700",
  },
  transStatus: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#475569",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
  },
});
