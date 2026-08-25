"use client";

import { useState } from "react";
import { ROLES } from "@/constants/roles";

export function UsersAdminTable({ users, currentUserId }) {
  const [localUsers, setLocalUsers] = useState(users);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
                Joined
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
                <td className="px-4 py-3 font-body text-muted text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
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
