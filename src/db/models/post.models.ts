import { Types, Schema, Model, model, ObjectId } from "mongoose";

const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    max: 500,
    required: true,
  },
});

interface IPost {
  author?: ObjectId;
  content: string;
  imagePath?: Types.Array<string>;
  createAt?: Date;
  comments?: Types.ArraySubdocument;
  likes?: Types.DocumentArray<ObjectId>;
  isPublic?: boolean;
  isDelete?: boolean;
}

interface IPostModel extends Model<IPost> {
  addPost(userid: string, post: IPost): Promise<IPost>;
  deletePost(postId: string): Promise<IPost>;
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
    required: true,
  },
  imagePath: {
    type: Array,
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
    },
  ],
  isPublic: {
    type: Boolean,
    default: true,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
});

postSchema.statics.addPost = async function (userid, post) {
  return Post.create({
    ...post,
    author: userid,
  });
};

postSchema.statics.deletePost = async function (postID: string) {
  return Post.findByIdAndUpdate(postID, { isDelete: true }, { new: true });
};

const Post = model<IPost, IPostModel>("Post", postSchema);

export = Post;
