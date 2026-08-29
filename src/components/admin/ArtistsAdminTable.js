"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useReactTable, getCoreRowModel, getExpandedRowModel, createColumnHelper } from "@tanstack/react-table";
import { useTableQueryState } from "@/hooks/useTableQueryState";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { Badge } from "@/components/ui/Badge";
import { RoleCheckboxGroup } from "@/components/ui/RoleCheckboxGroup";
import { FilterTabs } from "@/components/ui/FilterTabs";

const columnHelper = createColumnHelper();

function createArtistColumns({
  currentUserId,
  onRoleChange,
  onStatusChange,
  onDelete,
  updatingId,
  statusUpdatingId,
  deletingId,
  expandedRows,
  onToggleExpand,
}) {
  return [
    columnHelper.accessor("email", {
      id: "email",
      header: "Email",
      cell: (info) => <span className="font-body text-highlight">{info.getValue()}</span>,
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: "Name",
      cell: (info) => <span className="font-body text-muted">{info.getValue()}</span>,
    }),
    columnHelper.accessor("roles", {
      id: "roles",
      header: "Role",
      cell: (info) => {
        const userId = info.row.original._id;
        const isUpdating = updatingId === userId;
        return (
          <div className="flex flex-col gap-1">
            <RoleCheckboxGroup
              value={info.getValue()}
              disabled={isUpdating}
              onChange={(newRoles) => onRoleChange(userId, newRoles)}
            />
            {isUpdating && <span className="text-xs text-muted">Updating...</span>}
          </div>
        );
      },
    }),
    columnHelper.accessor("isBlocked", {
      id: "status",
      header: "Status",
      cell: (info) => {
        const user = info.row.original;
        const userId = user._id;
        const isUpdating = statusUpdatingId === userId;
        const isCurrentUser = userId === currentUserId;

        return (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onStatusChange(userId, !user.isBlocked)}
              disabled={isUpdating || isCurrentUser}
              className={`px-2 py-1 text-xs font-mono uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                user.isBlocked
                  ? "bg-error text-white hover:bg-error"
                  : "border border-border text-muted hover:text-accent hover:border-accent"
              }`}
            >
              {user.isBlocked ? "Blocked" : "Block"}
            </button>
            {isUpdating && <span className="text-xs text-muted">Updating...</span>}
            {user.isBlocked && user.blockedAt && (
              <div className="text-xs text-muted space-y-0.5">
                <div>
                  by {user.blockedBy?.email || "unknown"} ·{" "}
                  {new Date(user.blockedAt).toLocaleDateString()}
                </div>
                {user.blockReason && <div className="italic text-muted">{user.blockReason}</div>}
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("devices", {
      id: "devices",
      header: "Device",
      cell: (info) => {
        const user = info.row.original;
        const userId = user._id;
        const devices = info.getValue() || [];

        if (!devices || devices.length === 0) {
          return <span className="text-xs text-muted italic">No login recorded</span>;
        }

        const isExpanded = expandedRows.has(userId);

        return (
          <div className="flex flex-col gap-1">
            <Badge variant="muted">{devices[0].label}</Badge>
            <div className="text-xs text-muted">
              Last seen {new Date(devices[0].lastSeenAt).toLocaleDateString()} · {devices[0].loginCount}x
            </div>
            {devices.length > 1 && (
              <button
                type="button"
                onClick={() => onToggleExpand(userId)}
                className="text-xs font-mono text-accent hover:text-accent-hover uppercase tracking-widest text-left"
              >
                +{devices.length - 1} more {isExpanded ? "↑" : "↓"}
              </button>
            )}
            {isExpanded && (
              <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-border">
                {devices.slice(1).map((d, i) => (
                  <div key={i} className="text-xs text-muted">
                    {d.label} · {new Date(d.lastSeenAt).toLocaleDateString()} · {d.loginCount}x
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: "Joined",
      cell: (info) => (
        <span className="font-body text-muted text-xs">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const user = info.row.original;
        const userId = user._id;
        const isDeletingThis = deletingId === userId;
        const isCurrentUser = userId === currentUserId;

        return (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onDelete(user)}
              disabled={isDeletingThis || isCurrentUser}
              className="px-2 py-1 text-xs font-mono uppercase tracking-widest rounded border border-error text-error hover:bg-error hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
            {isDeletingThis && <span className="text-xs text-muted">Deleting...</span>}
          </div>
        );
      },
    }),
  ];
}

export function ArtistsAdminTable({ users, currentUserId, page, pageSize, totalCount }) {
  const [localUsers, setLocalUsers] = useState(users);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [deletingId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const { q, setParams, isPending } = useTableQueryState();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(q);
  const status = searchParams.get('status') || 'all';

  // Resync when prop data changes
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const onToggleExpand = (userId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const updateRoles = async (userId, newRoles) => {
    const currentUser = localUsers.find((u) => u._id === userId);
    const wasAdmin = currentUser.roles?.includes("admin");
    const staysAdmin = newRoles.includes("admin");

    if (userId === currentUserId && wasAdmin && !staysAdmin) {
      if (!confirm("You are removing your own admin role and may lose admin access immediately. Continue?")) {
        return;
      }
    }

    setUpdatingId(userId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: newRoles }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to update roles");
        return;
      }

      setLocalUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, roles: newRoles } : u)));
    } catch (err) {
      console.error("Error updating user roles:", err);
      setErrorMessage("Failed to update roles");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (userId, nextIsBlocked) => {
    setStatusUpdatingId(userId);
    setErrorMessage("");

    let reason;
    if (nextIsBlocked) {
      reason = window.prompt("Reason for blocking (optional):");
      if (reason === null) return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: nextIsBlocked, ...(reason !== undefined && { reason }) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to update status");
        return;
      }

      setLocalUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? {
                ...u,
                isBlocked: data.isBlocked,
                blockedAt: data.blockedAt,
                blockedBy: data.blockedBy,
                blockReason: data.blockReason,
              }
            : u
        )
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      setErrorMessage("Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const deleteUser = async (user) => {
    const userId = user._id;
    const hasArtistProfile = Boolean(user.artistId);

    const message = hasArtistProfile
      ? "Delete this artist? This will permanently remove their artist profile, media files, and booking records — but the user account itself will remain (role: artist, no profile). This action cannot be undone."
      : "Delete this user? This action cannot be undone.";
    if (!window.confirm(message)) return;

    setDeleteId(userId);
    setErrorMessage("");

    try {
      const endpoint = hasArtistProfile ? `/api/artists/${user.artistId}` : `/api/users/${userId}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to delete");
        return;
      }

      setLocalUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Error deleting artist:", err);
      setErrorMessage("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const columns = useMemo(
    () =>
      createArtistColumns({
        currentUserId,
        onRoleChange: updateRoles,
        onStatusChange: updateStatus,
        onDelete: deleteUser,
        updatingId,
        statusUpdatingId,
        deletingId,
        expandedRows,
        onToggleExpand,
      }),
    [updatingId, statusUpdatingId, deletingId, expandedRows, currentUserId]
  );

  const table = useReactTable({
    data: localUsers,
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
    getExpandedRowModel: getExpandedRowModel(),
  });

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'blocked', label: 'Blocked' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <TableSearchInput
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(v) => setParams({ q: v })}
          placeholder="Search by email or name..."
        />

        <FilterTabs
          options={statusOptions}
          active={status}
          onChange={(value) => setParams({ status: value })}
        />
      </div>

      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">{errorMessage}</p>
      )}

      <DataTable table={table} isPending={isPending} emptyMessage="No artists found." />

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
