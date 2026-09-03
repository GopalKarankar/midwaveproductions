"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { ArtistPortfolioEditor } from "@/components/admin/ArtistPortfolioEditor";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { exportArtistPortfolioPdf } from "@/lib/pdf/exportArtistPortfolioPdf";

const columnHelper = createColumnHelper();

export function ArtistPortfolioTable({
  artists: initialArtists,
  isAdmin,
  currentUserId,
  page,
  pageSize,
  totalCount,
}) {
  const [artists, setArtists] = useState(initialArtists);
  const [editingArtist, setEditingArtist] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  useEffect(() => {
    setArtists(initialArtists);
  }, [initialArtists]);

  const { q, status, setParams, isPending } = useTableQueryState();
  const [searchValue, setSearchValue] = useState(q);

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ];

  const columns = [
    columnHelper.accessor("stageName", {
      header: "Stage Name",
      cell: (info) => (
        <button
          onClick={() => {
            setEditingArtist(info.row.original);
            setShowEditor(true);
          }}
          className="text-accent hover:text-accent-hover transition-colors text-left font-semibold"
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor("slug", {
      header: "Slug",
      cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("genres", {
      header: "Genres",
      cell: (info) => {
        const genres = info.getValue();
        return (
          <div className="flex flex-wrap gap-1">
            {genres?.map((genre) => (
              <Badge key={genre} variant="muted">
                {genre}
              </Badge>
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor("isPublished", {
      header: "Status",
      cell: (info) => (
        <Badge variant={info.getValue() ? "blue" : "muted"}>
          {info.getValue() ? "Published" : "Draft"}
        </Badge>
      ),
    }),
    ...(isAdmin
      ? [
          columnHelper.accessor("isFeatured", {
            header: "Featured",
            cell: (info) => (
              <Badge variant={info.getValue() ? "yellow" : "muted"}>
                {info.getValue() ? "Featured" : "—"}
              </Badge>
            ),
          }),
          columnHelper.accessor("managedBy", {
            header: "Manager",
            cell: (info) => {
              const managedBy = info.getValue();
              return managedBy ? (
                <span className="text-xs text-muted">{managedBy}</span>
              ) : (
                <span className="text-xs text-muted italic">Unassigned</span>
              );
            },
          }),
        ]
      : []),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => {
        const date = new Date(info.getValue());
        return <span className="text-xs text-muted">{date.toLocaleDateString()}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const artist = info.row.original;
        const isExporting = exportingId === artist._id;

        const handleExport = async () => {
          setExportingId(artist._id);
          try {
            await exportArtistPortfolioPdf(artist);
          } finally {
            setExportingId(null);
          }
        };

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="text-xs font-mono text-accent hover:text-accent-hover disabled:text-muted disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? "Exporting..." : "Export"}
            </button>
            <button
              onClick={() => {
                setEditingArtist(artist);
                setShowEditor(true);
              }}
              className="text-xs font-mono text-accent hover:text-accent-hover transition-colors"
            >
              Edit
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete artist "${artist.stageName}"? This will also delete all associated media and bookings.`
                    )
                  ) {
                    handleDelete(artist._id);
                  }
                }}
                className="text-xs font-mono text-error hover:text-error-hover transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        );
      },
    }),
  ];

  const handleDelete = async (artistId) => {
    try {
      const response = await fetch(`/api/artists/${artistId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        alert(`Failed to delete: ${err.error || "Unknown error"}`);
        return;
      }

      setArtists((prev) => prev.filter((a) => a._id !== artistId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Network error");
    }
  };

  const handleEditorSave = (savedArtist) => {
    if (editingArtist?._id) {
      setArtists((prev) =>
        prev.map((a) => (a._id === savedArtist._id ? savedArtist : a))
      );
    } else {
      setArtists((prev) => [savedArtist, ...prev]);
    }
    setEditingArtist(null);
    setShowEditor(false);
  };

  const handleEditorCancel = () => {
    setEditingArtist(null);
    setShowEditor(false);
  };

  const table = useReactTable({
    data: artists,
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

  if (showEditor) {
    return (
      <ArtistPortfolioEditor
        artist={editingArtist}
        isAdmin={isAdmin}
        onSaved={handleEditorSave}
        onCancel={handleEditorCancel}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(v) => setParams({ q: v })}
          placeholder="Search by stage name or slug..."
        />
        <button
          onClick={() => {
            setEditingArtist(null);
            setShowEditor(true);
          }}
          className="px-4 py-2 font-mono text-xs tracking-widest uppercase bg-accent hover:bg-accent-hover text-bg transition-colors duration-200 w-full sm:w-auto"
        >
          + New Artist
        </button>
      </div>

      <FilterTabs
        options={statusOptions}
        active={status}
        onChange={(value) => setParams({ status: value })}
      />

      <DataTable table={table} isPending={isPending} />

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
