import React, { useState, useLayoutEffect, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getJobById, createProposal, getMyProposals, getContractByJob, requestContractOtp, signContract, submitCheckpoint, uploadFile } from "../../service/api";
import * as ImagePicker from "expo-image-picker";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#02040a";
const CYAN_ACCENT = "#22d3ee";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#e2e8f0";
const TEXT_MUTED = "#94a3b8";
const EMERALD = "#34d399";
const AMBER = "#fbbf24";

export default function JobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params || {};
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [myProposal, setMyProposal] = useState(null);
  
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [proposalData, setProposalData] = useState({
    total_amount: "",
    expected_days: "",
    cover_letter: "",
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Contract-related states
  const [contract, setContract] = useState(null);
  const [signingModalVisible, setSigningModalVisible] = useState(false);
  const [signatureOtp, setSignatureOtp] = useState("");
  const [signing, setSigning] = useState(false);
  
  // Work submission states
  const [submitWorkModalVisible, setSubmitWorkModalVisible] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    work_link: "",
    description: "",
  });

  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "success",
    onConfirm: null
  });

  // File states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Job
        const jobResult = await getJobById(jobId);
        if (jobResult.success) {
          setJob(jobResult.data);
          if (jobResult.data.budget) {
            setProposalData(prev => ({ ...prev, total_amount: jobResult.data.budget.toString() }));
          }
        } else {
          showCustomAlert("Lỗi", jobResult.error || "Không thể lấy thông tin công việc", "error");
        }

        // 2. Fetch Proposals to check if already applied
        const proposalsResult = await getMyProposals();
        if (proposalsResult.success) {
          const existing = proposalsResult.data.find(p => p.job_id === parseInt(jobId));
          if (existing) {
            setMyProposal(existing);
            
            // 3. If accepted, fetch contract
            if (existing.status === "ACCEPTED") {
              const contractRes = await getContractByJob(jobId);
              if (contractRes.success) {
                setContract(contractRes.data);
              }
            }
          }
        }
      } catch (err) {
        console.error("Fetch data error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchData();
  }, [jobId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
      headerLeft: () => (
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => setFavorited(!favorited)}>
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={24}
            color={favorited ? "#f43f5e" : TEXT_PRIMARY}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, favorited]);

  const handleApply = async () => {
    if (!proposalData.total_amount || !proposalData.expected_days || !proposalData.cover_letter) {
      showCustomAlert("Thông báo", "Vui lòng điền đầy đủ thông tin ứng tuyển", "error");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createProposal({
        jobId: parseInt(jobId),
        proposedPrice: parseFloat(proposalData.total_amount),
        coverLetter: proposalData.cover_letter,
        // Backend currently doesn't use expected_days, but we can't add it without migration
      });

      if (result.success) {
        showCustomAlert("Thành công", "Bạn đã gửi ứng tuyển cho công việc này!", "success", () => {
            setApplyModalVisible(false);
            navigation.goBack();
        });
      } else {
        showCustomAlert("Lỗi", result.error || "Ứng tuyển thất bại", "error");
      }
    } catch (err) {
      showCustomAlert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại sau", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestSign = async () => {
    if (!contract) return;
    setSigning(true);
    try {
        const res = await requestContractOtp(contract.id);
        if (res.success) {
            showCustomAlert("Xác thực", "Mã xác thực ký hợp đồng đã được gửi tới email của bạn.", "success", () => {
                setSigningModalVisible(true);
            });
        } else {
            showCustomAlert("Lỗi", res.error || "Không thể gửi mã xác thực.", "error");
        }
    } catch (err) {
        showCustomAlert("Lỗi", "Có lỗi xảy ra khi yêu cầu mã xác thực.", "error");
    } finally {
        setSigning(false);
    }
  };

  const handleSignContract = async () => {
    if (!signatureOtp) {
        showCustomAlert("Thông báo", "Vui lòng nhập mã OTP.", "error");
        return;
    }
    setSigning(true);
    try {
        const res = await signContract(contract.id, signatureOtp);
        if (res.success) {
            showCustomAlert("Thành công", "Bạn đã ký hợp đồng. Chúc mừng bạn chính thức bắt đầu công việc!", "success", () => {
                setSigningModalVisible(false);
                setLoading(true);
                getJobById(jobId).then(jr => jr.success && setJob(jr.data));
                getContractByJob(jobId).then(cr => cr.success && setContract(cr.data)).finally(() => setLoading(false));
            });
        } else {
            showCustomAlert("Lỗi", res.error || "Mã OTP không đúng hoặc hợp đồng không hợp lệ.", "error");
        }
    } catch (err) {
        showCustomAlert("Lỗi", "Có lỗi xảy ra khi ký hợp đồng.", "error");
    } finally {
        setSigning(false);
    }
  };

  const handlePickFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
    });

    if (!result.canceled) {
        setSelectedFile(result.assets[0]);
    }
  };

  const handleSubmitWork = async () => {
    if (!submissionData.work_link && !selectedFile) {
        showCustomAlert("Thông báo", "Vui lòng cung cấp link bài làm hoặc tải ảnh đính kèm.", "error");
        return;
    }
    
    setSubmitting(true);
    try {
        let finalAttachment = submissionData.work_link;
        
        // Upload file if selected
        if (selectedFile) {
            setUploadingFile(true);
            const uploadRes = await uploadFile(selectedFile.uri);
            setUploadingFile(false);
            if (uploadRes.success) {
                finalAttachment = uploadRes.data.url;
            } else {
                showCustomAlert("Lỗi Upload", "Không thể tải file lên hệ thống. Vui lòng thử lại.", "error");
                setSubmitting(false);
                return;
            }
        }

        const res = await submitCheckpoint(selectedCheckpoint.id, {
            submission_url: finalAttachment,
            submission_notes: submissionData.description || "Nộp bài làm qua Mobile"
        });
        if (res.success) {
            showCustomAlert("Thành công", "Bạn đã nộp bài làm thành công. Đang chờ đối tác duyệt.", "success", () => {
                setSubmitWorkModalVisible(false);
                setSelectedFile(null);
                getJobById(jobId).then(jr => jr.success && setJob(jr.data));
            });
        } else {
            showCustomAlert("Lỗi", res.error || "Nộp bài làm thất bại.", "error");
        }
    } catch (err) {
        showCustomAlert("Lỗi", "Có lỗi xảy ra khi nộp bài làm.", "error");
    } finally {
        setSubmitting(false);
        setUploadingFile(false);
    }
  };

  const showCustomAlert = (title, message, type = "success", onConfirm = null) => {
    setAlertConfig({ title, message, type, onConfirm });
    setAlertVisible(true);
  };

  const handleAlertOK = () => {
    setAlertVisible(false);
    if (alertConfig.onConfirm) {
        alertConfig.onConfirm();
    }
  };

  const getFormatPrice = (price) => {
    if (price === null || price === undefined) return "0 Pts";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " CRED";
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED": return { color: EMERALD, bg: EMERALD + "15", border: EMERALD + "30" };
      case "REJECTED": return { color: "#f43f5e", bg: "#f43f5e" + "15", border: "#f43f5e" + "30" };
      case "PENDING": return { color: AMBER, bg: AMBER + "15", border: AMBER + "30" };
      default: return { color: TEXT_MUTED, bg: TEXT_MUTED + "15", border: TEXT_MUTED + "30" };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={CYAN_ACCENT} />
      </View>
    );
  }

  if (!job) return null;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Banner / Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{job.category_name}</Text>
          </View>
          <Text style={styles.title}>{job.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={CYAN_ACCENT} />
              <Text style={styles.metaText}>{job.job_type === "SHORT_TERM" ? "Short-term" : "Long-term"}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={CYAN_ACCENT} />
              <Text style={styles.metaText}>{job.location || "Remote"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Budget Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Budget</Text>
              <Text style={styles.infoValue}>{getFormatPrice(job.budget)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Timeline</Text>
              <Text style={styles.infoValue}>{job.expected_duration || "N/A"}</Text>
            </View>
          </View>

          {/* Secure Escrow */}
          <View style={styles.secureCard}>
            <Ionicons name="shield-checkmark" size={28} color={EMERALD} />
            <View style={styles.secureTextContent}>
              <Text style={styles.secureTitle}>FAF Secure Escrow</Text>
              <Text style={styles.secureDesc}>Thanh toán được giữ an toàn bởi FAF cho đến khi bạn hoàn thành công việc.</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả công việc</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kỹ năng yêu cầu</Text>
              <View style={styles.skillsGrid}>
                {job.skills.map((skill, index) => (
                  <View key={skill.id || index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Resources */}
          {job.resource_urls && job.resource_urls.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tài nguyên dự án</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resourceScroll}>
                {job.resource_urls.map((url, index) => {
                    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                    return (
                        <View key={index} style={styles.resourceItem}>
                             <View style={styles.resourceBox}>
                                {isVideo ? (
                                    <Ionicons name="play-circle" size={32} color={CYAN_ACCENT + "80"} />
                                ) : (
                                    <Ionicons name="image-outline" size={32} color={CYAN_ACCENT + "80"} />
                                )}
                                <Text style={styles.resourceLabel}>{isVideo ? `Video ${index+1}` : `Ảnh ${index+1}`}</Text>
                             </View>
                        </View>
                    );
                })}
              </ScrollView>
            </View>
          )}

          {/* Checkpoints / Milestones / Work submission */}
          {job.checkpoints && job.checkpoints.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{contract?.status === 'ACTIVE' ? 'Tiến độ công việc' : 'Lộ trình dự án'}</Text>
              <View style={styles.milestonesList}>
                {job.checkpoints.map((cp, index) => {
                  const isSubmitted = cp.status === 'SUBMITTED' || cp.status === 'APPROVED';
                  return (
                    <View key={cp.id || index} style={styles.milestoneItem}>
                      <View style={styles.milestoneLineWrap}>
                          <View style={[styles.milestoneDot, cp.status === 'APPROVED' && { backgroundColor: EMERALD }]} />
                          {index < job.checkpoints.length - 1 && <View style={styles.milestoneLine} />}
                      </View>
                      <View style={styles.milestoneContent}>
                          <View style={styles.milestoneHeader}>
                              <Text style={styles.milestoneTitle}>{cp.name}</Text>
                              <View style={styles.milestoneBadgeRow}>
                                  {cp.status === 'APPROVED' && (
                                      <View style={[styles.miniBadge, { backgroundColor: EMERALD + '20' }]}>
                                          <Text style={[styles.miniBadgeText, { color: EMERALD }]}>DONE</Text>
                                      </View>
                                  )}
                                  <Text style={styles.milestoneAmount}>{getFormatPrice(cp.amount)}</Text>
                              </View>
                          </View>
                          <Text style={styles.milestoneDesc}>{cp.description || "Không có mô tả"}</Text>
                          
                          {/* Work submission action */}
                          {contract?.status === 'ACTIVE' && (
                             <View style={styles.workActionArea}>
                                {cp.status === 'PENDING' || cp.status === 'REJECTED' ? (
                                    <TouchableOpacity 
                                        style={styles.btnWorkAction} 
                                        onPress={() => {
                                            setSelectedCheckpoint(cp);
                                            setSubmitWorkModalVisible(true);
                                        }}
                                    >
                                        <Ionicons name="cloud-upload-outline" size={16} color={CYAN_ACCENT} />
                                        <Text style={styles.btnWorkActionText}>{cp.status === 'REJECTED' ? 'Nộp lại bài làm' : 'Nộp bài làm'}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.submittedInfo}>
                                        <Ionicons name="time-outline" size={14} color={TEXT_MUTED} />
                                        <Text style={styles.submittedText}>
                                            {cp.status === 'SUBMITTED' ? 'Đã nộp, đang chờ duyệt' : 'Đối tác đã duyệt & thanh toán'}
                                        </Text>
                                    </View>
                                )}
                             </View>
                          )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.employerSection}>
            <Text style={styles.sectionTitle}>Nhà tuyển dụng</Text>
            <View style={styles.employerCard}>
              <View style={styles.employerAvatar}>
                <Text style={styles.avatarText}>
                  {(job.client?.full_name || job.client?.email || "E").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.employerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.employerName}>
                    {job.client?.full_name || job.client?.email?.split('@')[0] || "Employer"}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color={CYAN_ACCENT} />
                </View>
                <View style={styles.employerMeta}>
                  <Ionicons name="star" size={14} color={AMBER} />
                  <Text style={styles.ratingText}>4.8 • Đã xác minh thanh toán</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer or My Proposal Status */}
      <View style={styles.footer}>
        {myProposal ? (
            <View style={styles.appliedCard}>
                <View style={styles.appliedHeader}>
                    <View style={styles.appliedTag}>
                        <Ionicons name="checkmark-circle" size={14} color={EMERALD} />
                        <Text style={styles.appliedTagText}>BẠN ĐÃ ỨNG TUYỂN</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(myProposal.status).bg, borderColor: getStatusStyle(myProposal.status).border }]}>
                        <Text style={[styles.statusText, { color: getStatusStyle(myProposal.status).color }]}>{myProposal.status}</Text>
                    </View>
                </View>
                <Text style={styles.appliedPrice}>Giá đề xuất: <Text style={{ color: AMBER }}>{getFormatPrice(myProposal.proposed_price)}</Text></Text>
                <Text style={styles.appliedCoverLetter} numberOfLines={2}>"{myProposal.cover_letter}"</Text>
                
                {myProposal.status === 'ACCEPTED' && contract?.status === 'PENDING' && (
                    <TouchableOpacity style={styles.signContractBtn} onPress={handleRequestSign}>
                        <Ionicons name="document-text" size={20} color="#000" />
                        <Text style={styles.signContractText}>XEM & KÝ HỢP ĐỒNG</Text>
                    </TouchableOpacity>
                )}

                {contract?.status === 'ACTIVE' && (
                    <View style={styles.activeWorkFlag}>
                        <Ionicons name="briefcase" size={16} color={EMERALD} />
                        <Text style={styles.activeWorkText}>Hợp đồng đang thực hiện - Vui lòng nộp bài làm ở trên</Text>
                    </View>
                )}

                {!contract && myProposal.status === 'ACCEPTED' && (
                    <Text style={styles.waitingContractText}>Đang chờ nhà tuyển dụng tạo hợp đồng...</Text>
                )}

                <TouchableOpacity style={styles.viewProposalBtn} onPress={() => navigation.navigate("MyProposals")}>
                    <Text style={styles.viewProposalText}>Xem tất cả ứng tuyển</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <TouchableOpacity style={styles.applyBtn} onPress={() => setApplyModalVisible(true)}>
                <Text style={styles.applyBtnText}>Ứng tuyển ngay</Text>
            </TouchableOpacity>
        )}
      </View>

      {/* Application Modal */}
      <Modal visible={applyModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gửi đề xuất</Text>
              <TouchableOpacity onPress={() => setApplyModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giá đề xuất (Pts)</Text>
                <TextInput
                  style={styles.input}
                  value={proposalData.total_amount}
                  onChangeText={(v) => setProposalData({ ...proposalData, total_amount: v })}
                  keyboardType="numeric"
                  placeholder="Nhập giá của bạn"
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thời gian hoàn thành (Ngày)</Text>
                <TextInput
                  style={styles.input}
                  value={proposalData.expected_days}
                  onChangeText={(v) => setProposalData({ ...proposalData, expected_days: v })}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 3"
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thư ngỏ</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={proposalData.cover_letter}
                  onChangeText={(v) => setProposalData({ ...proposalData, cover_letter: v })}
                  multiline
                  numberOfLines={4}
                  placeholder="Giới thiệu về kỹ năng và kinh nghiệm của bạn..."
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && styles.btnDisabled]} 
                onPress={handleApply}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Gửi ứng tuyển</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Contract Signing Modal */}
      <Modal visible={signingModalVisible} animationType="fade" transparent>
        <View style={styles.alertOverlay}>
          <View style={styles.alertDialog}>
            <View style={[styles.alertIconWrap, { backgroundColor: CYAN_ACCENT + '20' }]}>
               <Ionicons name="keypad" size={40} color={CYAN_ACCENT} />
            </View>
            <Text style={styles.alertTitle}>KÝ HỢP ĐỒNG</Text>
            <Text style={styles.alertMessage}>Vui lòng nhập mã OTP đã được gửi tới email của bạn để xác thực ký kết.</Text>
            
            <TextInput
                 style={styles.otpInput}
                 value={signatureOtp}
                 onChangeText={setSignatureOtp}
                 placeholder="6 chữ số"
                 placeholderTextColor={TEXT_MUTED}
                 keyboardType="numeric"
                 maxLength={6}
            />

            <View style={styles.alertBtnRow}>
                <TouchableOpacity
                    style={styles.alertCancelBtn}
                    onPress={() => setSigningModalVisible(false)}
                >
                    <Text style={styles.alertCancelText}>HỦY</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.alertOKButton, { backgroundColor: EMERALD, flex: 1, marginTop: 0 }]}
                    onPress={handleSignContract}
                    disabled={signing}
                >
                    {signing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.alertOKText}>KÝ KẾT</Text>}
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submission Modal */}
      <Modal visible={submitWorkModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nộp bài làm</Text>
              <TouchableOpacity onPress={() => setSubmitWorkModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.milestoneContext}>Giai đoạn: {selectedCheckpoint?.name}</Text>
                
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Link kết quả / Tài nguyên (GitHub, Drive, v.v.)</Text>
                <TextInput
                  style={styles.input}
                  value={submissionData.work_link}
                  onChangeText={(v) => setSubmissionData({ ...submissionData, work_link: v })}
                  placeholder="https://..."
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.filePickerHeader}>
                    <Text style={styles.inputLabel}>Hoặc tải lên hình ảnh từ điện thoại</Text>
                    {selectedFile && (
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                            <Text style={styles.removeFileText}>Xóa</Text>
                        </TouchableOpacity>
                    )}
                </View>
                
                <TouchableOpacity 
                    style={[styles.filePickerBtn, selectedFile && styles.filePickerBtnActive]} 
                    onPress={handlePickFile}
                >
                    <Ionicons 
                        name={selectedFile ? "image" : "cloud-upload-outline"} 
                        size={24} 
                        color={selectedFile ? EMERALD : CYAN_ACCENT} 
                    />
                    <Text style={[styles.filePickerBtnText, selectedFile && { color: EMERALD }]}>
                        {selectedFile ? `Đã chọn: ${selectedFile.fileName || 'Ảnh bài làm'}` : "Chọn hình ảnh bài làm"}
                    </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú đính kèm</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={submissionData.description}
                  onChangeText={(v) => setSubmissionData({ ...submissionData, description: v })}
                  multiline
                  numberOfLines={4}
                  placeholder="Ghi chú cho đối tác xem..."
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, (submitting || uploadingFile) && styles.btnDisabled]} 
                onPress={handleSubmitWork}
                disabled={submitting || uploadingFile}
              >
                {submitting || uploadingFile ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Xác nhận nộp bài</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Global Custom Alert Modal */}
      <Modal visible={alertVisible} animationType="fade" transparent>
        <View style={styles.alertOverlay}>
          <View style={styles.alertDialog}>
            <View style={[styles.alertIconWrap, { backgroundColor: alertConfig.type === 'error' ? '#f43f5e20' : CYAN_ACCENT + '20' }]}>
               <Ionicons 
                name={alertConfig.type === 'error' ? "alert-circle" : "checkmark-circle"} 
                size={40} 
                color={alertConfig.type === 'error' ? "#f43f5e" : CYAN_ACCENT} 
               />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            
            <TouchableOpacity
                style={[styles.alertOKButton, { backgroundColor: alertConfig.type === 'error' ? '#f43f5e' : CYAN_ACCENT }]}
                onPress={handleAlertOK}
            >
                <Text style={styles.alertOKText}>XÁC NHẬN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    marginRight: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 250, // More space for the floating footer and safe area
  },
  heroSection: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: BG_SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: CYAN_ACCENT + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYAN_ACCENT,
    marginBottom: 16,
  },
  categoryText: {
    color: CYAN_ACCENT,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 16,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: "row",
    gap: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: BG_CARD,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 20,
    marginTop: -40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "800",
    color: AMBER,
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: "#1e293b",
  },
  secureCard: {
    flexDirection: "row",
    backgroundColor: EMERALD + "10",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: EMERALD + "30",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  secureTextContent: {
    flex: 1,
  },
  secureTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: EMERALD,
    marginBottom: 2,
  },
  secureDesc: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 24,
  },
  employerSection: {
    marginTop: 10,
  },
  employerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_SURFACE,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 12,
  },
  employerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: CYAN_ACCENT,
  },
  employerName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  employerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: BG_SURFACE,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  applyBtn: {
    backgroundColor: CYAN_ACCENT,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  applyBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  appliedCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CYAN_ACCENT + "30",
  },
  appliedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  appliedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  appliedTagText: {
    color: EMERALD,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  appliedPrice: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  appliedCoverLetter: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 12,
  },
  viewProposalBtn: {
    alignItems: "center",
  },
  viewProposalText: {
    color: CYAN_ACCENT,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: CYAN_ACCENT + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYAN_ACCENT + "40",
  },
  skillText: {
    color: CYAN_ACCENT,
    fontSize: 12,
    fontWeight: "700",
  },
  resourceScroll: {
    marginTop: 4,
  },
  resourceItem: {
    marginRight: 12,
  },
  resourceBox: {
    width: 140,
    height: 80,
    backgroundColor: BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  resourceLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  milestonesList: {
    marginTop: 8,
  },
  milestoneItem: {
    flexDirection: "row",
    gap: 16,
  },
  milestoneLineWrap: {
    alignItems: "center",
    width: 20,
  },
  milestoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: BG_BASE,
    zIndex: 2,
  },
  milestoneLine: {
    flex: 1,
    width: 1,
    backgroundColor: "#1e293b",
  },
  milestoneContent: {
    flex: 1,
    paddingBottom: 24,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  milestoneTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "700",
  },
  milestoneAmount: {
    color: EMERALD,
    fontSize: 14,
    fontWeight: "800",
  },
  milestoneDesc: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: BG_SURFACE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  closeBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: BG_BASE,
    borderRadius: 12,
    padding: 14,
    color: TEXT_PRIMARY,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: CYAN_ACCENT,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  signContractBtn: {
    flexDirection: "row",
    backgroundColor: CYAN_ACCENT,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  signContractText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "800",
  },
  activeWorkFlag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: EMERALD + "15",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  activeWorkText: {
    color: EMERALD,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  waitingContractText: {
    color: AMBER,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  milestoneBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workActionArea: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  btnWorkAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: CYAN_ACCENT + "10",
    borderWidth: 1,
    borderColor: CYAN_ACCENT + "30",
  },
  btnWorkActionText: {
    color: CYAN_ACCENT,
    fontSize: 13,
    fontWeight: "700",
  },
  submittedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  submittedText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontStyle: "italic",
  },
  otpInput: {
    width: "100%",
    backgroundColor: BG_BASE,
    borderRadius: 14,
    height: 56,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: CYAN_ACCENT,
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 24,
    marginTop: 10,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertDialog: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: BG_SURFACE,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  alertIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  alertBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  alertCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG_BASE,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  alertCancelText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: "700",
  },
  alertOKButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  alertOKText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  milestoneContext: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginBottom: 16,
    fontWeight: "600",
  },
  filePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  filePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_BASE,
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderStyle: "dashed",
    gap: 12,
  },
  filePickerBtnActive: {
    borderColor: EMERALD,
    backgroundColor: EMERALD + "05",
    borderStyle: "solid",
  },
  filePickerBtnText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  removeFileText: {
    color: "#f43f5e",
    fontSize: 12,
    fontWeight: "700",
  },
});
