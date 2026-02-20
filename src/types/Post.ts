/**
 * Post interface for Community feed
 * Represents a Twitter-like post that admins can create
 */
export default interface Post {
    id: string;
    authorId: string; // Firebase Auth user ID of the admin who created the post
    authorName: string; // Display name of the author
    content: string; // Post content/text
    createdAt: string; // ISO timestamp when post was created
    updatedAt?: string; // ISO timestamp when post was last updated (optional)
  }