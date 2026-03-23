import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClearStoredAuth } from "../api";

export default function Logout() {

  const navigate = useNavigate();

  useEffect(() => {
    ClearStoredAuth();
    navigate("/login", { replace: true });
  }, [navigate]);

  return <p>Logging out...</p>;
}
