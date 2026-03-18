import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getConversations } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";
const EMERALD = "#10b981";

export default function MessageScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const result = await getConversations();
      if (result.success) {
        setConversations(result.data || []);
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const getRandomColor = (name) => {
    const colors = ["#0891b2", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b"];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="create-outline" size={24} color={CYAN_ACCENT} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={CYAN_ACCENT} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={CYAN_ACCENT} style={{ marginTop: 40 }} />
        ) : conversations.length > 0 ? (
          <View style={styles.list}>
            {conversations.map((item) => {
              const otherUser = item.other_user || {};
              const partnerName = otherUser.full_name || otherUser.email || "User";
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.conversationItem}
                  onPress={() => navigation.navigate("Chat", { 
                    conversationId: item.id,
                    partnerName: partnerName
                  })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, { backgroundColor: getRandomColor(partnerName) }]}>
                    <Text style={styles.avatarText}>{partnerName.charAt(0).toUpperCase()}</Text>
                    <View style={styles.onlineStatus} />
                  </View>

                  <View style={styles.conversationBody}>
                    <View style={styles.conversationTop}>
                      <Text style={styles.name} numberOfLines={1}>{partnerName}</Text>
                      <Text style={styles.time}>
                        {item.last_message_at ? new Date(item.last_message_at).toLocaleDateString() : ""}
                      </Text>
                    </View>
                    <View style={styles.conversationBottom}>
                      <Text style={[styles.lastMsg, item.unread_count > 0 && styles.unreadMsg]} numberOfLines={1}>
                        {item.last_message || "Chưa có tin nhắn"}
                      </Text>
                      {item.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadCountText}>{item.unread_count}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={TEXT_MUTED} />
            <Text style={styles.emptyTitle}>Chưa có cuộc hội thoại nào</Text>
            <Text style={styles.emptySubtitle}>Khi bạn ứng tuyển hoặc nhận phản hồi, tin nhắn sẽ xuất hiện ở đây.</Text>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: BG_SURFACE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  iconBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  list: {
    paddingHorizontal: 0,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
  },
  onlineStatus: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: EMERALD,
    borderWidth: 2,
    borderColor: BG_BASE,
  },
  conversationBody: {
    flex: 1,
  },
  conversationTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  conversationBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lastMsg: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  unreadMsg: {
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  unreadBadge: {
    backgroundColor: CYAN_ACCENT,
    paddingHorizontal: 6,
    height: 20,
    minWidth: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCountText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
  },
});
