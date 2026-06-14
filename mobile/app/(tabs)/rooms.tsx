import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_ROOMS } from "@/lib/slotLogic";

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  minBet: number;
  pot: number;
}

export default function RoomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  function handleJoin(room: Room) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/room/${room.id}?name=${encodeURIComponent(room.name)}`);
  }

  function handleCreate() {
    if (!newRoomName.trim()) return;
    const newRoom: Room = {
      id: Date.now().toString(36),
      name: newRoomName.trim(),
      players: 1,
      maxPlayers: 6,
      minBet: 10,
      pot: 0,
    };
    setRooms((prev) => [newRoom, ...prev]);
    setNewRoomName("");
    setShowCreate(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/room/${newRoom.id}?name=${encodeURIComponent(newRoom.name)}`);
  }

  function renderRoom({ item }: { item: Room }) {
    const isFull = item.players >= item.maxPlayers;
    const fillPercent = item.players / item.maxPlayers;
    return (
      <View style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient
          colors={["#ff2d7808", "#07071a00"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.roomTop}>
          <Text style={[styles.roomName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.liveDot, { backgroundColor: isFull ? colors.error : colors.success }]} />
        </View>

        <View style={styles.roomStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.secondary }]}>
              {item.players}/{item.maxPlayers}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Players</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.gold }]}>
              {item.pot.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pot</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.primary }]}>{item.minBet}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Min Bet</Text>
          </View>
        </View>

        {/* Player bar */}
        <View style={[styles.playerBarBg, { backgroundColor: colors.border }]}>
          <View style={[styles.playerBarFill, { width: `${fillPercent * 100}%`, backgroundColor: isFull ? colors.error : colors.success }]} />
        </View>

        <Pressable
          style={[styles.joinBtn, { backgroundColor: isFull ? colors.border : colors.primary }, isFull && { opacity: 0.5 }]}
          onPress={() => !isFull && handleJoin(item)}
          disabled={isFull}
        >
          <Text style={[styles.joinBtnText, { color: isFull ? colors.mutedForeground : colors.primaryForeground }]}>
            {isFull ? "FULL" : "JOIN ROOM"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#07071a", "#0d0d28", "#07071a"]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Rooms</Text>
        <Pressable
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreate(true)}
        >
          <Text style={[styles.createBtnText, { color: colors.primaryForeground }]}>+ Create</Text>
        </Pressable>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Create Room Modal */}
      <Modal transparent animationType="fade" visible={showCreate} onRequestClose={() => setShowCreate(false)}>
        <Pressable style={[styles.modalBg, { backgroundColor: "rgba(7,7,26,0.9)" }]} onPress={() => setShowCreate(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Room</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="Room name..."
              placeholderTextColor={colors.mutedForeground}
              value={newRoomName}
              onChangeText={setNewRoomName}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
              autoFocus
            />
            <Pressable
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreate}
            >
              <Text style={[styles.modalBtnText, { color: colors.primaryForeground }]}>CREATE</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 24, paddingBottom: 16 },
  screenTitle: { fontSize: 28, fontWeight: "900" },
  createBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  createBtnText: { fontSize: 13, fontWeight: "800" },
  list: { paddingHorizontal: 20 },
  roomCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    gap: 12,
    overflow: "hidden",
  },
  roomTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roomName: { fontSize: 17, fontWeight: "800", flex: 1 },
  liveDot: { width: 10, height: 10, borderRadius: 5 },
  roomStats: { flexDirection: "row", gap: 0 },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 1 },
  playerBarBg: { height: 4, borderRadius: 2, overflow: "hidden" },
  playerBarFill: { height: "100%", borderRadius: 2 },
  joinBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  joinBtnText: { fontSize: 13, fontWeight: "800", letterSpacing: 2 },
  modalBg: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalCard: { width: 300, borderRadius: 20, borderWidth: 1.5, padding: 24, gap: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  modalInput: { height: 48, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  modalBtn: { height: 48, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modalBtnText: { fontSize: 14, fontWeight: "800", letterSpacing: 2 },
});
