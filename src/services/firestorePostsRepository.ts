import {
    collection,
    doc,
    getDocs,
    setDoc,
    query,
    orderBy,
    type QueryDocumentSnapshot,
  } from "firebase/firestore";
  import type Post from "@/src/types/Post";
  import type { PostsRepository } from "@/src/services/postsRepository";
  import { db } from "@/src/config/firebase";
  import {
    FirestoreError,
    FirestoreNotInitializedError,
    ValidationError,
  } from "@/src/services/errors";
  
  const COLLECTION = "posts";
  
  // Log message constants
  const LOG_MESSAGES = {
    FETCHING: "📖 Fetching posts from Firestore...",
    LOADED: (count: number) => `✅ Loaded ${count} posts from Firestore`,
    ERROR_FETCHING: "❌ Error fetching posts from Firestore",
    INDEX_MISSING: "⚠️ Index missing, fetching without orderBy...",
    CREATING: (content: string) =>
      `➕ Creating post in Firestore: ${content.substring(0, 30)}...`,
    CREATED: "✅ Post created successfully",
    ERROR_CREATING: "❌ Error creating post",
  } as const;
  
  function getCollection() {
    if (!db) {
      throw new FirestoreNotInitializedError();
    }
    return collection(db, COLLECTION);
  }
  
  // Helper function to remove undefined values from an object
  function removeUndefined<T extends Record<string, unknown>>(
    obj: T,
  ): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== undefined),
    ) as Partial<T>;
  }
  
  // Helper function to convert Firestore Timestamp to ISO string
  function convertTimestampToString(timestamp: unknown): string {
    if (!timestamp) {
      return new Date().toISOString();
    }
  
    // If it's already a string, return it
    if (typeof timestamp === "string") {
      return timestamp;
    }
  
    // If it's a Firestore Timestamp, convert it
    if (
      typeof timestamp === "object" &&
      timestamp !== null &&
      "seconds" in timestamp &&
      typeof (timestamp as { seconds: unknown }).seconds === "number"
    ) {
      const seconds = (timestamp as { seconds: number }).seconds;
      return new Date(seconds * 1000).toISOString();
    }
  
    // If it's a Date object
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
  
    // Fallback: try to parse as Date
    try {
      const dateObj = new Date(timestamp as string | number);
      return dateObj.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  
  // Input validation functions
  function validatePostId(id: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new ValidationError(
        "Post ID is required and must be a non-empty string",
        "id",
      );
    }
  }
  
  function validatePost(post: Post): void {
    validatePostId(post.id);
  
    if (
      !post.authorId ||
      typeof post.authorId !== "string" ||
      post.authorId.trim() === ""
    ) {
      throw new ValidationError("Post authorId is required", "authorId");
    }
  
    if (
      !post.authorName ||
      typeof post.authorName !== "string" ||
      post.authorName.trim() === ""
    ) {
      throw new ValidationError("Post authorName is required", "authorName");
    }
  
    if (
      !post.content ||
      typeof post.content !== "string" ||
      post.content.trim() === ""
    ) {
      throw new ValidationError("Post content is required", "content");
    }
  
    if (!post.createdAt || typeof post.createdAt !== "string") {
      throw new ValidationError("Post createdAt is required", "createdAt");
    }
  }
  
  // Helper function to map Firestore document to Post
  function mapDocToPost(doc: QueryDocumentSnapshot): Post {
    const data = doc.data();
    return {
      id: doc.id,
      authorId: data.authorId as string,
      authorName: data.authorName as string,
      content: data.content as string,
      createdAt: convertTimestampToString(data.createdAt),
      updatedAt: data.updatedAt
        ? convertTimestampToString(data.updatedAt)
        : undefined,
    } as Post;
  }
  
  export class FirestorePostsRepository implements PostsRepository {
    async list(): Promise<Post[]> {
      // #region agent log
      fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:143',message:'list() entry - checking db initialization',data:{dbInitialized:!!db,dbType:db?typeof db:'null'},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (!db) {
        throw new FirestoreNotInitializedError();
      }

      try {
        console.log(LOG_MESSAGES.FETCHING);
        // #region agent log
        fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:150',message:'Before Firestore query with orderBy',data:{collection:COLLECTION,orderByField:'createdAt',orderByDirection:'desc'},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const snap = await getDocs(
          query(getCollection(), orderBy("createdAt", "desc")),
        );
        const posts = snap.docs.map(mapDocToPost);
        console.log(LOG_MESSAGES.LOADED(posts.length));
        // #region agent log
        fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:155',message:'Query succeeded',data:{postCount:posts.length},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return posts;
      } catch (error: unknown) {
        const errorObj = error as { code?: string; message?: string; stack?: string; name?: string };
        // #region agent log
        fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:157',message:'Caught error in list() - full error details',data:{errorCode:errorObj.code,errorMessage:errorObj.message,errorName:errorObj.name,isErrorInstance:error instanceof Error,errorString:String(error)},timestamp:Date.now(),runId:'run1',hypothesisId:'A,B,C,E'})}).catch(()=>{});
        // #endregion
        console.error(LOG_MESSAGES.ERROR_FETCHING, error);

        // If orderBy fails due to missing index, try without it
        if (
          error instanceof Error &&
          errorObj.code === "failed-precondition"
        ) {
          // #region agent log
          fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:164',message:'Taking failed-precondition path - trying fallback query',data:{errorCode:errorObj.code},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          console.log(LOG_MESSAGES.INDEX_MISSING);
          try {
            const snap = await getDocs(getCollection());
            const posts = snap.docs.map(mapDocToPost);
            // Sort manually by createdAt desc
            posts.sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return dateB - dateA;
            });
            console.log(LOG_MESSAGES.LOADED(posts.length));
            // #region agent log
            fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:175',message:'Fallback query succeeded',data:{postCount:posts.length},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            return posts;
          } catch (fallbackError: unknown) {
            const fallbackErrorObj = fallbackError as { code?: string; message?: string };
            // #region agent log
            fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:177',message:'Fallback query also failed',data:{fallbackErrorCode:fallbackErrorObj.code,fallbackErrorMessage:fallbackErrorObj.message},timestamp:Date.now(),runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
            // #endregion
            throw new FirestoreError(
              "Failed to fetch posts from Firestore",
              fallbackErrorObj.code,
              fallbackError,
            );
          }
        }

        // Handle permission-denied errors (security rules blocking access)
        if (errorObj.code === "permission-denied") {
          // #region agent log
          fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:208',message:'Handling permission-denied error',data:{errorCode:errorObj.code,errorMessage:errorObj.message},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          throw new FirestoreError(
            "Permission denied. Please check your Firestore security rules for the 'posts' collection. Ensure authenticated users can read posts.",
            errorObj.code,
            error,
          );
        }

        // #region agent log
        fetch('http://127.0.0.1:7268/ingest/c6b46800-239b-49b2-9a12-99b776a19fb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d33332'},body:JSON.stringify({sessionId:'d33332',location:'firestorePostsRepository.ts:216',message:'Throwing generic FirestoreError - error not handled',data:{errorCode:errorObj.code,errorMessage:errorObj.message},timestamp:Date.now(),runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
        // #endregion
        throw new FirestoreError(
          `Failed to fetch posts: ${errorObj.message || "Unknown error"}. Code: ${errorObj.code || "unknown"}`,
          errorObj.code,
          error,
        );
      }
    }
  
    async create(post: Post): Promise<void> {
      if (!db) {
        throw new FirestoreNotInitializedError();
      }
  
      validatePost(post);
  
      try {
        console.log(LOG_MESSAGES.CREATING(post.content));
        const ref = doc(getCollection(), post.id);
        const { id: _, ...data } = post;
        const cleanData = removeUndefined(data);
        await setDoc(ref, cleanData);
        console.log(LOG_MESSAGES.CREATED);
      } catch (error: unknown) {
        console.error(LOG_MESSAGES.ERROR_CREATING, error);
        throw new FirestoreError(
          "Failed to create post. Please check your connection and try again.",
          (error as { code?: string }).code,
          error,
        );
      }
    }
  }