"use client";

import { useState, useEffect, useMemo } from "react";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { Badge } from "@/components/ui/Badge";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";

const columnHelper = createColumnHelper();

function createBlogColumns({
  onEdit,
  onPublish,
  onDelete,
  updatingId,
  deletingId,
}) {
  return [
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => <span className="font-body text-highlight font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("tags", {
      id: "tags",
      header: "Tags",
      cell: (info) => {
        const tags = info.getValue() || [];
        if (tags.length === 0) return <span className="text-xs text-muted">–</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="muted">+{tags.length - 3}</Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("isPublished", {
      id: "status",
      header: "Status",
      cell: (info) => {
        const post = info.row.original;
        const isPublished = info.getValue();
        const isUpdating = updatingId === post._id;

        return (
          <div className="flex flex-col gap-1">
            <Badge variant={isPublished ? "blue" : "muted"}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
            {isUpdating && <span className="text-xs text-muted">Updating...</span>}
          </div>
        );
      },
    }),
    columnHelper.accessor("publishedAt", {
      id: "publishedAt",
      header: "Published",
      cell: (info) => {
        const date = info.getValue();
        if (!date) return <span className="text-xs text-muted">–</span>;
        return (
          <span className="font-body text-muted text-xs">
            {new Date(date).toLocaleDateString()}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const post = info.row.original;
        const postId = post._id;
        const isUpdating = updatingId === postId;
        const isDeleting = deletingId === postId;

        return (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onEdit(post)}
              disabled={isUpdating || isDeleting}
              className="px-2 py-1 text-xs font-mono uppercase tracking-widest rounded border border-border text-muted hover:text-accent hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={() => onPublish(post)}
              disabled={isUpdating || isDeleting}
              className={`px-2 py-1 text-xs font-mono uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                post.isPublished
                  ? "border border-border text-muted hover:text-error hover:border-error"
                  : "bg-accent text-bg hover:bg-accent-hover"
              }`}
            >
              {post.isPublished ? "Unpublish" : "Publish"}
            </button>
            <button
              onClick={() => onDelete(post)}
              disabled={isUpdating || isDeleting}
              className="px-2 py-1 text-xs font-mono uppercase tracking-widest rounded border border-error text-error hover:bg-error hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
            {isDeleting && <span className="text-xs text-muted">Deleting...</span>}
          </div>
        );
      },
    }),
  ];
}

export function BlogAdminTable({ posts, page, pageSize, totalCount }) {
  const [localPosts, setLocalPosts] = useState(posts);
  const [editingPost, setEditingPost] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { q, setParams, isPending } = useTableQueryState();
  const [searchValue, setSearchValue] = useState(q);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handleEdit = (post) => {
    setEditingPost(post);
    setErrorMessage("");
  };

  const handleCancel = () => {
    setEditingPost(null);
    setErrorMessage("");
  };

  const handleSaved = (updatedPost) => {
    setEditingPost(null);
    setErrorMessage("");
    setParams({ page: 1 });
  };

  const handlePublish = async (post) => {
    setUpdatingId(post._id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/blog/${post._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: !post.isPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      setLocalPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, isPublished: data.post.isPublished, publishedAt: data.post.publishedAt }
            : p
        )
      );
    } catch (err) {
      console.error("Error updating post:", err);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This action cannot be undone.`)) return;

    setDeletingId(post._id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/blog/${post._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to delete");
        return;
      }

      setLocalPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (err) {
      console.error("Error deleting post:", err);
      setErrorMessage("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo(
    () =>
      createBlogColumns({
        onEdit: handleEdit,
        onPublish: handlePublish,
        onDelete: handleDelete,
        updatingId,
        deletingId,
      }),
    [updatingId, deletingId]
  );

  const table = useReactTable({
    data: localPosts,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: { pageIndex: page - 1, pageSize },
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex: page - 1, pageSize }) : updater;
      setParams({ page: next.pageIndex + 1 });
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      {editingPost && (
        <BlogPostEditor
          post={editingPost}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setEditingPost({})}
          className="w-fit px-4 py-2 font-mono text-xs tracking-widest uppercase bg-accent hover:bg-accent-hover text-bg transition-colors"
        >
          + New Post
        </button>

        <TableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(v) => setParams({ q: v })}
          placeholder="Search by title or excerpt..."
        />

        {errorMessage && (
          <p className="font-mono text-xs text-error tracking-widest uppercase">
            {errorMessage}
          </p>
        )}

        <DataTable table={table} isPending={isPending} emptyMessage="No blog posts yet." />

        <DataTablePagination
          page={page}
          pageCount={table.getPageCount()}
          totalCount={totalCount}
          onPageChange={(p) => setParams({ page: p })}
          pageSize={pageSize}
          onPageSizeChange={(size) => setParams({ pageSize: size, page: 1 })}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
