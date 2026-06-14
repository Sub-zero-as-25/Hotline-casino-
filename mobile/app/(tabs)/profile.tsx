import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string;
  color: string;
  colors: any;
}

function StatCard({ label, value, color, colors }: StatCardProps) {
  return (
    <View style={[statStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { flex: 1, minWidth: "45%", borderRadius: 14, borderWidth: 1.5, padding: 16, alignItems: "center", gap: 4 },
  value: { fontSize: 22, fontWeight: "900" },
  label: { fontSize: 10, fontWeight: "600", letterSpacing: 2, textAlign: "center" },
});

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { balance, stats, dailyRewardAvailable } = useGame();
  const router = useRouter();

  async function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/(auth)/");
  }

  const winRate = stats.totalSpins > 0
    ? Math.round((stats.totalWins / stats.totalSpins) * 100)
    : 0;

  return (
    <LinearGradient colors={["#07071a", "#0d0d28", "#07071a"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 40),
        }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.primary + "40", colors.primary + "10"]}
            style={[styles.avatarRing, { borderColor: colors.primary }]}
          >
            <Text style={[styles.avatarLetter, { color: colors.primary }]}>
              {user?.avatar ?? "?"}
            </Text>
          </LinearGradient>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          {user?.isGuest && (
            <View style={[styles.guestBadge, { backgroundColor: colors.mutedForeground + "20", borderColor: colors.mutedForeground }]}>
              <Text style={[styles.guestBadgeText, { color: colors.mutedForeground }]}>GUEST</Text>
            </View>
          )}
          {!user?.isGuest && (
            <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
          )}
          <View style={[styles.balancePill, { backgroundColor: colors.gold + "18", borderColor: colors.gold }]}>
            <Text style={[styles.balancePillText, { color: colors.gold }]}>
              {balance.toLocaleString()} coins
            </Text>
          </View>
        </View>

        {/* Daily Reward Status */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: dailyRewardAvailable ? colors.gold : colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DAILY REWARD</Text>
          <Text style={[styles.sectionValue, { color: dailyRewardAvailable ? colors.gold : colors.success }]}>
            {dailyRewardAvailable ? "Available — claim now!" : "Claimed for today"}
          </Text>
          {dailyRewardAvailable && (
            <Pressable
              style={[styles.claimBtn, { backgroundColor: colors.gold }]}
              onPress={() => router.push("/(tabs)/")}
            >
              <Text style={[styles.claimBtnText, { color: colors.card }]}>GO TO SLOTS</Text>
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <Text style={[styles.gridTitle, { color: colors.mutedForeground }]}>YOUR STATS</Text>
        <View style={styles.statsGrid}>
          <StatCard label="TOTAL SPINS" value={stats.totalSpins.toLocaleString()} color={colors.secondary} colors={colors} />
          <StatCard label="TOTAL WINS" value={stats.totalWins.toLocaleString()} color={colors.success} colors={colors} />
          <StatCard label="BIGGEST WIN" value={stats.biggestWin.toLocaleString()} color={colors.gold} colors={colors} />
          <StatCard label="WIN RATE" value={`${winRate}%`} color={colors.primary} colors={colors} />
          <StatCard label="WAGERED" value={stats.totalWagered.toLocaleString()} color={colors.mutedForeground} colors={colors} />
          <StatCard label="FREE SPINS" value={stats.freeSpins.toString()} color={colors.neonPurple} colors={colors} />
        </View>

        {/* Actions */}
        {user?.isGuest && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}
            onPress={() => router.replace("/(auth)/")}
          >
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Create Account to Save Progress</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.error + "15", borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Sign Out</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>Hotline Casino v1.0</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 16 },
  avatarSection: { alignItems: "center", gap: 8, marginBottom: 8 },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarLetter: { fontSize: 44, fontWeight: "900" },
  userName: { fontSize: 24, fontWeight: "900" },
  guestBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  guestBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  userEmail: { fontSize: 13 },
  balancePill: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 20, paddingVertical: 7, marginTop: 4 },
  balancePillText: { fontSize: 16, fontWeight: "800" },
  section: { borderRadius: 16, borderWidth: 1.5, padding: 18, gap: 6 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 3 },
  sectionValue: { fontSize: 16, fontWeight: "700" },
  claimBtn: { marginTop: 8, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  claimBtnText: { fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  gridTitle: { fontSize: 10, fontWeight: "700", letterSpacing: 3 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn: { borderRadius: 14, borderWidth: 1.5, paddingVertical: 15, alignItems: "center" },
  actionBtnText: { fontSize: 15, fontWeight: "700" },
  version: { fontSize: 12, textAlign: "center" },
});
