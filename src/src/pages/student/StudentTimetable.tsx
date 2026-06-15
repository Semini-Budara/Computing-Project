import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { studentTimetableService, StudentTimetableEntry } from '../../services/studentTimetableService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Eye } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function StudentTimetable() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [timetables, setTimetables] = useState<StudentTimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTimetableClass = (day: string, time: string) => {
    return timetables.find(
      (t) => t.day === day && t.start_time.substring(0, 5) === time
    );
  };

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await studentTimetableService.listTimetable(token);
      setTimetables(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load timetable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-gradient-to-r from-scarlet via-red-500 to-red-700 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-orange-200/30 blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.36em] text-red-100/90">Student Timetable</p>
            <h1 className="text-4xl font-bold">Your week of learning</h1>
          </div>
          <p className="max-w-2xl text-sm text-red-100/90">
            See your class schedule at a glance and plan your day with bright, easy-to-read cards.
          </p>
          {/* <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </Button> */}
        </div>
      </div>

      <Card className="border border-slate-200 shadow-md overflow-hidden">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-red-50 to-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-tuatara">Weekly Timetable</h2>
              {/* <p className="text-sm text-fedora mt-1">Your approved class schedule, updated automatically.</p> */}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm border border-red-100">
              {/* <Eye className="h-4 w-4" /> Read-only view */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-96 w-full" />
            </div>
          ) : timetables.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-center">
              <div>
                <p className="text-lg font-semibold text-slate-900">No timetable available</p>
                <p className="text-sm text-slate-600 mt-1">Check back later or enroll in subjects to see your schedule</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-scarlet text-white p-3 text-left text-sm font-semibold">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="border border-slate-200 bg-red-600 p-3 text-center text-sm font-semibold text-white">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => (
                    <tr key={time}>
                      <td className="border border-slate-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{time}</td>
                      {DAYS.map((day) => {
                        const timetableClass = getTimetableClass(day, time);
                        const subjectName = timetableClass?.subject?.name ?? 'Free';
                        return (
                          <td
                            key={`${day}-${time}`}
                            className={`border border-slate-200 p-3 text-center text-sm transition-colors ${
                              timetableClass
                                ? 'bg-red-50 hover:bg-red-100'
                                : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            {timetableClass ? (
                              <div className="text-left">
                                <p className="font-semibold text-red-700">{subjectName}</p>
                                <p className="text-xs text-slate-600 mt-1">
                                  {timetableClass.classroom ?? 'Classroom TBD'}
                                </p>
                                {timetableClass.end_time && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    {timetableClass.start_time.substring(0, 5)} - {timetableClass.end_time.substring(0, 5)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">Free</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
          {/* <h3 className="text-lg font-semibold text-slate-900">Legend</h3> */}
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              {/* <div className="h-12 w-12 flex-shrink-0 rounded bg-red-50 border border-red-200"></div>
              <div>
                <p className="font-medium text-slate-900">Scheduled Class</p>
                <p className="text-sm text-slate-600">Your enrolled subjects</p>
              </div> */}
            </div>
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 flex-shrink-0 rounded bg-white border border-slate-200"></div>
              <div>
                {/* <p className="font-medium text-slate-900">Free Period</p>
                <p className="text-sm text-slate-600">No scheduled classes</p> */}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-full flex items-center gap-2">
                {/* <p className="text-sm text-slate-600">This timetable is <span className="font-semibold text-red-600">read-only</span> and automatically reflects your approved enrollments.</p> */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
