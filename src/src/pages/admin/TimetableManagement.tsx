import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  adminTimetableService,
  AdminTimetable,
  AdminSubjectForTimetable,
  AdminTeacher,
  TimetableCreatePayload
} from '../../services/adminTimetableService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, X } from 'lucide-react';



const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];
const gradeOptions = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

interface SelectedSlot {
  day: string;
  time: string;
}

interface FormState {
  grade: string;
  teacher_name: string;
  classroom: string;
}

export function TimetableManagement() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [timetables, setTimetables] = useState<AdminTimetable[]>([]);
  const [subjects, setSubjects] = useState<AdminSubjectForTimetable[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [formState, setFormState] = useState<FormState>({
    grade: '',
    teacher_name: '',
    classroom: ''
  });

  const normalizedSelectedGrade = formState.grade.trim().toLowerCase();
  const filteredSubjects = subjects.filter((s) => {
    if (!normalizedSelectedGrade) return true;
    const subjectGrade = s.grade?.trim().toLowerCase() ?? '';
    return subjectGrade === normalizedSelectedGrade || subjectGrade.split('-').map((part) => part.trim()).includes(normalizedSelectedGrade);
  });

  const getSubjectTeacher = (subject_id: number) => {
    const subject = subjects.find((s) => s.id === subject_id);
    if (!subject || !subject.teacher_id) return null;
    const teacher = teachers.find((t) => t.id === subject.teacher_id);
    return teacher ? teacher.user.full_name : null;
  };

  const getTimetableClass = (day: string, time: string) => {
    return timetables.find(
      (t) =>
        t.day === day &&
        t.start_time.substring(0, 5) === time
    );
  };

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [timetablesData, subjectsData, teachersData] = await Promise.all([
        adminTimetableService.listTimetables(token),
        adminTimetableService.listSubjects(token),
        adminTimetableService.listTeachers(token)
      ]);
      setTimetables(timetablesData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load timetable data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const handleSlotClick = (day: string, time: string) => {
    const existing = getTimetableClass(day, time);
    if (existing) {
      toast.info('This slot already has a class assigned');
      return;
    }
    setSelectedSlot({ day, time });
    setFormState({ grade: '', teacher_name: '', classroom: '' });
    setShowAddForm(true);
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selectedSlot) {
      toast.error('Session error or no slot selected');
      return;
    }

    if (!formState.grade || !formState.teacher_name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const teacherName = formState.teacher_name.trim().toLowerCase();
    let matchingTeacher = teachers.find(
      (teacher) => teacher.user.full_name.toLowerCase() === teacherName
    );
    if (!matchingTeacher) {
      matchingTeacher = teachers.find((teacher) =>
        teacher.user.full_name.toLowerCase().includes(teacherName) ||
        teacherName.includes(teacher.user.full_name.toLowerCase())
      );
    }

    if (!matchingTeacher) {
      toast.error('No teacher found with that name');
      return;
    }

    let matchingSubject = filteredSubjects.find((subject) => subject.teacher_id === matchingTeacher!.id);
    if (!matchingSubject) {
      matchingSubject = subjects.find((subject) => subject.teacher_id === matchingTeacher!.id);
    }

    if (!matchingSubject) {
      toast.error('No subject is currently assigned to that teacher');
      return;
    }

    setIsSubmitting(true);

    try {
      const endTime = `${(parseInt(selectedSlot.time) + 1).toString().padStart(2, '0')}:00`;
      const payload: TimetableCreatePayload = {
        subject_id: matchingSubject.id,
        day: selectedSlot.day,
        start_time: selectedSlot.time,
        end_time: endTime,
        classroom: formState.classroom || undefined
      };

      await adminTimetableService.createTimetable(token, payload);
      toast.success('Class added to timetable');
      setShowAddForm(false);
      setSelectedSlot(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Could not add class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setSelectedSlot(null);
    setFormState({ grade: '', teacher_name: '', classroom: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fedora mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-tuatara">Timetable Management</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-tuatara">Weekly Timetable</h2>
          <p className="text-sm text-fedora">Click on a time slot to add a class</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-96 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-50 p-2 text-left text-sm font-semibold text-tuatara">
                      Time
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="border border-slate-200 bg-slate-50 p-2 text-center text-sm font-semibold text-tuatara"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => (
                    <tr key={time}>
                      <td className="border border-slate-200 bg-slate-50 p-2 text-sm font-medium text-tuatara">
                        {time}
                      </td>
                      {DAYS.map((day) => {
                        const timetableClass = getTimetableClass(day, time);
                        const subject = timetableClass
                          ? subjects.find((s) => s.id === timetableClass.subject_id)
                          : null;
                        return (
                          <td
                            key={`${day}-${time}`}
                            onClick={() => !timetableClass && handleSlotClick(day, time)}
                            className={`border border-slate-200 p-2 text-center text-sm cursor-pointer transition-colors ${
                              timetableClass
                                ? 'bg-indigo-100'
                                : 'bg-white hover:bg-slate-100'
                            }`}
                          >
                            {timetableClass && subject ? (
                              <div className="text-left">
                                <p className="font-medium text-indigo-900">{subject.name}</p>
                                <p className="text-xs text-indigo-700">
                                  {getSubjectTeacher(timetableClass.subject_id)}
                                </p>
                                {timetableClass.classroom && (
                                  <p className="text-xs text-indigo-600">{timetableClass.classroom}</p>
                                )}
                              </div>
                            ) : (
                              <Plus className="h-4 w-4 mx-auto text-slate-300" />
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

      {showAddForm && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-tuatara">
                  Add Class to Timetable
                </h2>
                <p className="text-sm text-fedora">
                  {selectedSlot.day} at {selectedSlot.time}
                </p>
              </div>
              <button
                onClick={closeForm}
                title="Close"
                className="rounded-full p-2 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <form className="space-y-6 p-6" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-tuatara">Grade *</span>
                <select
                  value={formState.grade}
                  onChange={(e) => {
                    handleInputChange('grade', e.target.value);
                    handleInputChange('teacher_name', '');
                  }}
                  className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select grade</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-tuatara">Teacher Name *</span>
                <Input
                  value={formState.teacher_name}
                  onChange={(e) => handleInputChange('teacher_name', e.target.value)}
                  placeholder="Enter full teacher name"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Enter the teacher assigned to the selected grade. The timetable will use the subject taught by that teacher.
                </p>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-tuatara">Classroom</span>
                <Input
                  value={formState.classroom}
                  onChange={(e) => handleInputChange('classroom', e.target.value)}
                  placeholder="e.g., Room 101"
                />
              </label>
              <div className="flex gap-3 border-t border-slate-200 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  Add Class
                </Button>
                <Button variant="secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
