import {model, ObjectId, Schema} from "mongoose";

export interface IComment {
  author: ObjectId;
  content: string;
  comments?: ObjectId[];
}

export const commentSchema = new Schema<IComment>({
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
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: [],
    },
  ],
});

export const Comment = model("Comment", commentSchema);

