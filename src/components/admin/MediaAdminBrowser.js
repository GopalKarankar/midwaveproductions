"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { isGifAsset } from "@/lib/media/isGifAsset";

const TYPE_LABELS = {
  image: "Image",
  audio: "Audio",
  video: "Video",
  document: "Document",
};

const TYPE_ORDER = ["image", "audio", "video", "document"];

const columnHelper = createColumnHelper();

function createMediaColumns() {
  return [
    columnHelper.accessor("filename", {
      id: "filename",
      header: "Filename",
      cell: (info) => <span className="font-body text-highlight truncate">{info.getValue()}</span>,
    }),
    columnHelper.accessor("artistId.stageName", {
      id: "artist",
      header: "Artist",
      cell: (info) => <span className="font-body text-muted text-xs">{info.getValue() || "—"}</span>,
    }),
    columnHelper.accessor("size", {
      id: "size",
      header: "Size",
      cell: (info) => {
        const size = info.getValue();
        return <span className="font-body text-muted text-xs">{size ? (size / 1024 / 1024).toFixed(2) : "—"} MB</span>;
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: "Uploaded",
      cell: (info) => (
        <span className="font-body text-muted text-xs">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "preview",
      header: "Preview",
      cell: (info) => {
        const asset = info.row.original;
        if (asset.type !== "image") return null;

        return isGifAsset(asset.mimeType) ? (
          <img
            src={asset.url}
            alt={asset.filename}
            className="w-16 h-16 object-cover border border-border"
          />
        ) : (
          <Image
            src={asset.url}
            alt={asset.filename}
            width={64}
            height={64}
            className="w-16 h-16 object-cover border border-border"
          />
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: (info) => {
        const asset = info.row.original;
        const isDeleting = info.row.original._isDeleting;

        return (
          <button
            onClick={() => info.row.original._onDelete(asset._id)}
            disabled={isDeleting}
            className="text-error hover:text-error-hover transition-colors text-xs font-mono uppercase tracking-widest disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        );
      },
    }),
  ];
}

export function MediaAdminBrowser({ assets, page, pageSize, totalCount }) {
  const [localAssets, setLocalAssets] = useState(assets);
  const [isDeleting, setIsDeleting] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { type, q, setParams, isPending } = useTableQueryState();
  const [searchValue, setSearchValue] = useState(q);

  // Resync when prop data changes
  useEffect(() => {
    setLocalAssets(assets);
  }, [assets]);

  const activeType = type === "all" ? "all" : type;

  const deleteAsset = async (assetId) => {
    if (!confirm("Delete this media file? This action cannot be undone.")) return;

    setIsDeleting(assetId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/media/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to delete media file");
        return;
      }

      setLocalAssets((prev) => prev.filter((a) => a._id !== assetId));
    } catch (err) {
      console.error("Error deleting media:", err);
      setErrorMessage("Failed to delete media file");
    } finally {
      setIsDeleting(null);
    }
  };

  // Enhance assets with delete callback for the cell renderer
  const enhancedAssets = localAssets.map((asset) => ({
    ...asset,
    _isDeleting: isDeleting === asset._id,
    _onDelete: deleteAsset,
  }));

  const columns = useMemo(() => createMediaColumns(), []);

  const table = useReactTable({
    data: enhancedAssets,
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

  const typeOptions = [
    { value: 'all', label: 'All' },
    ...TYPE_ORDER.map((t) => ({ value: t, label: TYPE_LABELS[t] })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <FilterTabs
          options={typeOptions}
          active={activeType}
          onChange={(value) => setParams({ type: value })}
        />

        <TableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(v) => setParams({ q: v })}
          placeholder="Search by filename..."
        />
      </div>

      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">{errorMessage}</p>
      )}

      <DataTable table={table} isPending={isPending} emptyMessage="No media files found." />

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
  );
}
