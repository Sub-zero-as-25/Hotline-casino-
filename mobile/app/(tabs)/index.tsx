import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";
import { DailyRewardModal } from "@/components/DailyRewardModal";
import { SlotReel } from "@/components/SlotReel";
import { WinOverlay } from "@/components/WinOverlay";
import {
  SYMBOLS,
  SlotSymbol,
  calculateWin,
  getWinMessage,
  getWinType,
  spinReels,
} from "@/lib/slotLogic";

const BET_OPTIONS = [5, 10, 25, 50, 100];
const INITIAL_SYMBOLS: SlotSymbol[] = [SYMBOLS[0], SYMBOLS[3], SYMBOLS[6]];

export default function SlotScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { balance, stats, dailyRewardAvailable, subtractBalance, addBalance, recordSpin, useFreeSpins } = useGame();

  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [stopped, setStopped] = useState([true, true, true]);
  const [finalSymbols, setFinalSymbols] = useState<SlotSymbol[]>(INITIAL_SYMBOLS);
  const [winResult, setWinResult] = useState<{ amount: number; type: "jackpot" | "triple" | "pair" | "none" } | null>(null);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [resultColor, setResultColor] = useState(colors.mutedForeground);
  const spinBtnScale = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (dailyRewardAvailable) {
      const t = setTimeout(() => setShowDailyReward(true), 800);
      return () => clearTimeout(t);
    }
  }, [dailyRewardAvailable]);

  async function handleSpin() {
    if (spinning) return;

    const hasFreeSpins = stats.freeSpins > 0;
    if (!hasFreeSpins && balance < bet) {
      setResultMsg("Insufficient balance!");
      setResultColor(colors.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Animated.sequence([
      Animated.timing(spinBtnScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(spinBtnScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    if (hasFreeSpins) {
      await useFreeSpins();
    } else {
      await subtractBalance(bet, `Spin — bet ${bet}`);
    }

    const result = spinReels();
    const win = calculateWin(result, bet);
    const winType = getWinType(result, win);

    setFinalSymbols(result);
    setStopped([false, false, false]);
    setSpinning(true);
    setResultMsg("");

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setTimeout(() => setStopped([true, false, false]), 1300);
    setTimeout(() => setStopped([true, true, false]), 1800);
    setTimeout(async () => {
      setStopped([true, true, true]);
      setSpinning(false);
      await recordSpin(hasFreeSpins ? 0 : bet, win);

      if (win > 0) {
        await addBalance(win, getWinMessage(result, win), "win");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (winType === "jackpot" || winType === "triple") {
          setWinResult({ amount: win, type: winType });
          setShowWinOverlay(true);
        } else {
          setResultMsg(`+${win.toLocaleString()} coins!`);
          setResultColor(colors.success);
        }
      } else {
        setResultMsg("No win — try again!");
        setResultColor(colors.mutedForeground);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 2300);
  }

  const canSpin = !spinning && (balance >= bet || stats.freeSpins > 0);
  const usingFree = !spinning && stats.freeSpins > 0;

  return (
    <LinearGradient colors={["#07071a", "#0d0d28", "#07071a"]} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View>
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>BALANCE</Text>
          <Text style={[styles.balanceValue, { color: colors.gold }]}>
            {balance.toLocaleString()}
            <Text style={[styles.coinUnit, { color: colors.mutedForeground }]}> coins</Text>
          </Text>
        </View>
        {stats.freeSpins > 0 && (
          <View style={[styles.freeSpinsBadge, { backgroundColor: colors.success + "20", borderColor: colors.success }]}>
            <Text style={[styles.freeSpinsText, { color: colors.success }]}>
              {stats.freeSpins} FREE
            </Text>
          </View>
        )}
      </View>

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        {/* Reel Frame */}
        <View style={[styles.reelFrame, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Payline indicator */}
          <View style={[styles.paylineIndicator, { backgroundColor: colors.primary + "25", borderColor: colors.primary + "40" }]}>
            <View style={[styles.paylineDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.paylineText, { color: colors.primary }]}>PAYLINE</Text>
            <View style={[styles.paylineDot, { backgroundColor: colors.primary }]} />
          </View>

          {/* Reels */}
          <View style={styles.reels}>
            {[0, 1, 2].map((i) => (
              <SlotReel
                key={i}
                finalSymbol={finalSymbols[i]}
                isStopped={stopped[i]}
                isWinner={!spinning && winResult !== null && stopped[i]}
              />
            ))}
          </View>
        </View>

        {/* Result Message */}
        <View style={styles.resultRow}>
          {!!resultMsg && (
            <Text style={[styles.resultMsg, { color: resultColor }]}>{resultMsg}</Text>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
        {/* Bet Selector */}
        <View style={styles.betRow}>
          <Text style={[styles.betLabel, { color: colors.mutedForeground }]}>BET</Text>
          <View style={styles.betOptions}>
            {BET_OPTIONS.map((b) => (
              <Pressable
                key={b}
                style={[
                  styles.betOption,
                  { borderColor: bet === b ? colors.primary : colors.border },
                  bet === b && { backgroundColor: colors.primary + "20" },
                ]}
                onPress={() => {
                  setBet(b);
                  Haptics.selectionAsync();
                }}
                disabled={spinning}
              >
                <Text style={[styles.betOptionText, { color: bet === b ? colors.primary : colors.mutedForeground }]}>
                  {b}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Spin Button */}
        <Animated.View style={{ transform: [{ scale: spinBtnScale }] }}>
          <Pressable
            style={[
              styles.spinBtn,
              { backgroundColor: usingFree ? colors.success : colors.primary },
              !canSpin && styles.spinBtnDisabled,
            ]}
            onPress={handleSpin}
            disabled={!canSpin}
          >
            <LinearGradient
              colors={usingFree
                ? [colors.success + "cc", colors.success]
                : [colors.primaryDark, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.spinBtnGrad}
            >
              <Text style={styles.spinBtnText}>
                {spinning ? "SPINNING..." : usingFree ? "FREE SPIN!" : "SPIN"}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Daily Reward Button */}
        {dailyRewardAvailable && !showDailyReward && (
          <Pressable
            style={[styles.dailyBtn, { backgroundColor: colors.gold + "18", borderColor: colors.gold }]}
            onPress={() => setShowDailyReward(true)}
          >
            <Text style={[styles.dailyBtnText, { color: colors.gold }]}>
              ★  Daily Reward Available!
            </Text>
          </Pressable>
        )}
      </View>

      <DailyRewardModal visible={showDailyReward} onClose={() => setShowDailyReward(false)} />
      {winResult && (
        <WinOverlay
          visible={showWinOverlay}
          amount={winResult.amount}
          type={winResult.type}
          onDismiss={() => { setShowWinOverlay(false); setWinResult(null); }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  balanceLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 3 },
  balanceValue: { fontSize: 28, fontWeight: "900" },
  coinUnit: { fontSize: 14, fontWeight: "500" },
  freeSpinsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  freeSpinsText: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  gameArea: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  reelFrame: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    alignItems: "center",
    gap: 16,
  },
  paylineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  paylineDot: { width: 6, height: 6, borderRadius: 3 },
  paylineText: { fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  reels: { flexDirection: "row", gap: 10 },
  resultRow: { height: 36, alignItems: "center", justifyContent: "center", marginTop: 12 },
  resultMsg: { fontSize: 20, fontWeight: "800", letterSpacing: 1 },
  controls: { paddingHorizontal: 24, gap: 12 },
  betRow: { gap: 8 },
  betLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 3 },
  betOptions: { flexDirection: "row", gap: 8 },
  betOption: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  betOptionText: { fontSize: 14, fontWeight: "700" },
  spinBtn: { width: "100%", borderRadius: 16, overflow: "hidden", height: 60 },
  spinBtnGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
  spinBtnDisabled: { opacity: 0.5 },
  spinBtnText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 4,
  },
  dailyBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 10,
    alignItems: "center",
  },
  dailyBtnText: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },
});
