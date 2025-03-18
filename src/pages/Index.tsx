
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./Dashboard";

export default function Index() {
  const navigate = useNavigate();

  // Check if user is logged in, redirect to login if not
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <Layout title="Dashboard">
      <Dashboard />
    </Layout>
  );
}
