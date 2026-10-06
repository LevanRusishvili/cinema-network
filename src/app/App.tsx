import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/sessions" element={<div>Sessions</div>} />
      <Route path="/movies/:id" element={<div>Movie</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
    </Routes>
  );
}
