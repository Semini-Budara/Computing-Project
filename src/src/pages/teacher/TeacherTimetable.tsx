import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { teacherTimetableService, TeacherTimetableEntry } from '../../services/teacherTimetableService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Eye } from 'lucide-react';
import '../../styles/teacher-brand.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];

export function TeacherTimetable() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [timetables, setTimetables] = useState<TeacherTimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTimetableEntry = (day: string, time: string) => {
    return timetables.find(
      (entry) => entry.day === day && entry.start_time.substring(0, 5) === time
    );
  };

  const loadTimetable = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await teacherTimetableService.listTimetable(token);
      setTimetables(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load timetable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTimetable();
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 font-semibold mb-2">Teacher</p>
          <h1 className="text-3xl font-bold text-slate-900">My Timetable</h1>
          <p className="text-sm text-slate-600 mt-1">View your assigned teaching schedule for the week.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/teacher/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="border-b border-fedora/20 bg-gradient-to-r from-primary/10 to-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Weekly Timetable</h2>
              {/* The timetable is working for teachers, but it is not displaying in the student vie */}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 border border-slate-200">
              {/* <Eye className="h-4 w-4 text-red-600" /> */}
              {/* <span className="text-sm font-medium text-slate-700">Read-only</span> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
            </div>
          ) : timetables.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-center">
              <div>
                <p className="text-lg font-semibold text-slate-900">No timetable entries yet</p>
                <p className="text-sm text-slate-600 mt-1">Your schedule will appear here when the admin adds timetable entries for your classes.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-900 p-3 text-left text-sm font-semibold text-white">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="border border-slate-200 bg-slate-900 p-3 text-center text-sm font-semibold text-white">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => (
                    <tr key={time}>
                      <td className="border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900">{time}</td>
                      {DAYS.map((day) => {
                        const entry = getTimetableEntry(day, time);
                        return (
                          <td
                            key={`${day}-${time}`}
                            className={`border border-slate-200 p-3 text-center text-sm transition-colors ${
                              entry ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            {entry ? (
                              <div className="text-left">
                                <p className="font-semibold text-primary truncate">{entry.subject?.name ?? 'Class'}</p>
                                <p className="text-xs text-slate-600 mt-1 truncate">{entry.subject?.grade ?? 'Grade TBD'}</p>
                                <p className="text-xs text-slate-500 mt-1">{entry.classroom ?? 'Classroom TBD'}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                                </p>
                              </div>
                            ) : (
                              <span className="text-fedora text-sm">Free</span>
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
    </div>
  );
}
