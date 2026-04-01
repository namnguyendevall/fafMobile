import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUsers, deleteUserByAdmin } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#e2e8f0";
const TEXT_MUTED = "#94a3b8";
const ROSE = "#f43f5e";

export default function AdminUserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      "XÁC NHẬN XÓA",
      `Bạn có chắc chắn muốn xóa tài khoản của ${user.full_name || user.email}?\n\nLưu ý: Chỉ thực hiện được khi user không còn điểm và không có job đang thực hiện.`,
      [
        { text: "BỎ QUA", style: "cancel" },
        { 
          text: "XÓA NGAY", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteUserByAdmin(user.id);
              if (res.success) {
                Alert.alert("Thành công", "Đã xóa tài khoản người dùng.");
                fetchUsers();
              } else {
                Alert.alert("Lỗi", res.error || "Không thể xóa người dùng này.");
              }
            } catch (err) {
                Alert.alert("Lỗi", "Có lỗi xảy ra khi xóa.");
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase())) &&
    u.status !== 'DELETED'
  );

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.full_name || item.email || "U").charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.userName}>{item.full_name || "Chưa cập nhật"}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.roleBadge}>
             <Text style={styles.roleText}>{item.role?.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => handleDeleteUser(item)}
      >
        <Ionicons name="trash-outline" size={20} color={ROSE} />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={CYAN_ACCENT} style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={TEXT_MUTED} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm user theo tên hoặc email..."
          placeholderTextColor={TEXT_MUTED}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList 
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={CYAN_ACCENT} />}
        ListEmptyComponent={
            <View style={styles.empty}>
                <Text style={styles.emptyText}>Không tìm thấy người dùng nào.</Text>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    margin: 20,
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CYAN_ACCENT + "20",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CYAN_ACCENT,
    marginRight: 12,
  },
  avatarText: {
    color: CYAN_ACCENT,
    fontWeight: "800",
    fontSize: 18,
  },
  details: {
    flex: 1,
  },
  userName: {
    color: TEXT_PRIMARY,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
  },
  userEmail: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: TEXT_MUTED,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ROSE + "10",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ROSE + "20",
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 15,
  }
});
