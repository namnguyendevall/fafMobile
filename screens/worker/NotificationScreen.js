import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getNotifications } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#475569";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";

function getIconConfig(type) {
  switch (type?.toUpperCase()) {
    case "PROPOSAL_ACCEPTED":
      return { name: "checkmark-circle-outline", color: EMERALD };
    case "PROPOSAL_REJECTED":
      return { name: "close-circle-outline", color: ROSE };
    case "NEW_MESSAGE":
      return { name: "mail-outline", color: CYAN_ACCENT };
    case "PAYMENT_RECEIVED":
      return { name: "wallet-outline", color: EMERALD };
    default:
      return { name: "notifications-outline", color: AMBER };
  }
}

function NotificationItem({ item, onPress }) {
  const isRead = item.status?.toLowerCase() === 'read' || item.is_read;
  const iconConfig = getIconConfig(item.type);
  
  return (
    <TouchableOpacity
      style={[styles.item, !isRead && styles.itemUnread]}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconConfig.color + "15" }]}>
        <Ionicons
          name={iconConfig.name}
          size={24}
          color={iconConfig.color}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.itemTitle, !isRead && styles.itemTitleUnread]}>
          {item.title}
        </Text>
        <Text style={styles.itemMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.footerRow}>
          <Ionicons name="time-outline" size={12} color={TEXT_MUTED} />
          <Text style={styles.itemTime}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
      </View>
      {!isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
}

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handlePress = (item) => {
    const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
    
    switch (item.type?.toUpperCase()) {
      case "NEW_MESSAGE":
        if (data?.conversationId) {
          navigation.navigate("Chat", { 
            conversationId: data.conversationId,
            partnerName: "Trò chuyện" // Default or could extracted if available
          });
        }
        break;
      case "PROPOSAL_ACCEPTED":
      case "PROPOSAL_REJECTED":
        if (data?.jobId) {
          navigation.navigate("JobDetail", { jobId: data.jobId });
        } else {
          navigation.navigate("MyProposals");
        }
        break;
      case "CHECKPOINT_SUBMITTED":
      case "CHECKPOINT_APPROVED":
      case "CHECKPOINT_REJECTED":
      case "CONTRACT_SIGNED":
        if (data?.jobId || data?.contractId) {
          // If we have jobId, JobDetail fetches contract automatically
          navigation.navigate("JobDetail", { 
            jobId: data.jobId,
            contractId: data.contractId 
          });
        }
        break;
      case "PAYMENT_RECEIVED":
        navigation.navigate("Wallet");
        break;
      default:
        console.log("Unhandled notification type:", item.type);
        break;
    }
  };

  const fetchNotifications = async () => {
    try {
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
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
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            onPress={handlePress} 
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={CYAN_ACCENT} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-off-outline" size={64} color={CYAN_ACCENT} />
            </View>
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptyText}>Hộp thư của bạn đang trống. Chúng tôi sẽ thông báo cho bạn khi có tin mới!</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: BG_SURFACE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  itemUnread: {
    borderColor: CYAN_ACCENT + "50",
    backgroundColor: BG_SURFACE,
    borderLeftWidth: 4,
    borderLeftColor: CYAN_ACCENT,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  itemTitleUnread: {
    color: "#FFF",
  },
  itemMessage: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemTime: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CYAN_ACCENT,
    marginTop: 6,
    marginLeft: 8,
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
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
  },
});
