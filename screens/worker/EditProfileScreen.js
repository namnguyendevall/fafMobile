import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TextInput, 
  Alert, 
  Image, 
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUserProfile, updateUserProfile } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#e2e8f0";
const TEXT_MUTED = "#94a3b8";
const EMERALD = "#34d399";
const AMBER = "#fbbf24";

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    location: "",
    bio: "",
    hourly_rate: "",
    availability: "available",
    avatar_url: "",
    skills: [],
    education: [],
    experience: [],
    portfolio: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getCurrentUserProfile();
      if (res.success) {
        const user = res.data;
        setFormData({
            full_name: user.full_name || "",
            location: user.location || "",
            bio: user.bio || "",
            hourly_rate: user.hourly_rate ? user.hourly_rate.toString() : "",
            availability: user.availability || "available",
            avatar_url: user.avatar_url || "",
            skills: Array.isArray(user.skills) ? user.skills : [],
            education: Array.isArray(user.education) ? user.education : [],
            experience: Array.isArray(user.experience) ? user.experience : [],
            portfolio: Array.isArray(user.portfolio) ? user.portfolio : []
        });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field, template) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], template] }));
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (field, index, key, value) => {
    setFormData(prev => {
      const newList = [...prev[field]];
      newList[index] = { ...newList[index], [key]: value };
      return { ...prev, [field]: newList };
    });
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // In a real app, you'd upload this to Cloudinary/S3
      // For now, we'll just set it locally (the backend might need a URL)
      // Since web uses /uploads/submission, we'd need a similar logic here
      // Let's assume the user can just paste a URL for now or we leave it as is
      setFormData(prev => ({ ...prev, avatar_url: result.assets[0].uri }));
      Alert.alert("Lưu ý", "Tính năng tải ảnh lên đang được phát triển. Tạm thời ảnh sẽ chỉ hiển thị ở máy bạn.");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null
      };
      
      const res = await updateUserProfile(payload);
      if (res.success) {
        Alert.alert("Thành công", "Đã cập nhật hồ sơ thành công!");
        navigation.goBack();
      } else {
        Alert.alert("Lỗi", res.error || "Không thể cập nhật hồ sơ");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const renderSectionHeader = (title, icon, color = CYAN_ACCENT) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.sectionTitle, { color }]}>{title.toUpperCase()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={CYAN_ACCENT} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {formData.avatar_url ? (
                <Image source={{ uri: formData.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitial}>{formData.full_name?.charAt(0) || "U"}</Text>
              )}
            </View>
            <View style={styles.editIconBadge}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={styles.formSection}>
          {renderSectionHeader("Thông tin cơ bản", "person-outline")}
          
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={formData.full_name}
            onChangeText={(v) => handleInputChange("full_name", v)}
            placeholder="Nhập họ và tên"
            placeholderTextColor={TEXT_MUTED}
          />

          <Text style={styles.label}>Địa điểm</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(v) => handleInputChange("location", v)}
            placeholder="Ví dụ: TP. Hồ Chí Minh, Việt Nam"
            placeholderTextColor={TEXT_MUTED}
          />

          <Text style={styles.label}>Giới thiệu (Bio)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(v) => handleInputChange("bio", v)}
            placeholder="Viết vài dòng giới thiệu bản thân..."
            placeholderTextColor={TEXT_MUTED}
            multiline
            numberOfLines={4}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Phí mỗi giờ (CRED)</Text>
              <TextInput
                style={styles.input}
                value={formData.hourly_rate}
                onChangeText={(v) => handleInputChange("hourly_rate", v)}
                placeholder="50"
                placeholderTextColor={TEXT_MUTED}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.label}>Trạng thái</Text>
                <View style={[styles.availabilityContainer]}>
                    <TouchableOpacity 
                        style={[styles.availOption, formData.availability === 'available' && styles.availActive]}
                        onPress={() => handleInputChange('availability', 'available')}
                    >
                        <View style={[styles.dot, { backgroundColor: EMERALD }]} />
                        <Text style={[styles.availText, formData.availability === 'available' && styles.availTextActive]}>ONLINE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.availOption, formData.availability === 'busy' && styles.availActiveBusy]}
                        onPress={() => handleInputChange('availability', 'busy')}
                    >
                        <View style={[styles.dot, { backgroundColor: AMBER }]} />
                        <Text style={[styles.availText, formData.availability === 'busy' && styles.availTextActiveBusy]}>BẬN</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </View>
        </View>

        {/* Education Section */}
        <View style={styles.formSection}>
          {renderSectionHeader("Học vấn", "school-outline", CYAN_ACCENT)}
          
          {formData.education.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem("education", index)}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.smallInput}
                value={item.school}
                onChangeText={(v) => updateItem("education", index, "school", v)}
                placeholder="Trường học"
                placeholderTextColor={TEXT_MUTED}
              />
              <TextInput
                style={styles.smallInput}
                value={item.degree}
                onChangeText={(v) => updateItem("education", index, "degree", v)}
                placeholder="Bằng cấp"
                placeholderTextColor={TEXT_MUTED}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.smallInput, { flex: 1, marginRight: 10 }]}
                  value={item.start_year}
                  onChangeText={(v) => updateItem("education", index, "start_year", v)}
                  placeholder="Từ (2018)"
                  placeholderTextColor={TEXT_MUTED}
                />
                <TextInput
                  style={[styles.smallInput, { flex: 1 }]}
                  value={item.end_year}
                  onChangeText={(v) => updateItem("education", index, "end_year", v)}
                  placeholder="Đến (2022)"
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => addItem("education", { school: "", degree: "", start_year: "", end_year: "" })}
          >
            <Ionicons name="add-circle-outline" size={18} color={CYAN_ACCENT} />
            <Text style={styles.addBtnText}>THÊM HỌC VẤN</Text>
          </TouchableOpacity>
        </View>

        {/* Experience Section */}
        <View style={styles.formSection}>
          {renderSectionHeader("Kinh nghiệm", "briefcase-outline", EMERALD)}
          
          {formData.experience.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem("experience", index)}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.smallInput}
                value={item.company}
                onChangeText={(v) => updateItem("experience", index, "company", v)}
                placeholder="Công ty"
                placeholderTextColor={TEXT_MUTED}
              />
              <TextInput
                style={styles.smallInput}
                value={item.role}
                onChangeText={(v) => updateItem("experience", index, "role", v)}
                placeholder="Vị trí"
                placeholderTextColor={TEXT_MUTED}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.smallInput, { flex: 1, marginRight: 10 }]}
                  value={item.start_date}
                  onChangeText={(v) => updateItem("experience", index, "start_date", v)}
                  placeholder="Từ (T1/2020)"
                  placeholderTextColor={TEXT_MUTED}
                />
                <TextInput
                  style={[styles.smallInput, { flex: 1 }]}
                  value={item.end_date}
                  onChangeText={(v) => updateItem("experience", index, "end_date", v)}
                  placeholder="Đến (Hiện tại)"
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>
              <TextInput
                style={[styles.smallInput, styles.textAreaSmall]}
                value={item.description}
                onChangeText={(v) => updateItem("experience", index, "description", v)}
                placeholder="Mô tả công việc"
                placeholderTextColor={TEXT_MUTED}
                multiline
              />
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => addItem("experience", { company: "", role: "", start_date: "", end_date: "", description: "" })}
          >
            <Ionicons name="add-circle-outline" size={18} color={EMERALD} />
            <Text style={[styles.addBtnText, { color: EMERALD }]}>THÊM KINH NGHIỆM</Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio Section */}
        <View style={styles.formSection}>
          {renderSectionHeader("Dự án (Portfolio)", "layers-outline", AMBER)}
          
          {formData.portfolio.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem("portfolio", index)}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.smallInput}
                value={item.title}
                onChangeText={(v) => updateItem("portfolio", index, "title", v)}
                placeholder="Tên dự án"
                placeholderTextColor={TEXT_MUTED}
              />
              <TextInput
                style={styles.smallInput}
                value={item.link}
                onChangeText={(v) => updateItem("portfolio", index, "link", v)}
                placeholder="Link dự án (URL)"
                placeholderTextColor={TEXT_MUTED}
              />
              <TextInput
                style={styles.smallInput}
                value={item.image_url}
                onChangeText={(v) => updateItem("portfolio", index, "image_url", v)}
                placeholder="Link ảnh minh họa"
                placeholderTextColor={TEXT_MUTED}
              />
              <TextInput
                style={[styles.smallInput, styles.textAreaSmall]}
                value={item.description}
                onChangeText={(v) => updateItem("portfolio", index, "description", v)}
                placeholder="Mô tả dự án"
                placeholderTextColor={TEXT_MUTED}
                multiline
              />
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => addItem("portfolio", { title: "", link: "", image_url: "", description: "" })}
          >
            <Ionicons name="add-circle-outline" size={18} color={AMBER} />
            <Text style={[styles.addBtnText, { color: AMBER }]}>THÊM DỰ ÁN</Text>
          </TouchableOpacity>
        </View>

        {/* More sections can be added here (Education, Experience, Portfolio) */}
        {/* For now we keep it focused on the primary fields mentioned by the user */}

        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.disabledBtn]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>LƯU THAY ĐỔI</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BG_SURFACE,
    borderWidth: 3,
    borderColor: CYAN_ACCENT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: "900",
    color: CYAN_ACCENT,
  },
  editIconBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: CYAN_ACCENT,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: BG_BASE,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formSection: {
    backgroundColor: BG_SURFACE,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT_SECONDARY,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: TEXT_PRIMARY,
    fontSize: 15,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  availabilityContainer: {
    flexDirection: "row",
    gap: 10,
  },
  availOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: "#1e293b",
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  availActive: {
    borderColor: EMERALD,
    backgroundColor: EMERALD + "10",
  },
  availActiveBusy: {
    borderColor: AMBER,
    backgroundColor: AMBER + "10",
  },
  availTextActiveBusy: {
    color: AMBER,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availText: {
    fontSize: 10,
    fontWeight: "900",
    color: TEXT_MUTED,
  },
  availTextActive: {
    color: EMERALD,
  },
  listItem: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: BG_BASE,
    borderRadius: 12,
    zIndex: 10,
  },
  smallInput: {
    backgroundColor: BG_SURFACE,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: TEXT_PRIMARY,
    fontSize: 14,
    marginBottom: 12,
  },
  textAreaSmall: {
    height: 60,
    textAlignVertical: "top",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#1e293b",
    borderRadius: 12,
    gap: 8,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: CYAN_ACCENT,
    letterSpacing: 1,
  },
  saveBtn: {
    backgroundColor: EMERALD,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: EMERALD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  disabledBtn: {
    opacity: 0.6,
  }
});
