import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout, PublicLayout, ScrollToTop } from './components/layout/AppLayout.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Chat from './pages/Chat.jsx';
import Learn from './pages/Learn.jsx';
import LessonDetail from './pages/LessonDetail.jsx';
import Quizzes from './pages/Quizzes.jsx';
import QuizRunner from './pages/QuizRunner.jsx';
import Community from './pages/Community.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Experts from './pages/Experts.jsx';
import Campaigns from './pages/Campaigns.jsx';
import CampaignDetail from './pages/CampaignDetail.jsx';
import Myths from './pages/Myths.jsx';
import Resources from './pages/Resources.jsx';
import Profile from './pages/Profile.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* --- Site vitrine --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
        </Route>

        {/* --- Plateforme --- */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="chat" element={<Chat />} />
          <Route path="apprendre" element={<Learn />} />
          <Route path="apprendre/:id" element={<LessonDetail />} />
          <Route path="quiz" element={<Quizzes />} />
          <Route path="quiz/:id" element={<QuizRunner />} />
          <Route path="communaute" element={<Community />} />
          <Route path="communaute/:id" element={<PostDetail />} />
          <Route path="expertes" element={<Experts />} />
          <Route path="campagnes" element={<Campaigns />} />
          <Route path="campagnes/:id" element={<CampaignDetail />} />
          <Route path="mythes" element={<Myths />} />
          <Route path="ressources" element={<Resources />} />
          <Route path="profil" element={<Profile />} />
          <Route path="classement" element={<Leaderboard />} />
        </Route>

        <Route path="/accueil" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
