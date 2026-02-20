import React, { memo, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type Post from "@/src/types/Post";

interface PostItemProps {
  post: Post;
  onPress?: () => void;
}

const PostItem = memo<PostItemProps>(({ post, onPress }) => {
  // Format timestamp to readable date/time
  const formattedDate = useMemo(() => {
    try {
      const date = new Date(post.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        return "Just now";
      } else if (diffMins < 60) {
        return `${diffMins}m`;
      } else if (diffHours < 24) {
        return `${diffHours}h`;
      } else if (diffDays < 7) {
        return `${diffDays}d`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year:
            date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
      }
    } catch {
      return "Unknown date";
    }
  }, [post.createdAt]);

  // Get initials for avatar
  const authorInitials = useMemo(() => {
    const names = post.authorName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return post.authorName.substring(0, 2).toUpperCase();
  }, [post.authorName]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  const accessibilityLabel = useMemo(
    () => `Post by ${post.authorName}, ${formattedDate}: ${post.content}`,
    [post.authorName, formattedDate, post.content],
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Tap to view post details"
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{authorInitials}</Text>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          {/* Header: Author name and timestamp */}
          <View style={styles.header}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.authorName}
            </Text>
            <Text style={styles.separator}>·</Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>

          {/* Post text */}
          <Text style={styles.text} selectable>
            {post.content}
          </Text>

          {/* Action buttons (Twitter-like) */}
          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              accessibilityLabel="Reply to post"
              accessibilityRole="button"
              accessibilityHint="Opens reply dialog"
            >
              <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
              <Text style={styles.actionText}>0</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              accessibilityLabel="Repost"
              accessibilityRole="button"
              accessibilityHint="Reposts this post"
            >
              <Ionicons name="repeat-outline" size={18} color="#6b7280" />
              <Text style={styles.actionText}>0</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              accessibilityLabel="Like post"
              accessibilityRole="button"
              accessibilityHint="Likes this post"
            >
              <Ionicons name="heart-outline" size={18} color="#6b7280" />
              <Text style={styles.actionText}>0</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              accessibilityLabel="Share post"
              accessibilityRole="button"
              accessibilityHint="Shares this post"
            >
              <Ionicons name="share-outline" size={18} color="#6b7280" />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

PostItem.displayName = "PostItem";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  containerPressed: {
    backgroundColor: "#f9fafb",
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  postContent: {
    flex: 1,
    paddingTop: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginRight: 4,
  },
  separator: {
    fontSize: 15,
    color: "#6b7280",
    marginHorizontal: 4,
  },
  timestamp: {
    fontSize: 15,
    color: "#6b7280",
  },
  text: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 40,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: 60,
  },
  actionText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "400",
  },
});

export default PostItem;
