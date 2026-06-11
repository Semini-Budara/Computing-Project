import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  FileCheck,
  DollarSign,
  Bell,
  BookPlus
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { adminStudentService } from '../../services/adminStudentService';
import { adminTeacherService } from '../../services/adminTeacherService';
import { adminEnrollmentService } from '../../services/adminEnrollmentService';
import { adminNotificationService } from '../../services/adminNotificationService';
export function AdminDashboard() {
  const token = useAuthStore((state) => state.token);

  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [totalTeachers, setTotalTeachers] = useState<number | null>(null);
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [revenueThisMonth, setRevenueThisMonth] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Students (returns total + list)
        const studentsResp = await adminStudentService.listStudents(token ?? '', 1, 10);
        setTotalStudents(studentsResp.total ?? studentsResp.students.length ?? 0);

        // Teachers (no total in response) — fetch a reasonable page size
        const teachers = await adminTeacherService.listTeachers(token ?? '', 1, 100);
        setTotalTeachers(teachers.length);

        // Pending enrollments
        const pending = await adminEnrollmentService.listPendingEnrollments(token ?? '');
        setPendingEnrollments(pending || []);

        // Notifications (use as recent activity)
        const notes = await adminNotificationService.listNotifications(token ?? '');
        setNotifications(notes || []);

        // Payments -> revenue this month
        try {
          const rawApiBase = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000';
          const API_BASE = rawApiBase.startsWith('http') ? rawApiBase.replace(/\/$/, '') : `http://${rawApiBase.replace(/\/$/, '')}`;
          const resp = await fetch(`${API_BASE}/admin/payments`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          });

          if (!resp.ok) {
            console.warn('AdminDashboard payments fetch failed', resp.status, resp.statusText);
            setRevenueThisMonth(0);
          } else {
            const payments = await resp.json();
            const now = new Date();
            const monthSum = (payments || []).reduce((acc: number, p: any) => {
              try {
                const d = p.created_at ? new Date(p.created_at) : p.payment_date ? new Date(p.payment_date) : null;
                if (!d) return acc;
                if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
                  return acc + (Number(p.amount) || 0);
                }
                return acc;
              } catch {
                return acc;
              }
            }, 0);
            setRevenueThisMonth(monthSum);
          }
        } catch (error: any) {
          console.warn('AdminDashboard payments request failed:', error);
          setRevenueThisMonth(0);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load admin dashboard data');
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
  const handleQuickAction = (action: string) => {
    toast.info(`${action} module coming soon`);
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-tuatara mb-1">
            Admin Control Center
          </h1>
          <p className="text-fedora">System overview and quick actions</p>
        </div>
        <div className="flex gap-2">
          {/* <Button onClick={() => navigate('/admin/students')}>
            <UserPlus className="h-4 w-4 mr-2" /> Add Student
          </Button> */}
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <motion.div variants={item}>
          <StatCard
            title="Total Students"
            value={totalStudents !== null ? `${totalStudents}` : '—'}
            icon={Users}
            trend={{
              value: 0,
              isPositive: true
            }} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Total Teachers"
            value={totalTeachers !== null ? `${totalTeachers}` : '—'}
            icon={GraduationCap}
            trend={{ value: 0, isPositive: true }} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Pending Enrollments" value={pendingEnrollments ? `${pendingEnrollments.length}` : '0'} icon={FileCheck} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Revenue This Month"
            value={revenueThisMonth !== null ? `$${revenueThisMonth.toLocaleString()}` : '—'}
            icon={DollarSign}
            trend={{ value: 0, isPositive: true }} />
        </motion.div>
      </motion.div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
        {
          title: 'Add Teacher',
          icon: GraduationCap,
          action: 'Add Teacher'
        },
        {
          title: 'Add Subject',
          icon: BookPlus,
          action: 'Add Subject'
        },
        {
          title: 'Send Notice',
          icon: Bell,
          action: 'Send Notification'
        },
        {
          title: 'View Reports',
          icon: FileCheck,
          action: 'Reports'
        }].
        map((btn, i) =>
        <Button
          key={i}
          variant="outline"
          className="h-24 flex-col gap-2 hover:border-scarlet hover:text-scarlet transition-all"
          onClick={() => handleQuickAction(btn.action)}>
          
            <btn.icon className="h-6 w-6" />
            {btn.title}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Enrollments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Pending Enrollment Requests</CardTitle>
              <Button variant="link" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-fedora uppercase bg-concrete/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Student</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingEnrollments && pendingEnrollments.length > 0 ? (
                      pendingEnrollments.map((req: any) => (
                        <tr key={req.id} className="border-b border-fedora/10 last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar fallback={req.student?.user?.full_name?.charAt(0) ?? 'U'} className="h-8 w-8" />
                              <div>
                                <p className="font-medium text-tuatara">{req.student?.user?.full_name || req.student?.user?.username || 'Unknown'}</p>
                                <p className="text-xs text-fedora">{req.subject?.grade || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-tuatara">{req.subject?.name || '—'}</td>
                          <td className="px-4 py-3 text-fedora">{req.created_at ? new Date(req.created_at).toLocaleString() : '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Approve</Button>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">Reject</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-fedora">No pending enrollment requests</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 6).map((n: any) => (
                    <div key={n.id} className="flex gap-4">
                      <div className="relative mt-1">
                        <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-fedora/20 -z-10 h-full"></div>
                        <div className="h-2 w-2 rounded-full bg-scarlet ring-4 ring-white"></div>
                      </div>
                      <div>
                        <p className="text-sm text-tuatara">
                          <span className="font-medium">{n.title}</span>{' '}
                          <span className="text-fedora">{n.message}</span>
                        </p>
                        <p className="text-xs text-fedora mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-fedora">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

}