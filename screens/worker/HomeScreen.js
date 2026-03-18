import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Dimensions, Platform } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { getJobs, getCurrentUserProfile, getRecommendedJobs, getPosts, toggleLikePost } from "../../service/api";

const { width } = Dimensions.get("window");

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#22d3ee"; // Adjusted to cyan-400
const PURPLE = "#c084fc";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#e2e8f0";
const TEXT_MUTED = "#94a3b8";
const EMERALD = "#34d399"; // Adjusted to emerald-400
const AMBER = "#fbbf24"; // Adjusted to amber-400

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [jobType, setJobType] = useState("Short-term");
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, JOBS, SYSTEM (placeholder)

  const fetchData = async () => {
    try {
      const type = jobType === "Short-term" ? "SHORT_TERM" : "LONG_TERM";
      const [profileRes, jobsRes, recommendedRes, postsRes] = await Promise.all([
        getCurrentUserProfile(),
        getJobs({ jobType: type }),
        getRecommendedJobs({ limit: 5 }),
        getPosts(1, 10)
      ]);

      if (profileRes.success) setUser(profileRes.data);
      if (jobsRes.success) setJobs(jobsRes.rows || jobsRes.data || []);
      if (recommendedRes.success) setRecommendedJobs(recommendedRes.data || []);
      if (postsRes.success) setPosts(postsRes.data || []);
      
    } catch (err) {
      console.error("Fetch home data error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getFormatPrice = (price) => {
    if (!price) return "0 Pts";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " CRED";
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={CYAN_ACCENT} />}
      >
        {/* System Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>
              {new Date().getHours() < 12 ? "MORNING" : "AFTERNOON"}, {user?.full_name?.toUpperCase() || "AGENT"}
            </Text>
          </View>
          <View style={styles.statusRight}>
            <Text style={styles.systemTag}>FAF-MAINNET</Text>
          </View>
        </View>

        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerWelcome}>Welcome back,</Text>
            <Text style={styles.headerTitle}>{user?.full_name || "Freelancer"}</Text>
          </View>
          <TouchableOpacity style={styles.notifyBtn} onPress={() => navigation.navigate("Notification")}>
            <Ionicons name="notifications-outline" size={24} color={TEXT_PRIMARY} />
            <View style={styles.notifyBadge} />
          </TouchableOpacity>
        </View>

        {/* Quick Access Grid */}
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate("Explore")}>
            <View style={[styles.actionIconWrap, { backgroundColor: CYAN_ACCENT + "20" }]}>
              <Ionicons name="search" size={20} color={CYAN_ACCENT} />
            </View>
            <Text style={styles.actionLabel}>Find Work</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate("MyProposals")}>
            <View style={[styles.actionIconWrap, { backgroundColor: EMERALD + "20" }]}>
              <Ionicons name="briefcase" size={20} color={EMERALD} />
            </View>
            <Text style={styles.actionLabel}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate("Message")}>
            <View style={[styles.actionIconWrap, { backgroundColor: AMBER + "20" }]}>
              <Ionicons name="chatbubble-ellipses" size={20} color={AMBER} />
            </View>
            <Text style={styles.actionLabel}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate("Profile")}>
            <View style={[styles.actionIconWrap, { backgroundColor: PURPLE + "20" }]}>
              <Ionicons name="wallet" size={20} color={PURPLE} />
            </View>
            <Text style={styles.actionLabel}>Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Jobs Carousel */}
        {recommendedJobs.length > 0 && (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitleCap}>RECOMMENDED_CONTRACTS</Text>
            <View style={styles.sectionLine} />
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {recommendedJobs.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.recommendedCard}
              onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}
            >
              <Text style={styles.recTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.recDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.recFooter}>
                <Text style={styles.recBudget}>{getFormatPrice(item.budget)}</Text>
                <Ionicons name="arrow-forward-circle" size={20} color={CYAN_ACCENT} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed Control Label */}
        <View style={styles.feedLabelRow}>
          <View style={[styles.sectionLine, { flex: 1 }]} />
          <View style={styles.activeFeedBadge}>
            <View style={[styles.onlineDot, { backgroundColor: CYAN_ACCENT }]} />
            <Text style={styles.activeFeedText}>ACTIVE_FEED_STREAM</Text>
          </View>
          <View style={[styles.sectionLine, { flex: 1 }]} />
        </View>

        {/* Feed Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.feedTab, activeTab === "ALL" && styles.feedTabActive]}
            onPress={() => setActiveTab("ALL")}
          >
            <Text style={[styles.feedTabText, activeTab === "ALL" && styles.feedTabTextActive]}>📡 ALL</Text>
            {activeTab === "ALL" && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.feedTab, activeTab === "JOBS" && styles.feedTabActive]}
            onPress={() => setActiveTab("JOBS")}
          >
            <Text style={[styles.feedTabText, activeTab === "JOBS" && styles.feedTabTextActive]}>◈ JOBS</Text>
            {activeTab === "JOBS" && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.feedTab, activeTab === "SYSTEM" && styles.feedTabActive]}
            onPress={() => setActiveTab("SYSTEM")}
          >
            <Text style={[styles.feedTabText, activeTab === "SYSTEM" && styles.feedTabTextActive]}>⬡ SYSTEM</Text>
            {activeTab === "SYSTEM" && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Combined Feed Container */}
        <View style={styles.feedContainer}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={CYAN_ACCENT} style={{ marginTop: 40 }} />
          ) : (
            <>
              {activeTab === "ALL" && (
                <>
                  {posts.map((post) => (
                    <View key={post.id} style={styles.postCard}>
                      <View style={styles.postHeader}>
                        <View style={styles.postAvatar}>
                          <Text style={styles.postAvatarText}>{post.user_full_name?.charAt(0) || "U"}</Text>
                        </View>
                        <View>
                          <Text style={styles.postUserName}>{post.user_full_name}</Text>
                          <Text style={styles.postTime}>{new Date(post.created_at).toLocaleDateString()}</Text>
                        </View>
                      </View>
                      <Text style={styles.postContent}>{post.content}</Text>
                      {post.image_url && (
                        <View style={styles.postImagePlaceholder} />
                      )}
                      <View style={styles.postFooter}>
                        <TouchableOpacity style={styles.postAction}>
                          <Ionicons name="heart-outline" size={18} color={TEXT_SECONDARY} />
                          <Text style={styles.postActionText}>{post.likes_count || 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.postAction}>
                          <Ionicons name="chatbubble-outline" size={18} color={TEXT_SECONDARY} />
                          <Text style={styles.postActionText}>{post.comments_count || 0}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {(activeTab === "ALL" || activeTab === "JOBS") && (
                <>
                  <View style={styles.jobFeedHeader}>
                    <Text style={styles.sectionTitle}>Available Jobs</Text>
                    <View style={styles.jobTypeTabs}>
                      <TouchableOpacity onPress={() => setJobType("Short-term")}>
                         <Text style={[styles.jobTypeText, jobType === "Short-term" && styles.jobTypeTextActive]}>Short</Text>
                      </TouchableOpacity>
                      <Text style={{ color: TEXT_MUTED }}>|</Text>
                      <TouchableOpacity onPress={() => setJobType("Long-term")}>
                         <Text style={[styles.jobTypeText, jobType === "Long-term" && styles.jobTypeTextActive]}>Long</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {jobs.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="documents-outline" size={64} color={TEXT_MUTED} />
                      <Text style={styles.emptyText}>Hiện chưa có công việc nào phù hợp</Text>
                    </View>
                  ) : (
                    jobs.map((job) => (
                      <TouchableOpacity
                        key={job.id}
                        style={styles.jobCard}
                        onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
                        activeOpacity={0.8}
                      >
                        <View style={styles.jobCardHeader}>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{job.category_name}</Text>
                          </View>
                          <Text style={styles.timeText}>{new Date(job.created_at).toLocaleDateString()}</Text>
                        </View>
                        
                        <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                        
                        <View style={styles.jobInfoRow}>
                          <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={14} color={CYAN_ACCENT} />
                            <Text style={styles.infoText}>{job.job_type === "SHORT_TERM" ? "Short-term" : "Long-term"}</Text>
                          </View>
                          <View style={styles.infoItem}>
                            <Ionicons name="wallet-outline" size={14} color={AMBER} />
                            <Text style={[styles.infoText, { color: AMBER }]}>{getFormatPrice(job.budget)}</Text>
                          </View>
                        </View>

                        <Text style={styles.description} numberOfLines={3}>
                          {job.description || "No description provided. Click to view details."}
                        </Text>

                        <View style={styles.jobCardFooter}>
                          <View style={styles.verifiedRow}>
                            <Ionicons name="shield-checkmark" size={16} color={EMERALD} />
                            <Text style={styles.verifiedText}>Escrow Protected</Text>
                          </View>
                          <TouchableOpacity style={styles.applyDetailBtn} onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}>
                            <Text style={styles.applyBtnText}>View Details</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_BASE,
    paddingTop: Platform.OS === "ios" ? 44 : 20,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: CYAN_ACCENT + "20",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: EMERALD,
  },
  statusText: {
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "900",
    color: EMERALD,
    letterSpacing: 1,
  },
  systemTag: {
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "900",
    color: PURPLE,
    letterSpacing: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerWelcome: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: TEXT_PRIMARY,
  },
  textCyan: {
    color: CYAN_ACCENT,
  },
  quickAccessGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickAction: {
    alignItems: "center",
    gap: 8,
  },
  actionIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 12,
  },
  sectionLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  sectionTitleCap: {
    fontSize: 10,
    fontWeight: "900",
    color: CYAN_ACCENT,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 2,
  },
  recommendedScroll: {
    marginBottom: 30,
  },
  recommendedCard: {
    width: 260,
    marginRight: 15,
    backgroundColor: BG_SURFACE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: CYAN_ACCENT + "20",
    borderLeftWidth: 3,
    borderLeftColor: CYAN_ACCENT,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: CYAN_ACCENT,
    marginBottom: 8,
  },
  recDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 12,
  },
  recFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recBudget: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  feedLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activeFeedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: BG_SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CYAN_ACCENT + "30",
  },
  activeFeedText: {
    fontSize: 10,
    fontWeight: "900",
    color: CYAN_ACCENT,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  feedTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  feedTabActive: {
    //
  },
  feedTabText: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  feedTabTextActive: {
    color: CYAN_ACCENT,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    backgroundColor: CYAN_ACCENT,
    width: "60%",
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  feedContainer: {
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: BG_CARD,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: CYAN_ACCENT + "20",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CYAN_ACCENT + "40",
  },
  postAvatarText: {
    fontSize: 18,
    fontWeight: "900",
    color: CYAN_ACCENT,
  },
  postUserName: {
    fontSize: 15,
    fontWeight: "900",
    color: TEXT_PRIMARY,
  },
  postTime: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: 16,
  },
  postImagePlaceholder: {
    height: 200,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  postActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT_SECONDARY,
  },
  jobFeedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT_PRIMARY,
  },
  jobCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "800",
    color: CYAN_ACCENT,
    textTransform: "uppercase",
  },
  timeText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    marginBottom: 12,
    lineHeight: 24,
  },
  jobInfoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: EMERALD,
  },
  jobTypeTabs: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  jobTypeText: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT_MUTED,
  },
  jobTypeTextActive: {
    color: CYAN_ACCENT,
  },
  applyDetailBtn: {
    backgroundColor: CYAN_ACCENT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: TEXT_SECONDARY,
    fontSize: 16,
    textAlign: "center",
  },
});
