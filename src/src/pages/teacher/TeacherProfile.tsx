import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { teacherProfileService, TeacherProfileData, TeacherClass } from '../../services/teacherProfileService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Mail, Phone, BookOpen, Award, Briefcase, Users, DollarSign, GraduationCap } from 'lucide-react';
import '../../styles/teacher-brand.css';

export function TeacherProfile() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const profileData = await teacherProfileService.getProfile(token);
      setProfile(profileData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
      setIsLoading(false);
      return;
    }

    try {
      const classesData = await teacherProfileService.getClasses(token);
      setClasses(classesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load classes');
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
        <Button variant="secondary" onClick={() => navigate('/teacher/dashboard')}>
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
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 font-semibold mb-2">Teacher</p>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/teacher/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border border-fedora/20 shadow-md overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-tuatara"></div>
        <CardContent className="relative -mt-12 px-6 pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
            <Avatar
              src={profile.teacher.profile_image}
              fallback={profile.user.full_name?.charAt(0).toUpperCase() || 'T'}
              className="h-32 w-32 border-4 border-white shadow-lg"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900">{profile.user.full_name}</h2>
              <p className="text-lg text-red-600 font-medium mt-1">@{profile.user.username}</p>
              {profile.teacher.department && (
                <p className="text-sm text-slate-600 mt-1">{profile.teacher.department}</p>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Email */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-red-600" />
                <p className="text-sm font-semibold text-slate-600 uppercase">Email</p>
              </div>
              <p className="text-slate-900 font-medium text-sm">{profile.user.email}</p>
            </div>

            {/* Contact Number */}
            {profile.teacher.contact_number && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">Contact</p>
                </div>
                <p className="text-slate-900 font-medium text-sm">{profile.teacher.contact_number}</p>
              </div>
            )}

            {/* Qualifications */}
            {profile.teacher.qualifications && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">Qualifications</p>
                </div>
                <p className="text-slate-900 font-medium text-sm">{profile.teacher.qualifications}</p>
              </div>
            )}

            {/* Experience */}
            {profile.teacher.experience && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">Experience</p>
                </div>
                <p className="text-slate-900 font-medium text-sm">{profile.teacher.experience}</p>
              </div>
            )}

            {/* Grade Assigned */}
            {profile.teacher.grade_assigned && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">Grade Assigned</p>
                </div>
                <p className="text-slate-900 font-medium text-sm">{profile.teacher.grade_assigned}</p>
              </div>
            )}

            {/* Class Fee */}
            {profile.teacher.class_fee && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">Class Fee</p>
                </div>
                <p className="text-slate-900 font-medium text-sm">{profile.teacher.class_fee}</p>
              </div>
            )}

            {/* Subjects Taught */}
            {profile.teacher.subjects_taught && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-600 uppercase">Subjects</p>
                </div>
                <p className="text-slate-900 font-medium text-sm">{profile.teacher.subjects_taught}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teaching Classes */}
      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-red-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Teaching Classes</h2>
              <p className="text-sm text-slate-600 mt-1">
                {classes.length} class{classes.length !== 1 ? 'es' : ''} assigned
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {classes.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-center">
              <div>
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-lg font-semibold text-slate-900">No classes assigned</p>
                <p className="text-sm text-slate-600 mt-1">Await assignment from administration</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:border-red-300 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 flex-1">{classItem.name}</h3>
                    {classItem.monthly_fee && (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                        Rs.{classItem.monthly_fee}
                      </span>
                    )}
                  </div>

                  {classItem.description && (
                    <p className="text-sm text-slate-600 mb-3">{classItem.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {classItem.grade && (
                      <span className="inline-block text-xs font-medium text-fedora bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        {classItem.grade}
                      </span>
                    )}
                    <span className="inline-block text-xs font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                      Class ID: {classItem.id}
                    </span>
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
