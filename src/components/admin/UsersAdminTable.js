"use client";

import { useState } from "react";
import { ROLES } from "@/constants/roles";
import { Badge } from "@/components/ui/Badge";

export function UsersAdminTable({ users, currentUserId }) {
  const [localUsers, setLocalUsers] = useState(users);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDevicesId, setExpandedDevicesId] = useState(null);

  const updateRole = async (userId, newRole) => {
    const currentUser = localUsers.find((u) => u._id.toString() === userId);
    if (currentUser.role === newRole) return;

    if (userId === currentUserId) {
      if (!confirm("You are changing your own role and may lose admin access immediately. Continue?")) {
        return;
      }
    }

    setUpdatingId(userId);
    setErrorId(null);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorId(userId);
        setErrorMessage(data.error || "Failed to update role");
        return;
      }

      setLocalUsers((prev) =>
        prev.map((u) => (u._id.toString() === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Error updating user role:", err);
      setErrorId(userId);
      setErrorMessage("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (userId, nextIsBlocked) => {
    setStatusUpdatingId(userId);
    setErrorId(null);
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
        setErrorId(userId);
        setErrorMessage(data.error || "Failed to update status");
        return;
      }

      setLocalUsers((prev) =>
        prev.map((u) =>
          u._id.toString() === userId
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
      setErrorId(userId);
      setErrorMessage("Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;

    setDeletingId(userId);
    setErrorId(null);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setErrorId(userId);
        setErrorMessage(data.error || "Failed to delete user");
        return;
      }

      setLocalUsers((prev) => prev.filter((u) => u._id.toString() !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      setErrorId(userId);
      setErrorMessage("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = localUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search by email or name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md bg-transparent border-b border-border px-0 py-2 text-sm font-body text-highlight placeholder-muted focus:outline-none focus:border-accent transition-colors"
      />

      {errorMessage && (
        <p className="font-mono text-xs text-error tracking-widest uppercase">
          {errorMessage}
        </p>
      )}

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Email
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Name
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Role
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Status
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Device
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Joined
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-t border-border hover:bg-surface-2 transition-colors">
                <td className="px-4 py-3 font-body text-highlight">{user.email}</td>
                <td className="px-4 py-3 font-body text-muted">{user.name}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user._id.toString(), e.target.value)}
                    disabled={updatingId === user._id.toString()}
                    className="bg-transparent border border-border px-2 py-1 text-xs font-mono uppercase tracking-widest rounded cursor-pointer text-accent disabled:opacity-50"
                  >
                    {Object.values(ROLES).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {updatingId === user._id.toString() && (
                    <span className="ml-2 text-xs text-muted">Updating...</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => updateStatus(user._id.toString(), !user.isBlocked)}
                      disabled={statusUpdatingId === user._id.toString() || user._id.toString() === currentUserId}
                      className={`px-2 py-1 text-xs font-mono uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.isBlocked
                          ? "bg-error text-white hover:bg-error"
                          : "border border-border text-muted hover:text-accent hover:border-accent"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Block"}
                    </button>
                    {statusUpdatingId === user._id.toString() && (
                      <span className="text-xs text-muted">Updating...</span>
                    )}
                    {user.isBlocked && user.blockedAt && (
                      <div className="text-xs text-muted space-y-0.5">
                        <div>
                          by {user.blockedBy?.email || "unknown"} ·{" "}
                          {new Date(user.blockedAt).toLocaleDateString()}
                        </div>
                        {user.blockReason && (
                          <div className="italic text-muted">{user.blockReason}</div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {!user.devices || user.devices.length === 0 ? (
                    <span className="text-xs text-muted italic">No login recorded</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <Badge variant="muted">{user.devices[0].label}</Badge>
                      <div className="text-xs text-muted">
                        Last seen {new Date(user.devices[0].lastSeenAt).toLocaleDateString()} ·{" "}
                        {user.devices[0].loginCount}x
                      </div>
                      {user.devices.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDevicesId(
                              expandedDevicesId === user._id.toString() ? null : user._id.toString()
                            )
                          }
                          className="text-xs font-mono text-accent hover:text-accent-hover uppercase tracking-widest text-left"
                        >
                          +{user.devices.length - 1} more {expandedDevicesId === user._id.toString() ? "↑" : "↓"}
                        </button>
                      )}
                      {expandedDevicesId === user._id.toString() && (
                        <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-border">
                          {user.devices.slice(1).map((d, i) => (
                            <div key={i} className="text-xs text-muted">
                              {d.label} · {new Date(d.lastSeenAt).toLocaleDateString()} · {d.loginCount}x
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-body text-muted text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteUser(user._id.toString())}
                    disabled={deletingId === user._id.toString() || user._id.toString() === currentUserId}
                    className="px-2 py-1 text-xs font-mono uppercase tracking-widest rounded border border-error text-error hover:bg-error hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  {deletingId === user._id.toString() && (
                    <span className="ml-2 text-xs text-muted">Deleting...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <p className="font-body text-muted text-center py-8">No users found.</p>
      )}
    </div>
  );
}
