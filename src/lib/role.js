/** Role → dashboard home mapping shared by auth pages + guards. */
export function dashboardFor(role) {
  if (role === "technician") return "/dashboard/technician";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/customer";
}

/** Where should this signed-in user land after login? */
export function landingFor(user, callback) {
  if (callback && typeof callback === "string" && callback.startsWith("/")) {
    return callback;
  }
  if (!user) return "/dashboard/customer";
  return dashboardFor(user.role || "customer");
}
