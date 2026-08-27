export const ROLES = {
  USER: "user", // Default — fans, general public logged in
  ARTIST: "artist", // Can edit their own artist profile
  MANAGER: "manager", // Can manage assigned artists
  ADMIN: "admin", // Full access — all artists, users, bookings
};

export const ROLE_HIERARCHY = {
  user: 0,
  artist: 1,
  manager: 2,
  admin: 3,
};

export function hasRole(userRoles, requiredRole) {
  const roles = Array.isArray(userRoles) ? userRoles : [];
  const maxLevel = roles.reduce((max, r) => Math.max(max, ROLE_HIERARCHY[r] ?? -1), -1);
  return maxLevel >= (ROLE_HIERARCHY[requiredRole] ?? 999);
}
