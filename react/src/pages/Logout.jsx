import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClearStoredAuth } from "../api";

export default function Logout() {

  const navigate = useNavigate();

  useEffect(() => {
    ClearStoredAuth();
    window.location.href = "/login"
    //navigate("/login", { replace: true });
  }, []);

  return <p>Logging out...</p>;
}
