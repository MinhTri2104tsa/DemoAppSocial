import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Modal from "./components/Modal";
import PostForm from "./components/PostForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "./utils/auth";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  useEffect(() => {
    // Listen to storage events (login/logout from other tabs or same tab)
    const onStorageChange = () => {
      setAuthenticated(isAuthenticated());
    };
    window.addEventListener('storage', onStorageChange);
    
    // Listen to custom auth events (login/logout in this app)
    window.addEventListener('authStateChanged', onStorageChange);
    
    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('authStateChanged', onStorageChange);
    };
  }, []);
  const handlePostCreated = () => {
    setIsModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <BrowserRouter>
      {authenticated && <Sidebar onOpenCreate={() => setIsModalOpen(true)} />}
      
      <div className={authenticated ? "ml-64" : ""}>
        <Navbar />
        <main className="bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Home key={refreshTrigger} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>

      {authenticated && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <PostForm onPostCreated={handlePostCreated} />
        </Modal>
      )}
    </BrowserRouter>
  );
}

export default App;
