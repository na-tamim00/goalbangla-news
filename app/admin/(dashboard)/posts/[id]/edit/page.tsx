'use client';

import React, { useEffect, useState } from 'react';
import PostEditor from '@/components/PostEditor';
import { PostData } from '@/lib/db/types';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/posts/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.post);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400 font-bold">
        Loading post details...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center text-zinc-500 font-bold">
        Post not found.
      </div>
    );
  }

  return <PostEditor initialData={post} isEditing={true} />;
}