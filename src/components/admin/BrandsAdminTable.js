"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { Badge } from "@/components/ui/Badge";
import { BrandEditor } from "@/components/admin/BrandEditor";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { SelectField } from "@/components/ui/SelectField";

const columnHelper = createColumnHelper();

function createBrandColumns({
  onEdit,
  onToggleActive,
  onToggleFeatured,
  onDelete,
  updatingId,
  deletingId,
}) {
  return [
    columnHelper.accessor("logoUrl", {
      id: "logo",
      header: "Logo",
      cell: (info) => {
        const logoUrl = info.getValue();
        if (!logoUrl) return <span className="text-xs text-muted">–</span>;
        return (
          <img
            src={logoUrl}
            alt="brand logo"
            className="h-8 w-auto max-w-xs object-contain grayscale"
          />
        );
      },
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: "Name",
      cell: (info) => <span className="font-body text-highlight font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("websiteUrl", {
      id: "website",
      header: "Website",
      cell: (info) => {
        const url = info.getValue();
        if (!url) return <span className="text-xs text-muted">–</span>;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:text-accent-hover underline"
          >
            Visit ↗
          </a>
        );
      },
    }),
    columnHelper.accessor("isActive", {
      id: "status",
      header: "Status",
      cell: (info) => {
        const brand = info.row.original;
        const isActive = info.getValue();
        const isUpdating = updatingId === brand._id;

        return (
          <div className="flex flex-col gap-1">
            <Badge variant={isActive ? "blue" : "muted"}>
              {isActive ? "Active" : "Draft"}
            </Badge>
            {isUpdating && <span className="text-xs text-muted">Updating...</span>}
          </div>
        );
      },
    }),
    columnHelper.accessor("isFeatured", {
      id: "featured",
      header: "Featured",
      cell: (info) => {
        const isFeatured = info.getValue();
        return isFeatured ? (
          <Badge variant="accent-2">Featured</Badge>
        ) : (
          <span className="text-xs text-muted">–</span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const brand = info.row.original;
        const brandId = brand._id;
        const isUpdating = updatingId === brandId;
        const isDeleting = deletingId === brandId;

        return (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onEdit(brand)}
              disabled={isUpdating || isDeleting}
              className="px-2 py-1 text-xs font-mono uppercase tracking-widest rounded border border-border text-muted hover:text-accent hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={() => onToggleActive(brand)}
              disabled={isUpdating || isDeleting}
              className={`px-2 py-1 text-xs font-mono uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                brand.isActive
                  ? "border border-border text-muted hover:text-error hover:border-error"
                  : "bg-accent text-bg hover:bg-accent-hover"
              }`}
            >
              {brand.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => onToggleFeatured(brand)}
              disabled={isUpdating || isDeleting}
              className={`px-2 py-1 text-xs font-mono uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                brand.isFeatured
                  ? "border border-border text-muted hover:text-error hover:border-error"
                  : "border border-accent-2 text-accent-2 hover:bg-accent-2 hover:text-bg"
              }`}
            >
              {brand.isFeatured ? "Unfeature" : "Feature"}
            </button>
            <button
              onClick={() => onDelete(brand)}
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

export function BrandsAdminTable({ brands, page, pageSize, totalCount }) {
  const [localBrands, setLocalBrands] = useState(brands);
  const [editingBrand, setEditingBrand] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { q, setParams, isPending } = useTableQueryState();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(q);
  const status = searchParams.get('status') || 'all';
  const featured = searchParams.get('featured') || 'all';

  useEffect(() => {
    setLocalBrands(brands);
  }, [brands]);

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setErrorMessage("");
  };

  const handleCancel = () => {
    setEditingBrand(null);
    setErrorMessage("");
  };

  const handleSaved = () => {
    setEditingBrand(null);
    setErrorMessage("");
    setParams({ page: 1 });
  };

  const handleToggleActive = async (brand) => {
    setUpdatingId(brand._id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/brands/${brand._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !brand.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      setLocalBrands((prev) =>
        prev.map((b) =>
          b._id === brand._id ? { ...b, isActive: data.brand.isActive } : b
        )
      );
    } catch (err) {
      console.error("Error updating brand:", err);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (brand) => {
    setUpdatingId(brand._id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/brands/${brand._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFeatured: !brand.isFeatured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to update");
        return;
      }

      setLocalBrands((prev) =>
        prev.map((b) =>
          b._id === brand._id ? { ...b, isFeatured: data.brand.isFeatured } : b
        )
      );
    } catch (err) {
      console.error("Error updating brand:", err);
      setErrorMessage("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (brand) => {
    if (!window.confirm(`Delete "${brand.name}"? This action cannot be undone.`)) return;

    setDeletingId(brand._id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/brands/${brand._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to delete");
        return;
      }

      setLocalBrands((prev) => prev.filter((b) => b._id !== brand._id));
    } catch (err) {
      console.error("Error deleting brand:", err);
      setErrorMessage("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo(
    () =>
      createBrandColumns({
        onEdit: handleEdit,
        onToggleActive: handleToggleActive,
        onToggleFeatured: handleToggleFeatured,
        onDelete: handleDelete,
        updatingId,
        deletingId,
      }),
    [updatingId, deletingId]
  );

  const table = useReactTable({
    data: localBrands,
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

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const featuredOptions = [
    { value: 'all', label: 'All' },
    { value: 'yes', label: 'Featured' },
    { value: 'no', label: 'Not Featured' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {editingBrand && (
        <BrandEditor
          brand={editingBrand}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setEditingBrand({})}
          className="w-fit px-4 py-2 font-mono text-xs tracking-widest uppercase bg-accent hover:bg-accent-hover text-bg transition-colors"
        >
          + New Brand
        </button>

        <div className="flex flex-col gap-3">
          <TableSearchInput
            value={searchValue}
            onChange={setSearchValue}
            onSearch={(v) => setParams({ q: v })}
            placeholder="Search by name..."
          />

          <FilterTabs
            options={statusOptions}
            active={status}
            onChange={(value) => setParams({ status: value })}
          />

          <SelectField
            id="featured-filter"
            label="Filter by Featured"
            options={featuredOptions}
            value={featured}
            onChange={(e) => setParams({ featured: e.target.value })}
          />
        </div>

        {errorMessage && (
          <p className="font-mono text-xs text-error tracking-widest uppercase">
            {errorMessage}
          </p>
        )}

        <DataTable table={table} isPending={isPending} emptyMessage="No brands yet." />

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
