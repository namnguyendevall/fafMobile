import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, Platform, Alert } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { getPublicProfile, startChat } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#e2e8f0";
const TEXT_MUTED = "#94a3b8";
const EMERALD = "#34d399";
const AMBER = "#f59e0b";

export default function OtherProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getPublicProfile(userId);
        if (res.success) {
          setUser(res.data);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleStartChat = async () => {
    try {
      if (!user) return;
      
      const res = await startChat(user.id);
      if (res.success && res.data) {
        const convId = res.data.id || res.data.conversationId;
        navigation.navigate("Chat", {
          conversationId: convId,
          partnerName: user.full_name,
        });
      } else {
        Alert.alert("Lỗi", "Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Start chat error:", err);
      Alert.alert("Lỗi", "Đã xảy ra sự cố khi mở chat.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={CYAN_ACCENT} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="person-circle-outline" size={64} color={TEXT_MUTED} />
        <Text style={[styles.groupTitle, { marginTop: 10 }]}>Người dùng không tồn tại</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {user?.avatar_url || user?.avatar ? (
                <Image source={{ uri: user.avatar_url || user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitial}>{user?.full_name?.charAt(0) || "U"}</Text>
              )}
            </View>
          </View>
          <Text style={styles.userName}>{user?.full_name || "User Name"}</Text>
          <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
          
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || "WORKER"}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
             <Ionicons name="chatbubble-ellipses" size={18} color="#000" />
             <Text style={styles.chatButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    paddingTop: 40,
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  avatarWrap: {
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
  groupTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_MUTED,
  },
  actionRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 20
  },
  chatButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CYAN_ACCENT,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 16,
      gap: 8,
  },
  chatButtonText: {
      color: "#000",
      fontWeight: '900',
      fontSize: 14,
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
