import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ActivitiesPage from './pages/ActivitiesPage';
import MembersPage from './pages/MembersPage';
import BoardPage from './pages/BoardPage';
import PostDetailPage from './pages/PostDetailPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPostEditor from './pages/admin/AdminPostEditor';
import AdminMembers from './pages/admin/AdminMembers';
import AdminMessages from './pages/admin/AdminMessages';

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <div className="min-h-screen bg-aing-black flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/:id" element={<PostDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/posts/new" element={<AdminPostEditor />} />
              <Route path="/admin/posts/edit/:id" element={<AdminPostEditor />} />
              <Route path="/admin/members" element={<AdminMembers />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-gradient mb-4">404</div>
                    <p className="text-aing-muted mb-6">페이지를 찾을 수 없습니다.</p>
                    <a href="/" className="btn-primary text-sm">홈으로</a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
