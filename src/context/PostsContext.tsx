import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import type Post from "@/src/types/Post";
import type { PostsRepository } from "@/src/services/postsRepository";
import { useAuth } from "@/src/context/AuthContext";

type PostsContextValue = {
  posts: Post[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createPost: (content: string) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

export function PostsProvider({
  children,
  repository,
}: {
  children: React.ReactNode;
  repository: PostsRepository;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSyncingRef = useRef(false);
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    if (isSyncingRef.current) {
      console.log("⏸️ Posts refresh skipped - already syncing");
      return;
    }
    isSyncingRef.current = true;
    try {
      console.log("🔄 Starting posts refresh...");
      const list = await repository.list();
      setPosts(list);
      console.log("✅ Posts refresh completed");
    } catch (error) {
      console.error("❌ Error refreshing posts:", error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [repository]);

  // Load posts on mount
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const list = await repository.list();
        setPosts(list);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPosts();
  }, [repository]);

  const createPost = useCallback(
    async (content: string) => {
      if (!user) {
        throw new Error("User must be authenticated to create posts");
      }

      const newPost: Post = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        authorId: user.uid,
        authorName: user.displayName || user.email || "Unknown",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      await repository.create(newPost);
      await refresh();
    },
    [repository, refresh, user],
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      posts,
      isLoading,
      refresh,
      createPost,
    }),
    [posts, isLoading, refresh, createPost],
  );

  return (
    <PostsContext.Provider value={contextValue}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts(): PostsContextValue {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}
