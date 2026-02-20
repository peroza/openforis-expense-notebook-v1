import type Post from "@/src/types/Post";

/**
 * Repository interface for posts operations
 * Will be implemented by firestorePostsRepository in step 3.3
 */
export interface PostsRepository {
  list(): Promise<Post[]>;
  create(post: Post): Promise<void>;
}