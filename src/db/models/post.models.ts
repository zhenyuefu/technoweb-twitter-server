import { Model, model, ObjectId, Schema, Types } from "mongoose";
import { commentSchema } from "./comment.models";
import { IImage } from "../../types";
import User from "./user.models";
import { ClientSession } from "mongodb";
import assert from "assert";

interface IPost {
  author?: ObjectId;
  content?: string;
  imagePath?: Types.Array<IImage>;
  createAt?: Date;
  comments?: Types.ArraySubdocument;
  likes?: Types.DocumentArray<ObjectId>;
  countLikes?: number;
  reTweet?: Types.DocumentArray<ObjectId>;
  countReTweet?: number;
  isDelete?: boolean;
}

interface IPostModel extends Model<IPost> {
  addPost(userid: string, post: IPost): Promise<IPost>;

  getPosts(userids: ObjectId[], author?: string): Promise<IPost[]>;

  deletePost(postId: string): Promise<IPost>;

  addComment(postId: string, userid: string, comment: string): Promise<IPost>;

  likePost(postId: string, userid: string): Promise<void>;

  unlikePost(postId: string, userid: string): Promise<void>;
}

const postSchema = new Schema<IPost, IPostModel>({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    max: 500,
    index: "text",
  },
  imagePath: {
    type: Array,
    default: [],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  comments: [commentSchema],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  countLikes: {
    type: Number,
    default: 0,
  },
  reTweet: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  countReTweet: {
    type: Number,
    default: 0,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
});

postSchema.index({ content: "text" });

postSchema.statics.addPost = async function (userid, post) {
  return Post.create({
    ...post,
    author: userid,
  });
};

postSchema.statics.deletePost = async function (postID: string) {
  return Post.findByIdAndUpdate(postID, { isDelete: true }, { new: true });
};

postSchema.statics.getPosts = async function (userIds, author) {
  if (author) {
    return this.find({ author: author, isDelete: false })
      .populate("author", "username firstName lastName avatar")
      .populate("comments.author", "username firstName lastName avatar")
      .sort({ createAt: -1 });
  }
  return this.find({ author: { $in: userIds }, isDelete: false })
    .populate("author", "username firstName lastName avatar")
    .populate("comments.author", "username firstName lastName avatar")
    .sort({ createAt: -1 });
};

postSchema.statics.likePost = async function (postID: string, userid: string) {
  let session: ClientSession | null = null;
  return this.startSession()
    .then((_session) => {
      session = _session;
      session.startTransaction();
      return this.findOneAndUpdate(
        { _id: postID, likes: { $ne: userid } },
        {
          $push: { likes: userid },
          $inc: { countLikes: 1 },
        },
        { new: true, session: session }
      );
    })
    .then((doc) => {
      assert(doc, "Already liked");
      console.log(doc);
    })
    .then(() =>
      User.findByIdAndUpdate(userid, { $addToSet: { likes: postID } }).session(
        session
      )
    )
    .then((doc) => assert(doc, "User not found"))
    .then(() => session?.commitTransaction())
    .catch(async (err) => {
      console.log(err);
      await session?.abortTransaction();
      throw { message: err.message };
    })
    .finally(() => session?.endSession());
};

postSchema.statics.unlikePost = async function (
  postID: string,
  userid: string
) {
  let session: ClientSession | null = null;
  return this.startSession()
    .then((_session) => {
      session = _session;
      session.startTransaction();
      return this.findOneAndUpdate(
        { _id: postID, likes: { $eq: userid } },
        {
          $pull: { likes: userid },
          $inc: { countLikes: -1 },
        },
        { new: true, session: session }
      );
    })
    .then((doc) => assert(doc, "Already unliked"))
    .then(() =>
      User.findByIdAndUpdate(userid, { $pull: { likes: postID } }).session(
        session
      )
    )
    .then((doc) => assert.ok(doc))
    .then(() => session?.commitTransaction())
    .then(() => session?.endSession())
    .catch(async (err) => {
      console.log(err.message);
      await session?.abortTransaction();
      throw { message: err.message };
    })
    .finally(() => session?.endSession());
};

postSchema.statics.addComment = async function (
  postID: string,
  userid: string,
  content: string
) {
  return Post.findByIdAndUpdate(
    postID,
    {
      $push: {
        comments: {
          author: userid,
          content: content,
        },
      },
    },
    { new: true }
  );
};

const Post = model<IPost, IPostModel>("Post", postSchema);
export = Post;
