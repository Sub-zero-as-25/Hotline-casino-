import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, View, Pressable } from "react-native";
import { useColors } from "@/hooks/useColors";

interface WinOverlayProps {
  visible: boolean;
  amount: number;
  type: "jackpot" | "triple" | "pair" | "none";
  onDismiss: () => void;
}

export function WinOverlay({ visible, amount, type, onDismiss }: WinOverlayProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
    }
    return () => { pulseLoop.current?.stop(); };
  }, [visible]);

  if (!visible) return null;

  const isJackpot = type === "jackpot";
  const titleColor = isJackpot ? colors.gold : type === "triple" ? colors.secondary : colors.success;
  const title = isJackpot ? "JACKPOT!" : type === "triple" ? "BIG WIN!" : "WIN!";

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onDismiss}>
        <Animated.View style={[styles.card, {
          backgroundColor: colors.card,
          borderColor: titleColor,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }]}>
          <Animated.Text style={[styles.title, { color: titleColor, transform: [{ scale: pulseAnim }] }]}>
            {title}
          </Animated.Text>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>YOU WON</Text>
          <Animated.Text style={[styles.amount, { color: colors.gold, transform: [{ scale: pulseAnim }] }]}>
            +{amount.toLocaleString()}
          </Animated.Text>
          <Text style={[styles.coins, { color: colors.mutedForeground }]}>COINS</Text>
          <Pressable onPress={onDismiss} style={[styles.btn, { backgroundColor: titleColor }]}>
            <Text style={[styles.btnText, { color: isJackpot ? colors.card : colors.primaryForeground }]}>
              COLLECT
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
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
    width: 280,
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 2,
    paddingVertical: 40,
    paddingHorizontal: 32,
    gap: 4,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },
  amount: {
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 2,
  },
  coins: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 28,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 100,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
});
