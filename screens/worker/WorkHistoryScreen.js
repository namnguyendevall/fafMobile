import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Constants for styling
const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#e2e8f0";
const TEXT_MUTED = "#94a3b8";
const EMERALD = "#34d399";
const AMBER = "#fbbf24";
const ROSE = "#f43f5e";

// Manual API call since we need a specific format for this screen
const API_BASE_URL = "https://fafbe-production.up.railway.app/api";

export default function WorkHistoryScreen({ navigation }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/contracts/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        setContracts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setContracts(response.data);
      }
    } catch (err) {
      console.error("Fetch contracts error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return { color: CYAN_ACCENT, bg: CYAN_ACCENT + "15", border: CYAN_ACCENT + "30", label: "Đang làm" };
      case "COMPLETED":
        return { color: EMERALD, bg: EMERALD + "15", border: EMERALD + "30", label: "Hoàn thành" };
      case "SETTLED":
        return { color: EMERALD, bg: EMERALD + "15", border: EMERALD + "30", label: "Đã thanh toán" };
      case "TERMINATED":
        return { color: ROSE, bg: ROSE + "15", border: ROSE + "30", label: "Đã hủy" };
      case "PENDING":
        return { color: AMBER, bg: AMBER + "15", border: AMBER + "30", label: "Chờ ký" };
      default:
        return { color: TEXT_MUTED, bg: TEXT_MUTED + "15", border: TEXT_MUTED + "30", label: status };
    }
  };

  const getFormatPrice = (price) => {
    if (price === null || price === undefined) return "0 CRED";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " CRED";
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("JobDetail", { jobId: item.job_id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleArea}>
             <Text style={styles.jobTitle} numberOfLines={1}>{item.job_title || "Công việc #" + item.id}</Text>
             <Text style={styles.clientName}>Đối tác: {item.client_name || "N/A"}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tổng giá trị</Text>
              <Text style={styles.infoValue}>{getFormatPrice(item.total_amount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
              <Text style={styles.infoValue}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
           <Text style={styles.footerNote}>Chi tiết trạng thái: {item.status}</Text>
           <Ionicons name="chevron-forward" size={16} color={CYAN_ACCENT} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={CYAN_ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch sử công việc</Text>
          <Text style={styles.headerSubtitle}>Theo dõi quá trình làm việc của bạn tại FAF</Text>
       </View>

      <FlatList
        data={contracts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={CYAN_ACCENT} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="briefcase-outline" size={64} color={CYAN_ACCENT} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
            <Text style={styles.emptyText}>Bạn chưa có hợp đồng nào được khởi tạo. Hãy ứng tuyển và bắt đầu ngay!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: BG_SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: BG_SURFACE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 10,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: "#1e293b",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  footerNote: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontStyle: "italic",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CYAN_ACCENT + "10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
  },
});
