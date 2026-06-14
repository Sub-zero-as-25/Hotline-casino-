import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SYMBOLS, SlotSymbol, weightedRandom } from "@/lib/slotLogic";
import { useColors } from "@/hooks/useColors";

interface SlotReelProps {
  finalSymbol: SlotSymbol;
  isStopped: boolean;
  isWinner?: boolean;
}

export function SlotReel({ finalSymbol, isStopped, isWinner }: SlotReelProps) {
  const colors = useColors();
  const [top, setTop] = useState<SlotSymbol>(() => weightedRandom());
  const [center, setCenter] = useState<SlotSymbol>(finalSymbol);
  const [bottom, setBottom] = useState<SlotSymbol>(() => weightedRandom());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!isStopped) {
      intervalRef.current = setInterval(() => {
        setTop(weightedRandom());
        setCenter(weightedRandom());
        setBottom(weightedRandom());
      }, 75);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTop(weightedRandom());
      setCenter(finalSymbol);
      setBottom(weightedRandom());
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.18, duration: 90, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3.5, tension: 200, useNativeDriver: true }),
      ]).start();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStopped]);

  useEffect(() => {
    if (isWinner) {
      glowLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
      glowLoopRef.current.start();
    } else {
      glowLoopRef.current?.stop();
      glowAnim.setValue(0);
    }
    return () => { glowLoopRef.current?.stop(); };
  }, [isWinner]);

  const borderColor = isWinner ? colors.gold : colors.border;

  return (
    <View style={[styles.reel, { borderColor, backgroundColor: colors.card }]}>
      <View style={[styles.cell, styles.dimCell]}>
        <Text style={[styles.sym, {
          color: top.color,
          fontSize: top.id === "bar" ? 13 : 20,
        }]}>
          {top.label}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.primary + "30" }]} />

      <Animated.View style={[styles.cell, styles.centerCell, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.Text style={[
          styles.sym,
          styles.centerSym,
          { color: center.color, fontSize: center.id === "bar" ? 17 : 32, opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
        ]}>
          {center.label}
        </Animated.Text>
        {isWinner && (
          <Animated.View style={[styles.winGlow, { opacity: glowAnim, backgroundColor: center.color + "20" }]} />
        )}
      </Animated.View>

      <View style={[styles.divider, { backgroundColor: colors.primary + "30" }]} />

      <View style={[styles.cell, styles.dimCell]}>
        <Text style={[styles.sym, {
          color: bottom.color,
          fontSize: bottom.id === "bar" ? 13 : 20,
        }]}>
          {bottom.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reel: {
    width: 88,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    alignItems: "center",
  },
  cell: {
    width: "100%",
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  dimCell: { opacity: 0.3 },
  centerCell: { position: "relative" },
  divider: { width: "100%", height: 1 },
  sym: {
    fontWeight: "900",
    textShadowColor: "rgba(255,255,255,0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  centerSym: {
    textShadowRadius: 14,
  },
  winGlow: {
    ...StyleSheet.absoluteFillObject,
  },
});
