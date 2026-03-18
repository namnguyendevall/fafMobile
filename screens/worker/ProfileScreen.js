import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, RefreshControl, Alert, Platform } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUserProfile } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#e2e8f0";
const TEXT_MUTED = "#94a3b8";
const EMERALD = "#34d399";
const AMBER = "#f59e0b";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const profileRes = await getCurrentUserProfile();
      if (profileRes.success) {
        setUser(profileRes.data);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Đăng xuất", 
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("token");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (err) {
            console.error("Logout error:", err);
            navigation.navigate("Login");
          }
        } 
      },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, color = TEXT_SECONDARY }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconWrap, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Wallet Section */}
        <TouchableOpacity 
          style={styles.walletCard}
          onPress={() => navigation.navigate("Wallet")}
        >
          <View style={styles.walletHeader}>
            <View style={styles.walletInfo}>
              <FontAwesome name="google-wallet" size={20} color={CYAN_ACCENT} />
              <Text style={styles.walletLabel}>VÍ FAF_CREDITS</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={TEXT_SECONDARY} />
          </View>
          <View style={styles.walletBalanceRow}>
            <Text style={styles.walletBalance}>{user?.balance_points?.toLocaleString() || 0}</Text>
            <Text style={styles.walletCurrency}>CRED</Text>
            <View style={styles.depositLabel}>
              <Text style={styles.depositText}>NẠP TIỀN</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Profile Info Section */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={CYAN_ACCENT} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Profile Header */}
            <View style={styles.header}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarInitial}>{user?.full_name?.charAt(0) || "U"}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.editBadge} onPress={() => navigation.navigate("EditProfile")}>
                  <Ionicons name="pencil" size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{user?.full_name || "User Name"}</Text>
              <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
              
              <View style={styles.roleTag}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase() || "WORKER"}</Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuGroup}>
              <Text style={styles.groupTitle}>Hoạt động</Text>
              <MenuItem 
                icon="document-text-outline" 
                label="Công việc đã ứng tuyển" 
                color={CYAN_ACCENT} 
                onPress={() => navigation.navigate("MyProposals")} 
              />
              <MenuItem 
                icon="briefcase-outline" 
                label="Lịch sử công việc" 
                color={CYAN_ACCENT} 
                onPress={() => navigation.navigate("WorkHistory")} 
              />
              <MenuItem 
                icon="notifications-outline" 
                label="Thông báo" 
                color={AMBER}
                onPress={() => navigation.navigate("Notification")} 
              />
              <MenuItem 
                icon="chatbox-outline" 
                label="Tin nhắn" 
                color={EMERALD}
                onPress={() => navigation.navigate("Message")} 
              />
            </View>

            <View style={styles.menuGroup}>
              <Text style={styles.groupTitle}>Tài khoản</Text>
              <MenuItem icon="person-outline" label="Chỉnh sửa hồ sơ" onPress={() => navigation.navigate("EditProfile")} />
              <MenuItem 
                icon="lock-closed-outline" 
                label="Bảo mật & Mật khẩu" 
                onPress={() => navigation.navigate("ChangePassword")} 
              />
            </View>

            {/* CV Section: Education */}
            {user?.education?.length > 0 && (
              <View style={styles.cvSection}>
                <View style={styles.cvHeader}>
                  <Ionicons name="school-outline" size={18} color={CYAN_ACCENT} />
                  <Text style={styles.cvTitle}>Học vấn</Text>
                </View>
                {user.education.map((edu, idx) => (
                  <View key={idx} style={styles.cvItem}>
                    <Text style={styles.cvItemTitle}>{edu.school}</Text>
                    <Text style={styles.cvItemSub}>{edu.degree}</Text>
                    <Text style={styles.cvItemDate}>{edu.start_year} - {edu.end_year}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* CV Section: Experience */}
            {user?.experience?.length > 0 && (
              <View style={styles.cvSection}>
                <View style={styles.cvHeader}>
                  <Ionicons name="briefcase-outline" size={18} color={EMERALD} />
                  <Text style={[styles.cvTitle, { color: EMERALD }]}>Kinh nghiệm</Text>
                </View>
                {user.experience.map((exp, idx) => (
                  <View key={idx} style={styles.cvItem}>
                    <Text style={styles.cvItemTitle}>{exp.company}</Text>
                    <Text style={styles.cvItemSub}>{exp.role}</Text>
                    <Text style={styles.cvItemDate}>{exp.start_date} - {exp.end_date}</Text>
                    {exp.description && <Text style={styles.cvItemDesc}>{exp.description}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Portfolio Section */}
            {user?.portfolio?.length > 0 && (
              <View style={styles.cvSection}>
                <View style={styles.cvHeader}>
                  <Ionicons name="layers-outline" size={18} color={AMBER} />
                  <Text style={[styles.cvTitle, { color: AMBER }]}>Dự án (Portfolio)</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.portfolioScroll}>
                  {user.portfolio.map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.portfolioCard}>
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.portfolioImage} />
                      ) : (
                        <View style={styles.portfolioPlaceholder}>
                          <Ionicons name="image-outline" size={30} color={TEXT_MUTED} />
                        </View>
                      )}
                      <View style={styles.portfolioOverlay}>
                        <Text style={styles.portfolioTitle} numberOfLines={1}>{item.title}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.menuGroup}>
              <Text style={styles.groupTitle}>Hỗ trợ</Text>
              <MenuItem icon="help-circle-outline" label="Trợ giúp & Hỗ trợ" />
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#f43f5e" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Phiên bản 1.0.0 (Worker Edition)</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 80,
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: CYAN_ACCENT,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: "800",
    color: CYAN_ACCENT,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: CYAN_ACCENT,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BG_SURFACE,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 12,
  },
  roleTag: {
    backgroundColor: CYAN_ACCENT + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CYAN_ACCENT,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "800",
    color: CYAN_ACCENT,
  },
  menuGroup: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f43f5e10",
    borderWidth: 1,
    borderColor: "#f43f5e30",
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f43f5e",
  },
  versionText: {
    textAlign: "center",
    color: TEXT_MUTED,
    fontSize: 12,
    marginTop: 30,
  },
  cvSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: BG_SURFACE,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cvHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cvTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: CYAN_ACCENT,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cvItem: {
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: "#1e293b",
    paddingLeft: 12,
  },
  cvItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  cvItemSub: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  cvItemDate: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cvItemDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 6,
    lineHeight: 18,
  },
  portfolioScroll: {
    paddingRight: 20,
    gap: 12,
  },
  walletCard: {
    backgroundColor: BG_SURFACE,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  walletLabel: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  walletBalanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  walletBalance: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  walletCurrency: {
    color: CYAN_ACCENT,
    fontSize: 12,
    fontWeight: "700",
  },
  depositLabel: {
    marginLeft: "auto",
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.3)",
  },
  depositText: {
    color: CYAN_ACCENT,
    fontSize: 10,
    fontWeight: "900",
  },
  infoCard: {
    width: 200,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: BG_CARD,
  },
  portfolioCard: {
    width: 200,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  portfolioImage: {
    width: "100%",
    height: "100%",
  },
  portfolioPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG_CARD,
  },
  portfolioOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  portfolioTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
    textTransform: "uppercase",
  }
});
