import { useContext } from "react";

import { AuthContext, AuthContextProps } from "../contexts/Auth";

export function useAuth(): AuthContextProps {
  return useContext(AuthContext);
}
