import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGame, Transaction } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

const DEPOSIT_OPTIONS = [100, 500, 1000, 5000];

function TxItem({ item, colors }: { item: Transaction; colors: any }) {
  const isPositive = item.amount > 0;
  const typeColors: Record<string, string> = {
    win: colors.success,
    deposit: colors.secondary,
    reward: colors.gold,
    bonus: colors.neonPurple,
    bet: colors.error,
  };
  const color = typeColors[item.type] ?? colors.mutedForeground;
  const date = new Date(item.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <View style={[styles.txItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.txDot, { backgroundColor: color + "30" }]}>
        <Text style={[styles.txDotIcon, { color }]}>
          {item.type === "win" ? "★" : item.type === "bet" ? "▼" : item.type === "reward" ? "◈" : "▲"}
        </Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txDesc, { color: colors.text }]} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={[styles.txTime, { color: colors.mutedForeground }]}>
          {dateStr} · {timeStr}
        </Text>
      </View>
      <Text style={[styles.txAmount, { color: isPositive ? colors.success : colors.error }]}>
        {isPositive ? "+" : ""}{item.amount.toLocaleString()}
      </Text>
    </View>
  );
}

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { balance, transactions, addBalance, addFreeSpins } = useGame();
  const [adLoading, setAdLoading] = useState(false);
  const [adCooldown, setAdCooldown] = useState(false);

  function handleDeposit(amount: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addBalance(amount, `Deposit +${amount}`, "deposit");
  }

  async function handleWatchAd() {
    if (adLoading || adCooldown) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAdLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setAdLoading(false);
    setAdCooldown(true);
    await addBalance(250, "Ad Reward — watched video", "bonus");
    await addFreeSpins(3);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setAdCooldown(false), 30000);
  }

  return (
    <LinearGradient colors={["#07071a", "#0d0d28", "#07071a"]} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Wallet</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Balance Card */}
            <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient
                colors={["#ff2d7820", "#07071a00"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={[styles.balLabel, { color: colors.mutedForeground }]}>TOTAL BALANCE</Text>
              <Text style={[styles.balAmount, { color: colors.gold }]}>
                {balance.toLocaleString()}
              </Text>
              <Text style={[styles.balUnit, { color: colors.mutedForeground }]}>COINS</Text>
            </View>

            {/* Deposit Section */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>QUICK DEPOSIT</Text>
            <View style={styles.depositGrid}>
              {DEPOSIT_OPTIONS.map((amount) => (
                <Pressable
                  key={amount}
                  style={[styles.depositBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleDeposit(amount)}
                >
                  <Text style={[styles.depositAmount, { color: colors.text }]}>
                    +{amount >= 1000 ? `${amount / 1000}k` : amount}
                  </Text>
                  <Text style={[styles.depositUnit, { color: colors.mutedForeground }]}>coins</Text>
                </Pressable>
              ))}
            </View>

            {/* Watch Ad */}
            <Pressable
              style={[styles.adBtn, { backgroundColor: colors.neonPurple + "18", borderColor: colors.neonPurple }]}
              onPress={handleWatchAd}
              disabled={adLoading || adCooldown}
            >
              {adLoading ? (
                <ActivityIndicator color={colors.neonPurple} />
              ) : (
                <>
                  <Text style={[styles.adBtnTitle, { color: colors.neonPurple }]}>
                    {adCooldown ? "Come back soon!" : "Watch Ad"}
                  </Text>
                  {!adCooldown && (
                    <Text style={[styles.adBtnSub, { color: colors.mutedForeground }]}>
                      +250 coins  •  +3 free spins
                    </Text>
                  )}
                </>
              )}
            </Pressable>

            {transactions.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>TRANSACTIONS</Text>
            )}
          </>
        }
        renderItem={({ item }) => <TxItem item={item} colors={colors} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyIcon, { color: colors.border }]}>◈</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No transactions yet
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 8 },
  screenTitle: { fontSize: 28, fontWeight: "900" },
  list: { paddingHorizontal: 20 },
  balanceCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  balLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 4, marginBottom: 4 },
  balAmount: { fontSize: 52, fontWeight: "900", letterSpacing: 2 },
  balUnit: { fontSize: 12, fontWeight: "700", letterSpacing: 4 },
  sectionTitle: { fontSize: 10, fontWeight: "700", letterSpacing: 3, marginBottom: 10, marginTop: 4 },
  depositGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  depositBtn: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 18,
    alignItems: "center",
  },
  depositAmount: { fontSize: 22, fontWeight: "900" },
  depositUnit: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  adBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    gap: 4,
  },
  adBtnTitle: { fontSize: 16, fontWeight: "800" },
  adBtnSub: { fontSize: 12 },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  txDot: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txDotIcon: { fontSize: 16, fontWeight: "700" },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, fontWeight: "600" },
  txTime: { fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: "800" },
  emptyBox: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14 },
});
