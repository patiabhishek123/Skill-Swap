import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import './App.css';
import { Login } from "./pages/Login";
export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};
