import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMyProposals } from "../../service/api";

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

export default function MyProposalsScreen({ navigation }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProposals = async () => {
    try {
      const result = await getMyProposals();
      if (result.success) {
        setProposals(result.data);
      }
    } catch (err) {
      console.error("Fetch proposals error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProposals();
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED":
        return { color: EMERALD, bg: EMERALD + "15", border: EMERALD + "30" };
      case "REJECTED":
        return { color: ROSE, bg: ROSE + "15", border: ROSE + "30" };
      case "PENDING":
        return { color: AMBER, bg: AMBER + "15", border: AMBER + "30" };
      default:
        return { color: TEXT_MUTED, bg: TEXT_MUTED + "15", border: TEXT_MUTED + "30" };
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("JobDetail", { jobId: item.job_id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.job_title || "Job Title"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.proposedPriceLabel}>Đề xuất:</Text>
          <Text style={styles.proposedPrice}>{item.proposed_price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <Text style={styles.ptsText}>CRED</Text></Text>
        </View>

        <Text style={styles.coverLetter} numberOfLines={2}>{item.cover_letter}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={12} color={TEXT_MUTED} />
            <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
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
      <FlatList
        data={proposals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={CYAN_ACCENT} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="document-text-outline" size={64} color={CYAN_ACCENT} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có đề xuất</Text>
            <Text style={styles.emptyText}>Bạn chưa ứng tuyển công việc nào. Hãy khám phá và tìm kiếm cơ hội phù hợp!</Text>
            <TouchableOpacity 
                style={styles.browseBtn}
                onPress={() => navigation.navigate("Home")}
            >
                <Text style={styles.browseBtnText}>Tìm việc ngay</Text>
            </TouchableOpacity>
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
    alignItems: "center",
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: BG_CARD,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  proposedPriceLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginRight: 6,
  },
  proposedPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: AMBER,
  },
  ptsText: {
    fontSize: 12,
    fontWeight: "600",
  },
  coverLetter: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    marginBottom: 30,
  },
  browseBtn: {
    backgroundColor: CYAN_ACCENT,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  browseBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
