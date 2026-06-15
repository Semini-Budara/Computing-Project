import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { teacherProfileService, TeacherStudent } from '../../services/teacherProfileService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Users } from 'lucide-react';
import '../../styles/teacher-brand.css';

export function TeacherGrades() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);
  const [termResults, setTermResults] = useState<Record<number, { term1: string; term2: string; term3: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    void loadStudents();
  }, [token]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await teacherProfileService.getStudents(token as string);
      setStudents(data);
      await loadExistingResults(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingResults = async (students: TeacherStudent[]) => {
    try {
      const resultsData = await teacherProfileService.getStudentsResults(token as string);
      
      // Initialize termResults with existing data
      const newTermResults: Record<number, { term1: string; term2: string; term3: string }> = {};
      
      resultsData.forEach((studentResult: any) => {
        studentResult.subjects.forEach((subject: any) => {
          const key = `${studentResult.student_id}_${subject.subject_id}`;
          if (!newTermResults[studentResult.student_id]) {
            newTermResults[studentResult.student_id] = { term1: '', term2: '', term3: '' };
          }
          // For now, assume one subject per student, take the first one
          // In a real scenario, you might need to handle multiple subjects
          newTermResults[studentResult.student_id] = {
            term1: subject.term1_result || '',
            term2: subject.term2_result || '',
            term3: subject.term3_result || '',
          };
        });
      });
      
      setTermResults(newTermResults);
    } catch (error) {
      console.error('Failed to load existing results:', error);
      // Initialize empty results
      const emptyResults: Record<number, { term1: string; term2: string; term3: string }> = {};
      students.forEach(student => {
        emptyResults[student.id] = { term1: '', term2: '', term3: '' };
      });
      setTermResults(emptyResults);
    }
  };

  const studentsByGrade = students.reduce<Record<string, TeacherStudent[]>>((groups, student) => {
    const grade = student.grade?.trim() || 'Ungraded';
    if (!groups[grade]) {
      groups[grade] = [];
    }
    groups[grade].push(student);
    return groups;
  }, {});

  const handleTermResultChange = (studentId: number, term: 'term1' | 'term2' | 'term3', value: string) => {
    setTermResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [term]: value
      }
    }));
  };

  const handleSaveResults = async () => {
    setIsSaving(true);
    try {
      const promises = students.map(student => {
        const results = termResults[student.id];
        if (results) {
          return teacherProfileService.saveStudentResults(token as string, student.id, results);
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      toast.success('Results saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save results');
    } finally {
      setIsSaving(false);
    }
  };

  const sortedGrades = Object.keys(studentsByGrade).sort((a, b) => {
    if (a === 'Ungraded') return 1;
    if (b === 'Ungraded') return -1;

    const extractNumber = (value: string) => {
      const match = value.match(/\d+/);
      return match ? Number(match[0]) : NaN;
    };

    const numA = extractNumber(a);
    const numB = extractNumber(b);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 font-semibold mb-2">Teacher</p>
          <h1 className="text-3xl font-bold text-slate-900">Grades & Students</h1>
          <p className="text-sm text-slate-600 mt-1">
            Students enrolled in your approved classes will appear here once they are assigned.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/teacher/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="border-b border-fedora/20 bg-concrete p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Assigned Students</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {isLoading ? 'Loading students...' : `${students.length} student${students.length !== 1 ? 's' : ''} assigned`}
                </p>
              </div>
            </div>
            <Button variant="default" onClick={handleSaveResults} disabled={isSaving || students.length === 0}>
              {isSaving ? 'Saving...' : 'Save Results'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-center">
              <div>
                <p className="text-lg font-semibold text-slate-900">No students assigned yet</p>
                <p className="mt-2 text-sm text-slate-600">
                  Once the admin enrolls students into your classes, they will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedGrades.map((grade) => (
                <div key={grade} className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Grade Group</p>
                        <h3 className="text-xl font-semibold text-slate-900">{grade}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{studentsByGrade[grade].length} student{studentsByGrade[grade].length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-left">
                      <thead className="bg-slate-50 text-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em]">Student</th>
                          <th className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em]">Email</th>
                          <th className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em]">1st Term</th>
                          <th className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em]">2nd Term</th>
                          <th className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em]">3rd Term</th>
                          <th className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {studentsByGrade[grade].map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50">
                            <td className="px-4 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={undefined}
                                  fallback={student.full_name?.charAt(0).toUpperCase() || student.username.charAt(0).toUpperCase()}
                                  className="h-10 w-10"
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">{student.full_name || student.username}</p>
                                  <p className="truncate text-xs text-slate-500">ID: {student.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle text-sm text-slate-700">{student.email}</td>
                            <td className="px-4 py-4 align-middle">
                              <input
                                type="text"
                                value={termResults[student.id]?.term1 ?? ''}
                                onChange={(event) => handleTermResultChange(student.id, 'term1', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-scarlet focus:outline-none focus:ring-1 focus:ring-scarlet/30"
                                placeholder="Enter result"
                              />
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <input
                                type="text"
                                value={termResults[student.id]?.term2 ?? ''}
                                onChange={(event) => handleTermResultChange(student.id, 'term2', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-scarlet focus:outline-none focus:ring-1 focus:ring-scarlet/30"
                                placeholder="Enter result"
                              />
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <input
                                type="text"
                                value={termResults[student.id]?.term3 ?? ''}
                                onChange={(event) => handleTermResultChange(student.id, 'term3', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-scarlet focus:outline-none focus:ring-1 focus:ring-scarlet/30"
                                placeholder="Enter result"
                              />
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <Button size="sm" variant="secondary" onClick={() => setSelectedStudent(student)}>
                                View Profile
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Student Profile</p>
                <h2 className="text-2xl font-semibold text-slate-900">{selectedStudent.full_name || selectedStudent.username}</h2>
              </div>
              <Button type="button" variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Name</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{selectedStudent.full_name || 'N/A'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Email</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{selectedStudent.email}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Grade</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{selectedStudent.grade || 'Ungraded'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">School</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{selectedStudent.school || 'N/A'}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Guardian Name</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{selectedStudent.guardian_name || 'N/A'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Contact Number</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{selectedStudent.guardian_contact || 'N/A'}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-500">Notes</p>
                <p className="mt-3 text-sm text-slate-600">
                  Use this view to verify the student details before recording term results. If you need more information, contact the admin to update student profile details.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
