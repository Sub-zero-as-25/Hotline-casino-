import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useGame } from "@/context/GameContext";

interface DailyRewardModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DailyRewardModal({ visible, onClose }: DailyRewardModalProps) {
  const colors = useColors();
  const { claimDailyReward } = useGame();
  const [claimed, setClaimed] = useState(false);
  const [amount, setAmount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setClaimed(false);
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
    }
  }, [visible]);

  async function handleClaim() {
    const reward = await claimDailyReward();
    setAmount(reward);
    setClaimed(true);
    Animated.sequence([
      Animated.timing(spinAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(spinAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
  }

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: "rgba(7,7,26,0.9)" }]}>
        <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.gold, transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.streak, { color: colors.mutedForeground }]}>DAILY REWARD</Text>

          <Animated.Text style={[styles.icon, { transform: [{ rotate: spin }] }]}>
            {claimed ? "★" : "◈"}
          </Animated.Text>

          {!claimed ? (
            <>
              <Text style={[styles.title, { color: colors.gold }]}>Login Bonus!</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Claim your daily reward
              </Text>
              <Pressable
                style={[styles.claimBtn, { backgroundColor: colors.gold }]}
                onPress={handleClaim}
              >
                <Text style={[styles.claimText, { color: colors.card }]}>CLAIM REWARD</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.gold }]}>+{amount.toLocaleString()}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Coins added to your wallet!
              </Text>
              <Pressable
                style={[styles.claimBtn, { backgroundColor: colors.primary }]}
                onPress={onClose}
              >
                <Text style={[styles.claimText, { color: colors.primaryForeground }]}>LET'S PLAY!</Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 300,
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 2,
    padding: 36,
    gap: 8,
  },
  streak: { fontSize: 11, fontWeight: "700", letterSpacing: 3 },
  icon: { fontSize: 60, marginVertical: 12, color: "#ffd700" },
  title: { fontSize: 36, fontWeight: "900", letterSpacing: 1 },
  subtitle: { fontSize: 14, marginBottom: 16, textAlign: "center" },
  claimBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 100,
  },
  claimText: { fontSize: 15, fontWeight: "800", letterSpacing: 2 },
});
