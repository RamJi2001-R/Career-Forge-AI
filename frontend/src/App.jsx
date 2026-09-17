import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import Report from "./pages/Report.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import InterviewPrep from "./pages/InterviewPrep.jsx";
import AtsOptimizer from "./pages/AtsOptimizer.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider poore app ko wrap karta hai, taaki har page
          se login status/user info accessible rahe */}
      <AuthProvider>
        <Routes>
          {/* Root path ab Landing page dikhata hai, login/register ka gateway */}
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report/:id"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report/:id/skill-gap"
            element={
              <ProtectedRoute>
                <SkillGap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report/:id/interview-prep"
            element={
              <ProtectedRoute>
                <InterviewPrep />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report/:id/ats-optimize"
            element={
              <ProtectedRoute>
                <AtsOptimizer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
