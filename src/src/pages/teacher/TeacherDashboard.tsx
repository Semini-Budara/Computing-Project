import React, { Children, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { teacherProfileService } from '../../services/teacherProfileService';
import { teacherTimetableService } from '../../services/teacherTimetableService';
import { notificationsService } from '../../services/notificationsService';
import { StatCard } from '../../components/ui/StatCard';
import '../../styles/teacher-brand.css';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
export function TeacherDashboard() {
  const token = useAuthStore((s) => s.token);
  const [profile, setProfile] = useState<any | null>(null);
  const [classes, setClasses] = useState<Array<{ grade?: string | null }>>([]);
  const [students, setStudents] = useState<Array<{ grade?: string | null }>>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  const uniqueGrades = useMemo<string[]>(() => {
    return Array.from(
      classes.reduce((acc, c) => acc.add((c.grade || 'Ungraded') as string), new Set<string>())
    );
  }, [classes]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) return;
        const [p, cls, sts, tt, nts] = await Promise.all([
          teacherProfileService.getProfile(token),
          teacherProfileService.getClasses(token),
          teacherProfileService.getStudents(token),
          teacherTimetableService.listTimetable(token),
          notificationsService.listTeacherNotifications(token)
        ]);
        setProfile(p.teacher ? { ...p.teacher, user: p.user } : p);
        setClasses(cls || []);
        setStudents(sts || []);
        setTimetable(tt || []);
        setNotes(nts || []);
      } catch (err) {
        // ignore load errors for now
      }
    };
    load();
  }, [token]);
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  return (
    <div className="space-y-8">
      {/* Header Card */}
      <motion.div
        initial={{
          opacity: 0,
          y: -20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="bg-gradient-to-r from-primary to-tuatara rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        
        <div className="absolute right-0 top-0 w-64 h-64 bg-scarlet rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.user?.full_name || profile?.full_name || 'Teacher'}</h1>
          <p className="text-fedora flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> {profile?.qualifications || profile?.subjects_taught || ''}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <motion.div variants={item}>
          <StatCard title="Total Students" value={students ? `${students.length}` : '—'} icon={Users} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Classes Today"
            value={useMemo(() => {
              try {
                const today = new Date();
                const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                const todayName = days[today.getDay()];
                return timetable ? `${timetable.filter((t) => (t.day || '').toLowerCase() === todayName.toLowerCase()).length}` : '0';
              } catch {
                return '0';
              }
            }, [timetable])}
            icon={Calendar} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Subjects Count" value={classes ? `${classes.length}` : '—'} icon={BookOpen} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grades Section */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-tuatara">Assigned Grades</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {uniqueGrades.map((grade, i) => (
              <motion.div key={`${grade}-${i}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="cursor-pointer group hover:border-scarlet transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-tuatara mb-1 group-hover:text-scarlet transition-colors">Grade {grade}</h4>
                      <p className="text-sm text-fedora flex items-center gap-1">
                        <Users className="h-4 w-4" /> {students.filter((s) => s.grade === grade).length} Students
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-concrete group-hover:bg-scarlet/10 flex items-center justify-center transition-colors">
                      <ChevronRight className="h-5 w-5 text-fedora group-hover:text-scarlet transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-tuatara">Today's Schedule</h3>
          <div className="relative border-l-2 border-fedora/20 ml-3 space-y-8 pb-4">
            {(() => {
              try {
                const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                const todayName = days[new Date().getDay()];
                const todaySlots = (timetable || []).filter((t) => (t.day || '').toLowerCase() === todayName.toLowerCase()).sort((a,b) => (a.start_time || '').localeCompare(b.start_time || ''));
                if (todaySlots.length === 0) {
                  return <div className="px-4 py-6 text-fedora">No classes scheduled for today</div>;
                }
                return todaySlots.map((slot: any, i: number) => {
                  // determine status by time
                  let status = 'upcoming';
                  try {
                    const now = new Date();
                    const [sh, sm] = (slot.start_time || '00:00').split(':').map((x: string) => parseInt(x, 10));
                    const [eh, em] = (slot.end_time || slot.start_time || '00:00').split(':').map((x: string) => parseInt(x, 10));
                    const sdt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), isNaN(sh) ? 0 : sh, isNaN(sm) ? 0 : sm);
                    const edt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), isNaN(eh) ? sdt.getHours() : eh, isNaN(em) ? sdt.getMinutes() : em);
                    if (edt.getTime() < now.getTime()) status = 'completed';
                    else if (sdt.getTime() <= now.getTime() && now.getTime() <= edt.getTime()) status = 'current';
                    else status = 'upcoming';
                  } catch {
                    status = 'upcoming';
                  }
                  const timeLabel = slot.start_time ? slot.start_time : '';
                  const title = slot.subject?.name ? `${slot.subject?.grade ? 'Grade ' + slot.subject.grade + ' ' : ''}${slot.subject.name}` : slot.title || 'Class';
                  const typeLabel = slot.classroom || slot.type || 'Class';
                  return (
                    <div key={slot.id ?? i} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${status === 'completed' ? 'bg-fedora' : status === 'current' ? 'bg-scarlet animate-pulse' : 'bg-concrete border-fedora'}`} />
                      <div className="mb-1">
                        <span className={`text-sm font-semibold ${status === 'current' ? 'text-scarlet' : 'text-tuatara'}`}>{timeLabel}</span>
                      </div>
                      <Card className={`${status === 'current' ? 'border-scarlet/50 shadow-sm' : ''}`}>
                        <CardContent className="p-4">
                          <h5 className="font-medium text-tuatara text-sm mb-2">{title}</h5>
                          <Badge variant="outline" className="text-[10px]">{typeLabel}</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  );
                });
              } catch {
                return <div className="px-4 py-6 text-fedora">No classes scheduled for today</div>;
              }
            })()}
          </div>
        </div>
      </div>
    </div>);

}