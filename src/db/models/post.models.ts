import {Model, model, ObjectId, Schema, Types} from "mongoose";
import {commentSchema} from "./comment.models";

interface IImage {
  account_id?: number;
  account_url?: any;
  ad_type?: number
  ad_url?: string
  animated?: boolean
  bandwidth?: number
  datetime?: number
  deletehash: string
  description?: string
  edited?: string
  favorite?: boolean
  has_sound?: boolean
  height: number
  id: string
  in_gallery?: boolean
  in_most_viral?: boolean
  is_ad?: boolean
  link: string
  name: string
  nsfw?: any
  section?: any
  size: number
  tags?: []
  title?: string
  type?: string
  views?: number
  vote?: any
  width: number
}

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

  getPosts(userid: string): Promise<IPost[]>;

  deletePost(postId: string): Promise<IPost>;

  addComment(postId: string, userid: string, comment: string): Promise<IPost>;
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


postSchema.statics.addPost = async function (userid, post) {
  return Post.create({
    ...post,
    author: userid,
  });
};

postSchema.statics.deletePost = async function (postID: string) {
  return Post.findByIdAndUpdate(postID, {isDelete: true}, {new: true});
};

postSchema.statics.getPosts = async function (userId: string) {
  return Post.find({author: userId, isDelete: false})
    .populate("author", "username firstName lastName avatar")
    .populate("comments.author")
    .populate("comments.comments")
    .populate("likes")
    .populate("reTweet")
    .sort({createAt: -1});
};

postSchema.statics.likePost = async function (postID: string, userid: string) {
  return Post.findByIdAndUpdate(
    postID,
    {
      $addToSet: {likes: userid},
      $inc: {countLikes: 1},
    },
    {new: true}
  );
};

postSchema.statics.unlikePost = async function (postID: string, userid: string) {
  return Post.findByIdAndUpdate(
    postID,
    {
      $pull: {likes: userid},
      $inc: {countLikes: -1},
    },
    {new: true}
  );
};

postSchema.statics.addComment = async function (postID: string, userid: string, content: string) {
  return Post.findByIdAndUpdate(
    postID,
    {
      $push: {
        comments: {
          author: userid,
          content: content,
        }
      },
    },
    {new: true}
  );
};


const Post = model<IPost, IPostModel>("Post", postSchema);
export = Post;

