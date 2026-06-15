import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
const roles = [
{
  id: 'student',
  title: 'Student',
  icon: GraduationCap,
  desc: 'Access your classes, timetable, and results.'
},
{
  id: 'teacher',
  title: 'Teacher',
  icon: Users,
  desc: 'Manage your classes, students, and schedule.'
},
{
  id: 'admin',
  title: 'Admin',
  icon: Shield,
  desc: 'Full system control and management.'
}];

export function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(247,39,10,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(124,116,124,0.12),_transparent_25%),linear-gradient(180deg,_#fff8f7_0%,_#fff1ef_40%,_#fdf2f0_100%)] flex items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_22%),radial-gradient(circle_at_right,_rgba(247,39,10,0.16),_transparent_18%)]" />
      <div className="relative w-full max-w-6xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center p-8 lg:p-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-scarlet/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-scarlet">
                ACME Institute
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-tuatara">
                  Welcome to the future of school management
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                  A modern, beautiful system for students, teachers, and administrators — powered by ACME’s new learning experience.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* <button
                  type="button"
                  onClick={() => navigate('/login?role=student')}
                  className="inline-flex items-center justify-center rounded-full bg-scarlet px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-scarlet/20 transition hover:bg-[#e11f00]"
                >
                  Student login
                </button> */}
                {/* <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center rounded-full border border-scarlet/20 bg-white px-6 py-3 text-sm font-semibold text-scarlet transition hover:border-scarlet hover:bg-scarlet/10"
                >
                  Explore roles
                </button> */}
              </div>
            </div>

            <div className="hidden lg:block">
              <img src="/ACME_logo.png" alt="ACME Institute logo" className="mx-auto h-56 w-56 rounded-3xl border-4 border-white bg-white/80 p-4 shadow-2xl shadow-scarlet/10" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => navigate(`/login?role=${role.id}`)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(247,39,10,0.14)]"
            >
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-scarlet via-[#ff6f50] to-[#ffb3a2]" />
              <div className="relative p-8 text-left">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-scarlet/10 text-scarlet mb-6 transition group-hover:bg-scarlet group-hover:text-white">
                  <role.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-tuatara mb-2 group-hover:text-scarlet">
                  {role.title}
                </h3>
                <p className="text-sm leading-7 text-slate-600 mb-6">
                  {role.desc}
                </p>
                <span className="inline-flex items-center rounded-full border border-scarlet/15 bg-scarlet/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-scarlet">
                  {role.id === 'student' ? 'Student portal' : role.id === 'teacher' ? 'Faculty portal' : 'Admin portal'}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
