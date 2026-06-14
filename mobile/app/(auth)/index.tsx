import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type Tab = "login" | "register" | "guest";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, register, loginAsGuest } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (tab === "login") {
        const res = await login(email.trim(), password);
        if (res.error) setError(res.error);
        else router.replace("/(tabs)/");
      } else if (tab === "register") {
        if (!name.trim()) { setError("Please enter your name"); return; }
        if (!email.trim()) { setError("Please enter your email"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        const res = await register(name.trim(), email.trim(), password);
        if (res.error) setError(res.error);
        else router.replace("/(tabs)/");
      } else {
        await loginAsGuest();
        router.replace("/(tabs)/");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    await loginAsGuest();
    router.replace("/(tabs)/");
    setLoading(false);
  }

  const inputStyle = [styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }];

  return (
    <LinearGradient colors={["#07071a", "#0d0d28", "#07071a"]} style={styles.bg}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={[styles.logoBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}>
              <Text style={[styles.logoSymbol, { color: colors.primary }]}>7</Text>
            </View>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>HOTLINE</Text>
          <Text style={[styles.appSub, { color: colors.primary }]}>CASINO</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Spin. Win. Repeat.
          </Text>

          {/* Tab Selector */}
          <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(["login", "register", "guest"] as Tab[]).map((t) => (
              <Pressable
                key={t}
                style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}
                onPress={() => { setTab(t); setError(""); }}
              >
                <Text style={[styles.tabBtnText, { color: tab === t ? colors.primaryForeground : colors.mutedForeground }]}>
                  {t === "login" ? "LOGIN" : t === "register" ? "REGISTER" : "GUEST"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Form */}
          <View style={styles.form}>
            {tab === "guest" ? (
              <View style={styles.guestBox}>
                <Text style={[styles.guestTitle, { color: colors.text }]}>Play Instantly</Text>
                <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
                  No sign-up needed. Jump straight into the action with{" "}
                  <Text style={{ color: colors.gold }}>1,000 coins</Text>.
                </Text>
              </View>
            ) : (
              <>
                {tab === "register" && (
                  <TextInput
                    style={inputStyle}
                    placeholder="Your name"
                    placeholderTextColor={colors.mutedForeground}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                )}
                <TextInput
                  style={inputStyle}
                  placeholder="Email address"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <TextInput
                  style={inputStyle}
                  placeholder="Password"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </>
            )}

            {!!error && (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            )}

            <Pressable
              style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && styles.btnDisabled]}
              onPress={tab === "guest" ? handleGuest : handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
                  {tab === "login" ? "SIGN IN" : tab === "register" ? "CREATE ACCOUNT" : "PLAY AS GUEST"}
                </Text>
              )}
            </Pressable>

            {tab !== "guest" && (
              <Pressable style={styles.guestLink} onPress={handleGuest}>
                <Text style={[styles.guestLinkText, { color: colors.mutedForeground }]}>
                  Just browsing?{" "}
                  <Text style={{ color: colors.secondary }}>Play as Guest</Text>
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  flex: { flex: 1 },
  scroll: { alignItems: "center", paddingHorizontal: 28 },
  logoRow: { marginBottom: 8 },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  logoSymbol: { fontSize: 44, fontWeight: "900" },
  appName: { fontSize: 34, fontWeight: "900", letterSpacing: 8, marginTop: 4 },
  appSub: { fontSize: 18, fontWeight: "800", letterSpacing: 10, marginTop: -4 },
  tagline: { fontSize: 13, letterSpacing: 3, marginTop: 8, marginBottom: 32 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
    marginBottom: 24,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabBtnText: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  form: { width: "100%", gap: 12 },
  input: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  guestBox: { alignItems: "center", paddingVertical: 16, gap: 8 },
  guestTitle: { fontSize: 22, fontWeight: "800" },
  guestSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  errorText: { fontSize: 13, textAlign: "center", marginTop: 4 },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.7 },
  submitText: { fontSize: 15, fontWeight: "800", letterSpacing: 2 },
  guestLink: { alignItems: "center", paddingVertical: 8 },
  guestLinkText: { fontSize: 13 },
});
