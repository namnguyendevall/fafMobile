import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getJobs } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";

export default function ExploreScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("ALL"); // ALL, SHORT_TERM, LONG_TERM
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const params = {
        search: search,
      };
      if (jobType !== "ALL") {
        params.jobType = jobType;
      }
      const result = await getJobs(params);
      if (result.success) {
        setJobs(result.data || []);
      }
    } catch (err) {
      console.error("Explore fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, jobType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const getFormatPrice = (price) => {
    if (!price) return "0 Pts";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Pts";
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category_name}</Text>
        </View>
        <Text style={styles.priceText}>{getFormatPrice(item.budget)}</Text>
      </View>
      
      <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.jobInfo} numberOfLines={1}>
        {item.job_type === "SHORT_TERM" ? "Short-term" : "Long-term"} • {item.location || "Remote"}
      </Text>

      <View style={styles.jobCardFooter}>
        <View style={styles.verifiedBox}>
          <Ionicons name="shield-checkmark" size={14} color={EMERALD} />
          <Text style={styles.verifiedText}>Protected</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={CYAN_ACCENT} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header & Search */}
      <View style={styles.searchHeader}>
        <Text style={styles.headerTitle}>Khám phá công việc</Text>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tiêu đề, kỹ năng..."
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterBtn, jobType === "ALL" && styles.filterBtnActive]}
            onPress={() => setJobType("ALL")}
          >
            <Text style={[styles.filterText, jobType === "ALL" && styles.filterTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, jobType === "SHORT_TERM" && styles.filterBtnActive]}
            onPress={() => setJobType("SHORT_TERM")}
          >
            <Text style={[styles.filterText, jobType === "SHORT_TERM" && styles.filterTextActive]}>Ngắn hạn</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, jobType === "LONG_TERM" && styles.filterBtnActive]}
            onPress={() => setJobType("LONG_TERM")}
          >
            <Text style={[styles.filterText, jobType === "LONG_TERM" && styles.filterTextActive]}>Dài hạn</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results List */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderJobCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={CYAN_ACCENT} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={CYAN_ACCENT} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={TEXT_MUTED} />
              <Text style={styles.emptyText}>Không tìm thấy công việc nào</Text>
            </View>
          )
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
  searchHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: BG_SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_BASE,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: TEXT_PRIMARY,
    fontSize: 15,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: "row",
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  filterBtnActive: {
    backgroundColor: CYAN_ACCENT + "20",
    borderColor: CYAN_ACCENT,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_SECONDARY,
  },
  filterTextActive: {
    color: CYAN_ACCENT,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  jobCard: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: CYAN_ACCENT,
    textTransform: "uppercase",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: AMBER,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  jobInfo: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 12,
  },
  jobCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  verifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: EMERALD,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    color: TEXT_SECONDARY,
    fontSize: 15,
  },
});
