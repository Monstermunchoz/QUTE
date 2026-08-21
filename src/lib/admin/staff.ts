export function isStaffRole(role: string | null | undefined) {
  const value = role?.trim().toLowerCase();
  return value === "admin" || value === "moderateur";
}
