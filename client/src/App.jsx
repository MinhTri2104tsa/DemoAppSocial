import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Modal from "./components/Modal";
import PostForm from "./components/PostForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { isAuthenticated } from "./utils/auth";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setIsModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <BrowserRouter>
      {isAuthenticated() && <Sidebar onOpenCreate={() => setIsModalOpen(true)} />}
      
      <div className={isAuthenticated() ? "ml-64" : ""}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home key={refreshTrigger} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      {isAuthenticated() && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <PostForm onPostCreated={handlePostCreated} />
        </Modal>
      )}
    </BrowserRouter>
  );
}

export default App;
