import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  CreditCard,
  Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { studentProfileService, StudentProfileData, StudentResult, StudentPayment, StudentAttendance, EnrolledSubject } from '../../services/studentProfileService';
import { studentTimetableService, StudentTimetableEntry } from '../../services/studentTimetableService';
import { notificationsService, NotificationPayload } from '../../services/notificationsService';
import { StatCard } from '../../components/ui/StatCard';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function StudentDashboard() {
  const token = useAuthStore((state) => state.token);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [subjects, setSubjects] = useState<EnrolledSubject[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [timetable, setTimetable] = useState<StudentTimetableEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [profileData, subjectsData, attendanceData, resultsData, paymentsData, timetableData, notificationsData] = await Promise.all([
          studentProfileService.getProfile(token),
          studentProfileService.getEnrolledSubjects(token),
          studentProfileService.getAttendance(token),
          studentProfileService.getResults(token),
          studentProfileService.getPayments(token),
          studentTimetableService.listTimetable(token),
          notificationsService.listStudentNotifications(token)
        ]);

        setProfile(profileData);
        setSubjects(subjectsData);
        setAttendance(attendanceData);
        setResults(resultsData);
        setPayments(paymentsData);
        setTimetable(timetableData);
        setNotifications(notificationsData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [token]);

  const todayName = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  }, []);

  const todaysClasses = useMemo(() => {
    return timetable.filter((entry) => entry.day?.toLowerCase() === todayName.toLowerCase()).slice(0, 3);
  }, [timetable, todayName]);

  const attendanceAverage = useMemo(() => {
    if (attendance.length === 0) {
      return 0;
    }
    return Math.round(attendance.reduce((sum, item) => sum + item.attendance_percentage, 0) / attendance.length);
  }, [attendance]);

  const pendingPayments = useMemo(() => payments.filter((payment) => payment.status === 'pending').length, [payments]);

  const latestResults = useMemo(() => results.slice(0, 3), [results]);

  const latestNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  }, [notifications]);

  const firstName = profile?.user.full_name?.split(' ')[0] || profile?.user.username || 'Student';

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-lg">
          <p className="text-lg font-semibold text-tuatara">Unable to load your dashboard.</p>
          <p className="mt-2 text-slate-600">Please sign in again or contact support.</p>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-scarlet via-red-500 to-red-700 rounded-[2rem] p-8 text-white shadow-[0_30px_60px_-30px_rgba(247,39,10,0.8)] relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.4em] text-red-100 mb-4">Student Portal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Hi {firstName} — ready for a bright day?
          </h1>
          <p className="max-w-2xl text-sm text-red-100/90">
            Your dashboard is now driven from your student records in real time.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-red-100/90">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">Grade {profile.student.grade ?? 'N/A'}</span>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">{profile.student.school ?? 'Campus'}</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <StatCard title="Enrolled Subjects" value={`${subjects.length}`} icon={BookOpen} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Attendance" value={`${attendanceAverage}%`} icon={CheckCircle} trend={{ value: attendanceAverage, isPositive: attendanceAverage >= 75 }} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Today's Classes" value={`${todaysClasses.length}`} icon={Calendar} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Pending Payments" value={`${pendingPayments}`} icon={CreditCard} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-tuatara">Today's Classes</h3>
              <p className="text-sm text-fedora">Based on your live timetable for {todayName}.</p>
            </div>
          </div>

          <div className="grid gap-4">
            {todaysClasses.length === 0 ? (
              <Card className="rounded-[1.5rem] border border-slate-200 bg-white shadow-lg p-8">
                <p className="text-slate-600">No classes scheduled for today.</p>
              </Card>
            ) : todaysClasses.map((entry) => (
              <Card key={entry.id} className="hover:border-scarlet/40 transition-colors rounded-[1.5rem] border border-slate-200 bg-white shadow-lg">
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-3xl bg-scarlet/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-scarlet" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-tuatara text-lg">{entry.subject?.name ?? 'Class session'}</h4>
                      <p className="text-sm text-fedora">
                        {entry.subject?.grade ? `Grade ${entry.subject.grade}` : 'Subject details unavailable'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm font-semibold text-scarlet mb-1 justify-end">
                      <Clock className="h-4 w-4" />
                      {entry.start_time} - {entry.end_time}
                    </div>
                    <Badge variant="secondary" className="bg-scarlet/10 text-scarlet border-scarlet/20">
                      {entry.classroom ?? 'No room'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[1.75rem] border border-slate-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestNotifications.length === 0 ? (
                <p className="text-slate-600">No notifications at the moment.</p>
              ) : latestNotifications.map((notif) => (
                <div key={notif.id} className="pb-4 border-b border-fedora/10 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={notif.category === 'payment' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {notif.category ?? 'Update'}
                    </Badge>
                    <span className="text-xs text-fedora">{new Date(notif.created_at).toLocaleDateString()}</span>
                  </div>
                  <h5 className="font-medium text-sm text-tuatara mb-1">{notif.title}</h5>
                  <p className="text-xs text-fedora line-clamp-2">{notif.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-slate-200 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestResults.length === 0 ? (
                  <p className="text-slate-600">No results available yet.</p>
                ) : latestResults.map((res) => (
                  <div key={res.subject_id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-gradient-to-r from-red-50 to-white border border-red-100 shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-tuatara">{res.subject_name}</p>
                      <p className="text-xs text-fedora">Grade: {res.grade}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-scarlet text-white flex items-center justify-center font-bold shadow-sm">
                      {res.grade}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
