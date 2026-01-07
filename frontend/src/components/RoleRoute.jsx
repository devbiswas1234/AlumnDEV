import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

export default function RoleRoute({ allowedRoles, children }) {
  const { role } = getUser();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
