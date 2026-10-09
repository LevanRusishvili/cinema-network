import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/app/Layout";
import { useAuthStore } from "@/stores/authStore";
import HomePage from "@/features/home/HomePage";
import SessionsPage from "@/features/sessions/SessionsPage";
import MoviePage from "@/features/movie/MoviePage";

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />{" "}
        <Route path="/sessions" element={<SessionsPage />} />{" "}
        <Route path="/movies/:slug" element={<MoviePage />} />{" "}
        <Route path="/profile" element={<div className="mx-auto max-w-app p-6">Profile</div>} />
      </Route>
    </Routes>
  );
}
