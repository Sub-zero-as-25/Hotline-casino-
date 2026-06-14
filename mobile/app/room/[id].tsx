import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { MOCK_CHAT_MESSAGES, MOCK_CHAT_USERS } from "@/lib/slotLogic";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
  timestamp: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

export default function RoomScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [input, setInput] = useState("");
  const flatRef = useRef<FlatList>(null);
  const msgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const initialPlayers: Player[] = [
      { id: user?.id ?? "me", name: user?.name ?? "You", avatar: user?.avatar ?? "Y" },
      ...MOCK_CHAT_USERS.slice(0, 3).map((n, i) => ({ id: `p${i}`, name: n, avatar: n[0] })),
    ];
    setPlayers(initialPlayers);

    const welcomeMsg: ChatMessage = {
      id: genId(),
      sender: "Hotline Casino",
      text: `Welcome to ${name ?? "the room"}! Good luck!`,
      isMe: false,
      timestamp: Date.now(),
    };
    setMessages([welcomeMsg]);

    msgIntervalRef.current = setInterval(() => {
      const sender = MOCK_CHAT_USERS[Math.floor(Math.random() * MOCK_CHAT_USERS.length)];
      const text = MOCK_CHAT_MESSAGES[Math.floor(Math.random() * MOCK_CHAT_MESSAGES.length)];
      const msg: ChatMessage = { id: genId(), sender, text, isMe: false, timestamp: Date.now() };
      setMessages((prev) => [msg, ...prev]);
    }, 4000 + Math.random() * 4000);

    return () => {
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
    };
  }, []);

  function sendMessage() {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: genId(),
      sender: user?.name ?? "You",
      text: input.trim(),
      isMe: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [msg, ...prev]);
    setInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function renderMsg({ item }: { item: ChatMessage }) {
    const isSystem = item.sender === "Hotline Casino";
    if (isSystem) {
      return (
        <View style={styles.systemMsgRow}>
          <Text style={[styles.systemMsg, { color: colors.gold }]}>{item.text}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.msgRow, item.isMe && styles.msgRowMe]}>
        {!item.isMe && (
          <View style={[styles.msgAvatar, { backgroundColor: colors.primary + "30" }]}>
            <Text style={[styles.msgAvatarText, { color: colors.primary }]}>{item.sender[0]}</Text>
          </View>
        )}
        <View style={[styles.msgBubble, {
          backgroundColor: item.isMe ? colors.primary : colors.card,
          borderColor: item.isMe ? colors.primary : colors.border,
          alignSelf: item.isMe ? "flex-end" : "flex-start",
        }]}>
          {!item.isMe && (
            <Text style={[styles.msgSender, { color: colors.secondary }]}>{item.sender}</Text>
          )}
          <Text style={[styles.msgText, { color: item.isMe ? colors.primaryForeground : colors.text }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#07071a", "#0d0d28", "#07071a"]} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Text style={[styles.backArrow, { color: colors.primary }]}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.roomName, { color: colors.text }]} numberOfLines={1}>
            {name ?? `Room ${id}`}
          </Text>
          <View style={styles.liveRow}>
            <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.liveText, { color: colors.success }]}>{players.length} players</Text>
          </View>
        </View>
      </View>

      {/* Player chips */}
      <View style={styles.playersRow}>
        {players.map((p) => (
          <View key={p.id} style={[styles.playerChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.playerAvatar, { backgroundColor: colors.primary + "30" }]}>
              <Text style={[styles.playerAvatarText, { color: colors.primary }]}>{p.avatar}</Text>
            </View>
            <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Chat */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMsg}
          inverted
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />

        {/* Input */}
        <View style={[styles.inputRow, {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 8),
        }]}>
          <TextInput
            style={[styles.chatInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, { backgroundColor: colors.primary }, !input.trim() && { opacity: 0.4 }]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: { width: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 32, fontWeight: "300", lineHeight: 40 },
  headerCenter: { flex: 1 },
  roomName: { fontSize: 20, fontWeight: "800" },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: "600" },
  playersRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12, flexWrap: "wrap" },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  playerAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  playerAvatarText: { fontSize: 11, fontWeight: "700" },
  playerName: { fontSize: 12, fontWeight: "600", maxWidth: 70 },
  divider: { height: 1, marginHorizontal: 16, marginBottom: 8 },
  chatArea: { flex: 1 },
  chatList: { padding: 16, paddingTop: 8 },
  msgRow: { flexDirection: "row", gap: 8, alignItems: "flex-end", marginBottom: 2 },
  msgRowMe: { flexDirection: "row-reverse" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  msgAvatarText: { fontSize: 12, fontWeight: "700" },
  msgBubble: { maxWidth: "72%", borderRadius: 14, borderWidth: 1, padding: 10, gap: 2 },
  msgSender: { fontSize: 11, fontWeight: "700" },
  msgText: { fontSize: 14, lineHeight: 20 },
  systemMsgRow: { alignItems: "center", paddingVertical: 4 },
  systemMsg: { fontSize: 12, fontStyle: "italic" },
  inputRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  chatInput: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  sendBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
