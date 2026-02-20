import React, { memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  SectionList,
  type SectionListData,
  type ListRenderItemInfo,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsItem = {
  id: string;
  label: string;
  subtitle?: string;
  disabled?: boolean;
};

type SettingsSection = {
  id: string;
  title: string;
  data: SettingsItem[];
};

const PLACEHOLDER_SECTIONS: SettingsSection[] = [
  {
    id: "account",
    title: "Account",
    data: [
      {
        id: "profile",
        label: "Profile",
        subtitle: "Coming soon",
        disabled: true,
      },
      {
        id: "security",
        label: "Security",
        subtitle: "Coming soon",
        disabled: true,
      },
    ],
  },
  {
    id: "preferences",
    title: "Preferences",
    data: [
      { id: "theme", label: "Theme", subtitle: "Coming soon", disabled: true },
      {
        id: "language",
        label: "Language",
        subtitle: "Coming soon",
        disabled: true,
      },
      {
        id: "notifications",
        label: "Notifications",
        subtitle: "Coming soon",
        disabled: true,
      },
    ],
  },
  {
    id: "about",
    title: "About",
    data: [
      { id: "version", label: "Version", subtitle: "1.0.0" },
      {
        id: "help",
        label: "Help & Support",
        subtitle: "Coming soon",
        disabled: true,
      },
    ],
  },
];

const SettingsScreen = memo(() => {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const displayName = useMemo(
    () => user?.displayName?.trim() || user?.email?.split("@")[0] || "User",
    [user?.displayName, user?.email],
  );
  const email = useMemo(() => user?.email ?? "—", [user?.email]);
  const userId = useMemo(() => user?.uid ?? "", [user?.uid]);

  const renderHeader = useCallback(
    () => (
      <View
        style={styles.userCard}
        accessibilityLabel={`Account: ${displayName}, ${email}`}
        accessibilityRole="summary"
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {displayName.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {email}
          </Text>
          {userId ? (
            <Text style={styles.userId} numberOfLines={1}>
              ID: {userId}
            </Text>
          ) : null}
        </View>
      </View>
    ),
    [displayName, email, userId],
  );

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  }, [signOut, router]);

  const renderFooter = useCallback(
    () => (
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
          onPress={handleSignOut}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </View>
    ),
    [handleSignOut],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SettingsItem>) => (
      <View style={styles.item}>
        <Text
          style={[styles.itemLabel, item.disabled && styles.itemLabelDisabled]}
        >
          {item.label}
        </Text>
        {item.subtitle != null && (
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        )}
      </View>
    ),
    [],
  );

  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<SettingsItem, SettingsSection>;
    }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: SettingsItem) => item.id, []);

  const sectionListStyle = useMemo(() => styles.sectionList, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>
      <SectionList
        sections={PLACEHOLDER_SECTIONS}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        contentContainerStyle={sectionListStyle}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Settings sections"
      />
    </View>
  );
});

SettingsScreen.displayName = "SettingsScreen";

const styles = StyleSheet.create({
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: "#9ca3af",
    fontFamily: "monospace",
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  signOutButtonPressed: {
    backgroundColor: "#fef2f2",
    opacity: 0.9,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  sectionList: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeader: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  item: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  itemLabelDisabled: {
    color: "#9ca3af",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
});

export default SettingsScreen;
