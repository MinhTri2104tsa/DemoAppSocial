import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

export default function PostItem({ post }) {
  return (
    <div className="bg-white border border-instagram-border rounded-lg shadow-sm p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-instagram-divider">
        <div>
          <b className="text-instagram-text font-semibold">{post.username}</b>
        </div>
        <span className="text-instagram-textSecondary text-xs">
          {new Date(post.created_at).toLocaleString('vi-VN')}
        </span>
      </div>

      {/* Media */}
      {post.image && (
        <img src={post.image} alt="" className="rounded-lg mb-3 w-full max-h-96 object-cover" />
      )}
      {post.video && (
        <video controls className="rounded-lg mb-3 w-full max-h-96 object-cover">
          <source src={post.video} type="video/mp4" />
        </video>
      )}

      {/* Content */}
      <p className="mb-4 text-instagram-text text-sm">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-instagram-divider">
        <LikeButton postId={post.id} />
        <span className="cursor-pointer hover:text-instagram-textSecondary transition-all text-sm">
          💬 Bình luận
        </span>
      </div>

      {/* Comments */}
      <div className="mt-4 pt-4 border-t border-instagram-divider">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
