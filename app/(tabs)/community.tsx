import React, { memo, useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePosts } from "@/src/context/PostsContext";
import { useAuth } from "@/src/context/AuthContext";
import PostItem from "@/src/components/PostItem";
import type Post from "@/src/types/Post";

const CommunityScreen = memo(() => {
  const { posts, isLoading, refresh, createPost } = usePosts();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    return user?.email?.endsWith("@admin.com") ?? false;
  }, [user?.email]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleOpenCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    if (!isCreating) {
      setShowCreateModal(false);
      setPostContent("");
    }
  }, [isCreating]);

  const handleCreatePost = useCallback(async () => {
    const trimmedContent = postContent.trim();
    if (!trimmedContent) {
      Alert.alert("Error", "Post content cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      await createPost(trimmedContent);
      setPostContent("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create post. Please try again.",
      );
    } finally {
      setIsCreating(false);
    }
  }, [postContent, createPost]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostItem post={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const listContentStyle = useMemo(
    () => [styles.listContent, posts.length === 0 && styles.listContentEmpty],
    [posts.length],
  );

  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for community updates
        </Text>
      </View>
    ),
    [],
  );

  const createButtonStyle = useMemo(
    () => [styles.createButton, isCreating && styles.createButtonDisabled],
    [isCreating],
  );

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Feed</Text>
        <Text style={styles.subtitle}>Stay updated with the latest news</Text>
      </View>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={listContentStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
            colors={["#2563eb"]}
          />
        }
        ListEmptyComponent={emptyComponent}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Post Button - Admin Only */}
      {isAdmin && (
        <Pressable
          style={createButtonStyle}
          onPress={handleOpenCreateModal}
          disabled={isCreating}
          accessibilityLabel="Create new post"
          accessibilityRole="button"
          accessibilityState={{ disabled: isCreating }}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      )}

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseCreateModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={handleCloseCreateModal}
            accessibilityLabel="Close create post modal"
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <Pressable
                  onPress={handleCloseCreateModal}
                  style={styles.modalCloseButton}
                  disabled={isCreating}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isCreating }}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Post Content</Text>
                <TextInput
                  style={styles.postInput}
                  value={postContent}
                  onChangeText={setPostContent}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  editable={!isCreating}
                  accessibilityLabel="Post content input"
                  accessibilityHint="Enter the content for your community post"
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={handleCloseCreateModal}
                  disabled={isCreating}
                  accessibilityLabel="Cancel"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isCreating }}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modalButton,
                    styles.modalButtonSubmit,
                    isCreating && styles.modalButtonDisabled,
                    !postContent.trim() && styles.modalButtonDisabled,
                  ]}
                  onPress={handleCreatePost}
                  disabled={isCreating || !postContent.trim()}
                  accessibilityLabel="Create post"
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: isCreating || !postContent.trim(),
                  }}
                >
                  {isCreating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.modalButtonSubmitText}>Post</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
});

CommunityScreen.displayName = "CommunityScreen";

const styles = StyleSheet.create({
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
  listContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  createButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  postInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    minHeight: 120,
    maxHeight: 200,
    backgroundColor: "#ffffff",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#f3f4f6",
  },
  modalButtonSubmit: {
    backgroundColor: "#2563eb",
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  modalButtonSubmitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default CommunityScreen;
