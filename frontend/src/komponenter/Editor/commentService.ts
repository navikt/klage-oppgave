import { CommentData, CommentFilter, CommentThreadData, NewCommentData } from "./types";

const TEST_COMMENTS: CommentThreadData[] = [
  {
    saksId: "saksId-123",
    fieldId: "vedtak",
    comments: [],
    id: "0",
  },
  {
    saksId: "saksId-123",
    fieldId: "problem",
    comments: [],
    id: "20",
  },
];

export interface NewThread {
  fieldId: string;
  saksId: string;
  comments?: NewCommentData[];
}

export type Listener = (threads: CommentThreadData[]) => void;

class CommentService {
  private commentThreads: CommentThreadData[] = TEST_COMMENTS;

  private listeners: Listener[] = [];

  public async addComment(comment: NewCommentData) {
    // TODO: POST comment.
    // Mock implementation.
    const thread = this.commentThreads.find(
      ({ id: commentThreadId }) => commentThreadId === comment.commentThreadId
    );
    if (typeof thread === "undefined") {
      return false;
    }
    thread.comments.push(toFullComment(comment));
    this.listeners.forEach((fn) => fn(this.commentThreads));
    return true;
  }

  public async addThread({
    saksId,
    fieldId,
    comments = [],
  }: NewThread): Promise<CommentThreadData> {
    // TODO: POST comment thread.
    // Mock implementation.
    const newThread = {
      id: Math.random().toString(),
      fieldId,
      saksId,
      comments: comments.map(toFullComment),
    };
    this.commentThreads.push(newThread);
    return newThread;
  }

  public async getCommentThreads(
    saksId: string,
    fieldId: string | null,
    commentThreadId: string | null
  ): Promise<CommentThreadData[]> {
    // TODO: GET comment threads.
    // Mock implementation.
    return new Promise((res) =>
      setTimeout(
        () =>
          res(
            this.commentThreads.filter(
              (thread) =>
                (fieldId === null || fieldId === thread.fieldId) &&
                (commentThreadId === null || commentThreadId === thread.id) &&
                saksId === thread.saksId
            )
          ),
        200
      )
    );
  }
}

// Mock helper function.
const toFullComment = ({ text }: NewCommentData): CommentData => ({
  id: Math.random().toString(),
  author: {
    id: "id",
    name: "Name",
  },
  createdDate: Date.now().toString(),
  text,
});

export const commentService = new CommentService();
