import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getChatMessages, sendChatMessage, getCurrentUserProfile } from "../../service/api";

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const BG_CARD = "#1e293b";
const CYAN_ACCENT = "#0891b2";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const MSG_ME = "#0369a1";
const MSG_THEM = "#1e293b";

export default function ChatScreen({ route, navigation }) {
  const { conversationId, partnerName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchMessages();
    
    // Polling for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    const res = await getCurrentUserProfile();
    if (res.success) {
      setCurrentUser(res.data);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await getChatMessages(conversationId);
      if (res.success) {
        const newMessages = res.data || [];
        // Update if count or last message ID changed
        const lastOldId = messages.length > 0 ? messages[messages.length - 1].id : null;
        const lastNewId = newMessages.length > 0 ? newMessages[newMessages.length - 1].id : null;
        
        if (lastNewId !== lastOldId) {
          setMessages(newMessages);
          // Only scroll if it's the first load or a new message arrived
          if (!lastOldId || lastNewId !== lastOldId) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }
        }
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    const text = inputText.trim();
    setInputText("");

    try {
      const res = await sendChatMessage(conversationId, text);
      if (res.success) {
        // Optimistic update
        setMessages((prev) => [...prev, res.data]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = currentUser && item.sender_id === currentUser.id;
    const isSystem = item.type === 'SYSTEM';

    if (isSystem) {
      return (
        <View style={styles.systemMsgContainer}>
          <Text style={styles.systemMsgText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={CYAN_ACCENT} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{partnerName || "Trò chuyện"}</Text>
          <View style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Trực tuyến</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CYAN_ACCENT} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color={CYAN_ACCENT} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={TEXT_MUTED}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const TEXT_MUTED = "#475569";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BG_SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  moreBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginVertical: 4,
    flexDirection: "row",
  },
  myMsgWrapper: {
    justifyContent: "flex-end",
  },
  theirMsgWrapper: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: MSG_ME,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: MSG_THEM,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#FFF",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  systemMsgContainer: {
    alignItems: "center",
    marginVertical: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  systemMsgText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontStyle: "italic",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: BG_SURFACE,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  attachBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    color: TEXT_PRIMARY,
    fontSize: 15,
    marginHorizontal: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CYAN_ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#1e293b",
    opacity: 0.5,
  },
});
