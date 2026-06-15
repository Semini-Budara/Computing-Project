import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { studentSubjectService, StudentSubject, StudentTeacherProfile } from '../../services/studentSubjectService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ChevronRight, Search, ArrowLeft } from 'lucide-react';

export function StudentTeachers() {
  const [teachers, setTeachers] = useState<StudentTeacherProfile[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<StudentSubject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<StudentTeacherProfile | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchParams] = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const selectedTeacherId = searchParams.get('teacherId');
  const selectedSubjectId = searchParams.get('subjectId');

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    const loadTeacherFromParam = async () => {
      if (!token || !selectedTeacherId) return;
      const teacherId = Number(selectedTeacherId);
      if (!teacherId) return;

      setIsLoading(true);
      try {
        const profile = await studentSubjectService.getTeacherProfile(token, teacherId);
        setSelectedTeacher(profile);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load teacher profile');
      } finally {
        setIsLoading(false);
      }
    };

    void loadTeacherFromParam();
  }, [token, selectedTeacherId]);

  useEffect(() => {
    const loadSubjectFromParam = async () => {
      if (!token || !selectedSubjectId) return;
      const subjectId = Number(selectedSubjectId);
      if (!subjectId) return;

      try {
        const subject = await studentSubjectService.getSubject(token, subjectId);
        setSelectedSubject(subject);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load subject details');
      }
    };

    void loadSubjectFromParam();
  }, [token, selectedSubjectId]);

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await studentSubjectService.listAllTeachers();
      setTeachers(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollmentRequest = async () => {
    if (!token || !selectedSubject) return;
    if (!selectedTeacher) {
      toast.error('Teacher profile not loaded');
      return;
    }
    if (selectedSubject.teacher_id !== selectedTeacher.teacher.id) {
      toast.error('Selected teacher is not assigned to this subject');
      return;
    }

    setIsLoading(true);
    try {
      await studentSubjectService.requestEnrollment(token, selectedSubject.id, selectedSubject.monthly_fee ?? 0, 'USD');
      toast.success(`Enrollment request submitted for ${selectedSubject.name}`);
      setSelectedSubject(null);
      setSelectedTeacher(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit enrollment request');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.user.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    teacher.user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    teacher.teacher.subjects_taught?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {selectedTeacher ? (
        // Teacher Profile View
        <div className="space-y-6">
          <Button
            variant="secondary"
            onClick={() => setSelectedTeacher(null)}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teachers
          </Button>

          <div className="rounded-[2rem] bg-gradient-to-r from-scarlet via-red-500 to-red-700 p-8 text-white shadow-xl overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-red-100/90">Teacher Profile</p>
                <h1 className="text-4xl font-bold">Meet your instructor</h1>
              </div>
              {selectedSubject ? (
                <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  Enrollment request ready
                </div>
              ) : null}
            </div>
          </div>

          <Card className="border border-red-100 shadow-lg rounded-[1.75rem] overflow-hidden">
            <CardContent className="space-y-8 p-8">
              <div className="flex flex-col items-center gap-6 border-b border-red-100 pb-8">
                <Avatar
                  src={selectedTeacher.teacher.profile_image}
                  fallback={selectedTeacher.user.full_name?.charAt(0).toUpperCase() || 'T'}
                  className="h-28 w-28 border-4 border-white shadow-2xl"
                />
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-tuatara">{selectedTeacher.user.full_name}</h2>
                  <p className="mt-1 text-lg font-semibold text-scarlet">
                    {selectedTeacher.teacher.subjects_taught ? 'Faculty Member' : 'Not assigned'}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {selectedTeacher.teacher.qualifications && (
                  <div className="rounded-lg border border-slate-200 bg-white p-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Qualification</p>
                    <p className="mt-3 text-lg font-medium text-slate-900">{selectedTeacher.teacher.qualifications}</p>
                  </div>
                )}

                {selectedTeacher.teacher.experience && (
                  <div className="rounded-lg border border-slate-200 bg-white p-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Experience</p>
                    <p className="mt-3 text-lg font-medium text-slate-900">{selectedTeacher.teacher.experience}</p>
                  </div>
                )}

                {selectedTeacher.teacher.grade_assigned && (
                  <div className="rounded-lg border border-slate-200 bg-white p-6 sm:col-span-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Grades Taught</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {selectedTeacher.teacher.grade_assigned.split(',').map((grade, index) => (
                        <span
                          key={index}
                          className="inline-block rounded-lg bg-red-50 px-4 py-2 font-medium text-red-700 border border-red-200"
                        >
                          {grade.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTeacher.teacher.subjects_taught && (
                  <div className="rounded-lg border border-slate-200 bg-white p-6 sm:col-span-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Subjects Taught</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {selectedTeacher.teacher.subjects_taught.split(',').map((subject, index) => (
                        <span
                          key={index}
                          className="inline-block rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 border border-slate-300"
                        >
                          {subject.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Contact Information</p>
                <div className="mt-4 space-y-2">
                  <p className="text-slate-900">
                    <span className="font-medium">Email:</span> {selectedTeacher.user.email}
                  </p>
                  {selectedTeacher.teacher.contact_number && (
                    <p className="text-slate-900">
                      <span className="font-medium">Phone:</span> {selectedTeacher.teacher.contact_number}
                    </p>
                  )}
                </div>
              </div>

              {selectedSubject ? (
                <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-scarlet">Enrollment Request</p>
                      <h3 className="mt-2 text-xl font-semibold text-tuatara">{selectedSubject.name}</h3>
                      <p className="mt-1 text-sm text-fedora">{selectedSubject.grade ?? 'Grade not assigned'}</p>
                      {selectedSubject.description && (
                        <p className="mt-2 text-sm text-tuatara">{selectedSubject.description}</p>
                      )}
                      <p className="mt-3 text-sm text-slate-600">
                        Fee: <span className="font-semibold text-tuatara">${selectedSubject.monthly_fee?.toFixed(2) ?? '0.00'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleEnrollmentRequest}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Submitting…' : 'Submit Enrollment Request'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Teachers List View
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-gradient-to-r from-scarlet via-red-500 to-red-700 p-8 text-white shadow-xl overflow-hidden">
            <p className="text-sm uppercase tracking-[0.35em] text-red-100/90">Faculty Team</p>
            <h1 className="text-4xl font-bold">Our Teachers</h1>
            <p className="mt-2 text-red-100/90">Explore our dedicated teachers and find the right guide for your subject.</p>
          </div>

          <Card className="border border-red-100 shadow-lg rounded-[1.75rem] overflow-hidden">
            <CardHeader className="border-b border-red-100 p-6 bg-red-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search by name or subject..."
                  className="pl-10 border-slate-300 focus:border-red-400 focus:ring-red-500"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3 p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <p className="text-lg font-semibold text-tuatara">No teachers found</p>
                    <p className="mt-1 text-fedora">Try adjusting your search criteria</p>
                  </div>
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <button
                    key={teacher.teacher.id}
                    onClick={() => setSelectedTeacher(teacher)}
                    className="group flex w-full items-center justify-between rounded-[1.5rem] border border-red-100 bg-white p-5 transition hover:border-scarlet/40 hover:bg-red-50 active:bg-red-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Avatar
                          src={teacher.teacher.profile_image}
                          fallback={teacher.user.full_name?.charAt(0).toUpperCase() || 'T'}
                          className="h-14 w-14 border-2 border-slate-200 group-hover:border-red-300"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">{teacher.user.full_name}</p>
                        <p className="text-sm text-red-600 font-medium">
                          {teacher.teacher.qualifications || 'Faculty Member'}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {teacher.teacher.subjects_taught || 'No subjects assigned'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-red-600 transition" />
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
