import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  return <p>Logging out...</p>;
}