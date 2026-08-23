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

export function hasRole(userRole, requiredRole) {
  return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[requiredRole] ?? 999);
}
