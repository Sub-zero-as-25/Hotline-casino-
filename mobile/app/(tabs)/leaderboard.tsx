import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";
import { MOCK_LEADERBOARD } from "@/lib/slotLogic";

type SortMode = "balance" | "biggestWin";

const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];

interface LeaderboardEntry {
  id: string;
  name: string;
  balance: number;
  biggestWin: number;
  avatar: string;
  isMe?: boolean;
}

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { balance, stats } = useGame();
  const [mode, setMode] = useState<SortMode>("balance");

  const entries = useMemo<LeaderboardEntry[]>(() => {
    const myEntry: LeaderboardEntry = {
      id: user?.id ?? "me",
      name: user?.name ?? "You",
      balance,
      biggestWin: stats.biggestWin,
      avatar: user?.avatar ?? "Y",
      isMe: true,
    };
    const all = [...MOCK_LEADERBOARD.map((e) => ({ ...e, isMe: false })), myEntry];
    return all.sort((a, b) => (mode === "balance" ? b.balance - a.balance : b.biggestWin - a.biggestWin));
  }, [mode, balance, stats.biggestWin, user]);

  function renderItem({ item, index }: { item: LeaderboardEntry; index: number }) {
    const rank = index + 1;
    const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : colors.mutedForeground;
    const isTop = rank <= 3;

    return (
      <View style={[
        styles.row,
        { backgroundColor: item.isMe ? colors.primary + "18" : colors.card, borderColor: item.isMe ? colors.primary : colors.border },
      ]}>
        <View style={[styles.rankBadge, isTop && { backgroundColor: rankColor + "20" }]}>
          <Text style={[styles.rankText, { color: rankColor }]}>
            {rank <= 3 ? "★" : `#${rank}`}
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "30" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{item.avatar}</Text>
        </View>
        <View style={styles.nameBox}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}{item.isMe ? " (You)" : ""}
          </Text>
          <Text style={[styles.subVal, { color: colors.mutedForeground }]}>
            Best win: {item.biggestWin.toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.value, { color: mode === "balance" ? colors.gold : colors.success }]}>
          {(mode === "balance" ? item.balance : item.biggestWin).toLocaleString()}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#07071a", "#0d0d28", "#07071a"]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Leaderboard</Text>
      </View>

      <View style={styles.toggleRow}>
        {(["balance", "biggestWin"] as SortMode[]).map((m) => (
          <Pressable
            key={m}
            style={[styles.toggleBtn, mode === m && { backgroundColor: colors.primary }]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.toggleText, { color: mode === m ? colors.primaryForeground : colors.mutedForeground }]}>
              {m === "balance" ? "TOP BALANCE" : "BIGGEST WIN"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={<Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40 }}>No data</Text>}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 8 },
  screenTitle: { fontSize: 28, fontWeight: "900" },
  toggleRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 16, borderRadius: 12, overflow: "hidden", backgroundColor: "#0f0f2a" },
  toggleBtn: { flex: 1, paddingVertical: 11, alignItems: "center" },
  toggleText: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  list: { paddingHorizontal: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  rankBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 14, fontWeight: "900" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "800" },
  nameBox: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700" },
  subVal: { fontSize: 11, marginTop: 1 },
  value: { fontSize: 16, fontWeight: "900" },
});
