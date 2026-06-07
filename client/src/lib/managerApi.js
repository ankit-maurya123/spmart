/**
 * Returns axios config with the manager JWT attached when available.
 * Use as: axios.get(url, managerHeaders())
 */
export function managerHeaders() {
  const token = localStorage.getItem("spmart-manager-token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}
