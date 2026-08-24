"use client";

import { useState } from "react";
import { ROLES } from "@/constants/roles";

export function UsersAdminTable({ users }) {
  const [localUsers, setLocalUsers] = useState(users);
  const [isLoading, setIsLoading] = useState(false);

  const updateRole = async (userId, newRole) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      setLocalUsers((prev) =>
        prev.map((u) => (u._id.toString() === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Error updating user role:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          {localUsers.map((user) => (
            <tr key={user._id} className="border-t border-border hover:bg-surface-2 transition-colors">
              <td className="px-4 py-3 font-body text-highlight">{user.email}</td>
              <td className="px-4 py-3 font-body text-muted">{user.name}</td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user._id.toString(), e.target.value)}
                  disabled={isLoading}
                  className="bg-transparent border border-border px-2 py-1 text-xs font-mono uppercase tracking-widest rounded cursor-pointer text-accent"
                >
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 font-body text-muted text-xs">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
