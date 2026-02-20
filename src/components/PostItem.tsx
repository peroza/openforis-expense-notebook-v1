import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import type Post from "@/src/types/Post";

interface PostItemProps {
  post: Post;
}

const PostItem = memo<PostItemProps>(({ post }) => {
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
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
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

  return (
    <View
      style={styles.card}
      accessibilityLabel={`Post by ${post.authorName}: ${post.content}`}
    >
      <View style={styles.header}>
        <Text style={styles.authorName}>{post.authorName}</Text>
        <Text style={styles.timestamp}>{formattedDate}</Text>
      </View>
      <Text style={styles.content}>{post.content}</Text>
    </View>
  );
});

PostItem.displayName = "PostItem";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  timestamp: {
    fontSize: 12,
    color: "#6b7280",
  },
  content: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
});

export default PostItem;
