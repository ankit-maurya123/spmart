/**
 * Returns axios config with the user JWT attached when available.
 * Use as: axios.get(url, authHeaders())
 */
export function authHeaders() {
  const token = localStorage.getItem("spmart-user-token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}
