import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/app/Layout";
import { useAuthStore } from "@/stores/authStore";
import HomePage from "@/features/home/HomePage";
import SessionsPage from "@/features/sessions/SessionsPage";
import MoviePage from "@/features/movie/MoviePage";
import ProfilePage from "@/features/profile/ProfilePage";

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
        <Route path="/movies/:slug" element={<MoviePage />} /> import ProfilePage from
        "@/features/profile/ProfilePage"; // ...
        <Route path="/profile" element={<ProfilePage />} />{" "}
      </Route>
    </Routes>
  );
}
