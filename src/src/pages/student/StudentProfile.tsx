import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { studentProfileService, StudentProfileData, EnrolledSubject } from '../../services/studentProfileService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Mail, Phone, Users, BookOpen, Award, Briefcase } from 'lucide-react';

export function StudentProfile() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [subjects, setSubjects] = useState<EnrolledSubject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [profileData, subjectsData] = await Promise.all([
        studentProfileService.getProfile(token),
        studentProfileService.getEnrolledSubjects(token)
      ]);
      setProfile(profileData);
      setSubjects(subjectsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-8">
        <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-slate-600">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 font-semibold mb-2">Student</p>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border border-red-100 shadow-lg overflow-hidden rounded-[2rem]">
        <div className="h-28 bg-gradient-to-r from-scarlet via-red-500 to-red-700" />
        <CardContent className="relative -mt-14 px-6 pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
            <Avatar
              src={profile.student.profile_image}
              fallback={profile.user.full_name?.charAt(0).toUpperCase() || 'S'}
              className="h-32 w-32 border-4 border-white shadow-2xl"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-tuatara">{profile.user.full_name}</h2>
              <p className="text-lg text-red-600 font-semibold mt-1">@{profile.user.username}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Email */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-red-600" />
                <p className="text-sm font-semibold text-slate-600 uppercase">Email</p>
              </div>
              <p className="text-slate-900 font-medium">{profile.user.email}</p>
            </div>

            {/* Grade */}
            {profile.student.grade && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">Grade</p>
                </div>
                <p className="text-slate-900 font-medium">{profile.student.grade}</p>
              </div>
            )}

            {/* Age */}
            {profile.student.age && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">Age</p>
                </div>
                <p className="text-slate-900 font-medium">{profile.student.age} years</p>
              </div>
            )}

            {/* School */}
            {profile.student.school && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">School</p>
                </div>
                <p className="text-slate-900 font-medium">{profile.student.school}</p>
              </div>
            )}

            {/* Guardian */}
            {profile.student.guardian_name && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-2 lg:col-span-1">
                <p className="text-sm font-semibold text-slate-600 uppercase mb-2">Guardian</p>
                <p className="text-slate-900 font-medium">{profile.student.guardian_name}</p>
                {profile.student.guardian_contact && (
                  <p className="text-sm text-slate-600 mt-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    {profile.student.guardian_contact}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Subjects */}
      <Card className="border border-red-100 shadow-lg rounded-[1.75rem] overflow-hidden">
        <CardHeader className="border-b border-red-100 bg-gradient-to-r from-red-50 to-white p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-scarlet" />
            <div>
              <h2 className="text-lg font-semibold text-tuatara">Enrolled Subjects</h2>
              <p className="text-sm text-fedora mt-1">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} currently enrolled
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {subjects.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-center">
              <div>
                <BookOpen className="h-12 w-12 text-scarlet mx-auto mb-3" />
                <p className="text-lg font-semibold text-tuatara">No subjects enrolled</p>
                <p className="text-sm text-fedora mt-1">Enroll in subjects to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="rounded-[1.5rem] border border-red-100 bg-white/90 p-5 shadow-sm hover:border-scarlet/40 transition"
                >
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-tuatara">{subject.name}</h3>
                      <p className="text-sm text-fedora mt-1">{subject.grade ?? 'Grade not assigned'}</p>
                    </div>
                    {subject.monthly_fee && (
                      <span className="text-xs font-semibold text-scarlet bg-scarlet/10 px-3 py-1 rounded-full border border-scarlet/20">
                        Rs.{subject.monthly_fee}
                      </span>
                    )}
                  </div>

                  {subject.description && (
                    <p className="text-sm text-fedora mb-3">{subject.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {subject.grade && (
                      <span className="inline-block text-xs font-medium text-red-800 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        {subject.grade}
                      </span>
                    )}
                    {subject.teacher_id && (
                      <span className="inline-block text-xs font-medium text-white bg-scarlet px-3 py-1 rounded-full border border-scarlet/70">
                        Teacher assigned
                      </span>
                    )}
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
