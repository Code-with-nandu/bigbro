/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import ScrollProgressBar from './components/ScrollProgressBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyWeExist from './components/WhyWeExist';
import ProblemsAndPillars from './components/ProblemsAndPillars';
import OurFirst13 from './components/OurFirst13';
import JourneySection from './components/JourneySection';
import FundSection from './components/FundSection';
import UpiPaymentSection from './components/UpiPaymentSection';
import BecomeBigBrother from './components/BecomeBigBrother';
import Footer from './components/Footer';
import StudentDetailModal from './components/StudentDetailModal';
import JoinModal from './components/JoinModal';
import AdminDashboard from './components/AdminDashboard';
import DevelopmentHistoryPage from './components/DevelopmentHistoryPage';
import CodersDiaryPage from './components/CodersDiaryPage';
import UnifiedAuth from './components/UnifiedAuth';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserPages from './components/UserPages';
import AuthUtilityBar from './components/AuthUtilityBar';
import HealthcareKnowledge from './components/HealthcareKnowledge';
import { STUDENTS_DATA } from './data/mockData';
import { Student } from './types';

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, '');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinRole, setJoinRole] = useState<string>('mentor');
  const [joinAmount, setJoinAmount] = useState<number | undefined>(undefined);

  const handleOpenJoinModal = (role = 'mentor', prefillAmount?: number) => {
    setJoinRole(role);
    setJoinAmount(prefillAmount);
    setJoinModalOpen(true);
  };

  const handleSelectStudentById = (id: number) => {
    const student = STUDENTS_DATA.find((s) => s.id === id);
    if (student) {
      setSelectedStudent(student);
    }
  };

  if (pathname === '/login') {
    return <><AuthUtilityBar /><UnifiedAuth initialMode="login" /></>;
  }

  if (pathname === '/signup') {
    return <><AuthUtilityBar /><UnifiedAuth initialMode="signup" /></>;
  }

  const protectedPaths = ['/dashboard', '/register-problem', '/my-problems', '/profile', '/notifications'];
  if (protectedPaths.includes(pathname)) {
    return (
      <>
        <AuthUtilityBar />
        <ProtectedRoute>
          {(session) => pathname === '/dashboard'
            ? <Dashboard session={session} />
            : <UserPages pathname={pathname} session={session} />}
        </ProtectedRoute>
      </>
    );
  }

  if (pathname === '/admin') {
    return <AdminDashboard />;
  }

  if (pathname === '/development-history') {
    return (
      <div className="min-h-screen bg-[#050508] text-white selection:bg-amber-500/30 selection:text-amber-200 font-sans antialiased overflow-x-hidden">
        <AuthUtilityBar />
        <Navbar onOpenJoinModal={handleOpenJoinModal} />
        <DevelopmentHistoryPage />
        <Footer />
        <JoinModal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          defaultRole={joinRole}
          defaultAmount={joinAmount}
        />
      </div>
    );
  }

  if (pathname === '/coders-diary') {
    return (
      <div className="min-h-screen bg-[#050508] text-white selection:bg-amber-500/30 selection:text-amber-200 font-sans antialiased overflow-x-hidden">
        <AuthUtilityBar />
        <Navbar onOpenJoinModal={handleOpenJoinModal} />
        <CodersDiaryPage />
        <Footer />
        <JoinModal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          defaultRole={joinRole}
          defaultAmount={joinAmount}
        />
      </div>
    );
  }

  if (pathname === '/healthcare') {
    return (
      <div className="min-h-screen bg-[#050508] text-white selection:bg-amber-500/30 selection:text-amber-200 font-sans antialiased overflow-x-hidden">
        <AuthUtilityBar />
        <Navbar onOpenJoinModal={handleOpenJoinModal} />
        <HealthcareKnowledge />
        <Footer />
        <JoinModal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          defaultRole={joinRole}
          defaultAmount={joinAmount}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-amber-500/30 selection:text-amber-200 font-sans antialiased overflow-x-hidden">
      {/* Subtle Viewport Journey Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Precision Top Bar Navigation */}
      <AuthUtilityBar />
      <Navbar onOpenJoinModal={handleOpenJoinModal} />

      {/* Hero with 3D Depth Interactive Constellation */}
      <Hero
        onOpenJoinModal={handleOpenJoinModal}
        onSelectStudent={handleSelectStudentById}
      />

      {/* 01. Why We Exist */}
      <WhyWeExist />

      {/* 02 & 03. Five Problems & Five Pillars */}
      <ProblemsAndPillars />

      {/* 04. Our First 15 (Pilot Cohort) */}
      <OurFirst13 onSelectStudent={(student) => setSelectedStudent(student)} />

      {/* 05. Big Bro Journey */}
      <JourneySection />

      {/* 06. Big Bro Common Fund (₹10,000/mo for all 15 students - May 13 / Mai Tera) */}
      <FundSection onOpenJoinModal={handleOpenJoinModal} />

      {/* 07. Direct UPI Payment / Contribution Section */}
      <UpiPaymentSection />

      {/* 08. Become a Big Bro (Mai Tera) */}
      <BecomeBigBrother onOpenJoinModal={handleOpenJoinModal} />

      {/* Footer */}
      <Footer />

      {/* Trainee Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Interactive Join / Pledge Modal */}
      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        defaultRole={joinRole}
        defaultAmount={joinAmount}
      />
    </div>
  );
}
