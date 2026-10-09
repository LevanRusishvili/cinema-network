import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/app/Layout";
import { useAuthStore } from "@/stores/authStore";
import HomePage from "@/features/home/HomePage";

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />{" "}
        <Route path="/sessions" element={<div className="mx-auto max-w-app p-6">Sessions</div>} />
        <Route path="/movies/:slug" element={<div className="mx-auto max-w-app p-6">Movie</div>} />
        <Route path="/profile" element={<div className="mx-auto max-w-app p-6">Profile</div>} />
      </Route>
    </Routes>
  );
}
