import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { studentSubjectService, StudentSubject } from '../../services/studentSubjectService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

export function StudentSubjects() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<StudentSubject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSubjects = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [enrolledSubjects, allSubjects] = await Promise.all([
        studentSubjectService.listEnrolledSubjects(token),
        studentSubjectService.listAvailableSubjects(token)
      ]);
      setSubjects(enrolledSubjects);
      const enrolledIds = new Set(enrolledSubjects.map((subject) => subject.id));
      setAvailableSubjects(allSubjects.filter((subject) => !enrolledIds.has(subject.id)));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSubjects();
  }, [token]);

  const handleSubjectClick = (subject: StudentSubject) => {
    if (!token) return;
    if (!subject.teacher_id) {
      toast.error('This subject has no assigned teacher');
      return;
    }

    navigate(`/student/teachers?teacherId=${subject.teacher_id}`);
  };

  const handleEnrollClick = (subject: StudentSubject) => {
    if (!token) return;
    if (!subject.teacher_id) {
      toast.error('This subject has no assigned teacher');
      return;
    }

    navigate(`/student/teachers?teacherId=${subject.teacher_id}&subjectId=${subject.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-gradient-to-r from-scarlet via-red-500 to-red-700 p-8 text-white shadow-xl overflow-hidden">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-red-100/80">Subject Explorer</p>
            <h1 className="text-4xl font-bold">My Subjects</h1>
          </div>
          {/* <Button variant="secondary" className="mt-4 sm:mt-0" onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </Button> */}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-red-100/90">
          Browse your current subjects and discover new classes with bright, friendly cards.
        </p>
      </div>

      <Card className="rounded-[1.75rem] border border-red-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-red-50 p-6">
          <div>
            <h2 className="text-lg font-semibold text-tuatara">Enrolled Subjects</h2>
            <p className="text-sm text-fedora">Tap a subject to meet its teacher.</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-72 w-full" />
            </div>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-slate-600">You are not enrolled in any subjects yet.</p>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject)}
                  className="w-full rounded-[1.75rem] border border-red-100 bg-white p-5 text-left transition hover:border-scarlet/40 hover:bg-red-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-tuatara">{subject.name}</h3>
                      <p className="text-sm text-fedora">{subject.grade ?? 'Grade not assigned'}</p>
                    </div>
                    <span className="text-sm font-semibold text-scarlet">View Teacher</span>
                  </div>
                  {subject.description && (
                    <p className="mt-3 text-sm text-fedora">{subject.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold text-tuatara">All Subjects</h2>
            <p className="text-sm text-fedora">Browse all subjects and enroll in additional coursework.</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-72 w-full" />
            </div>
          ) : availableSubjects.length === 0 ? (
            <p className="text-sm text-fedora">No additional subjects are available at this time.</p>
          ) : (
            <div className="space-y-4">
              {availableSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="w-full rounded-[1.75rem] border border-red-100 bg-white p-5 shadow-sm transition hover:border-scarlet/40 hover:bg-red-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-tuatara">{subject.name}</h3>
                      <p className="text-sm text-fedora">{subject.grade ?? 'Grade not assigned'}</p>
                      {subject.description && (
                        <p className="mt-2 text-sm text-fedora">{subject.description}</p>
                      )}
                      <p className="mt-3 text-sm text-fedora">
                        Fee: <span className="font-medium text-tuatara">${subject.monthly_fee?.toFixed(2) ?? '0.00'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="secondary" onClick={() => handleEnrollClick(subject)}>
                        Enroll
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
