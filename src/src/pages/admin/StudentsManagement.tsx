import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { adminStudentService, AdminStudent } from '../../services/adminStudentService';
import { adminSubjectService, AdminSubject } from '../../services/adminSubjectService';
import { adminTeacherService, AdminTeacher } from '../../services/adminTeacherService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FilePlus,
  Search,
  Trash2,
  UploadCloud
} from 'lucide-react';

const gradeOptions = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

const initialFormState = {
  full_name: '',
  username: '',
  email: '',
  password: '',
  age: '',
  grade: '',
  school: '',
  guardian_name: '',
  guardian_contact: '',
  profile_image: '',
  teacher_ids: [] as number[],
  subject_ids: [] as number[]
};

interface AddStudentPrefill {
  full_name?: string;
  username?: string;
  email?: string;
  grade?: string;
  school?: string;
  guardian_name?: string;
  guardian_contact?: string;
  teacher_ids?: number[];
  subject_ids?: number[];
}

interface EditStudentPrefill {
  id: number;
  user_id: number;
  user: AdminStudent['user'];
  created_at?: string;
  age?: number;
  grade?: string;
  school?: string;
  guardian_name?: string;
  guardian_contact?: string;
  profile_image?: string;
  teacher_id?: number;
  subject_ids?: number[];
}

interface StudentManagementState {
  openAdd?: boolean;
  openAddPrefill?: AddStudentPrefill;
  openEdit?: boolean;
  editStudent?: EditStudentPrefill;
}

export function StudentsManagement() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [searchText, setSearchText] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);

  const loadSubjects = async () => {
    if (!token) {
      return;
    }
    setIsLoadingSubjects(true);
    try {
      const subjectsList = await adminSubjectService.listSubjects(token);
      setSubjects(subjectsList);
    } catch (error: any) {
      console.error('Failed to load subjects:', error.message);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadTeachers = async () => {
    if (!token) {
      return;
    }
    setIsLoadingTeachers(true);
    try {
      const teachersList = await adminTeacherService.listTeachers(token);
      setTeachers(teachersList);
    } catch (error: any) {
      console.error('Failed to load teachers:', error.message);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const loadStudents = async (pageToLoad = page) => {
    if (!token) {
      return;
    }
    setIsLoading(true);
    try {
      const payload = await adminStudentService.listStudents(
        token,
        pageToLoad,
        pageSize,
        searchText,
        gradeFilter,
        schoolFilter
      );
      setStudents(payload.students);
      setTotal(payload.total);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (token) {
      void loadSubjects();
      void loadTeachers();
    }
  }, [token]);

  useEffect(() => {
    void loadStudents(page);
  }, [page, pageSize, gradeFilter, searchText, schoolFilter, token]);

  useEffect(() => {
    const state = location.state as StudentManagementState | null;

    if (state?.openEdit && state.editStudent) {
      openEditModalFromPrefill(state.editStudent);
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    if (searchParams.get('openAdd') === 'true' || state?.openAdd) {
      openCreateModal(state?.openAddPrefill);
      if (searchParams.get('openAdd') === 'true') {
        searchParams.delete('openAdd');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [location.state, location.pathname, navigate, searchParams, setSearchParams]);

  function openCreateModal(prefill?: AddStudentPrefill) {
    setFormMode('create');
    setSelectedStudent(null);
    setFormState({
      ...initialFormState,
      ...prefill,
      age: prefill?.age ? String(prefill.age) : '',
      teacher_ids: prefill?.teacher_ids ?? [],
      subject_ids: prefill?.subject_ids ?? []
    });
    setIsAddEditOpen(true);
  }

  const openEditModal = (student: AdminStudent) => {
    setFormMode('edit');
    setSelectedStudent(student);
    setFormState({
      full_name: student.user.full_name,
      username: student.user.username,
      email: student.user.email,
      password: '',
      age: student.age ? String(student.age) : '',
      grade: student.grade ?? '',
      school: student.school ?? '',
      guardian_name: student.guardian_name ?? '',
      guardian_contact: student.guardian_contact ?? '',
      profile_image: student.profile_image ?? '',
      teacher_ids: student.teachers?.map((teacher) => teacher.id) ?? (student.teacher_id ? [student.teacher_id] : []),
      subject_ids: []
    });
    setIsAddEditOpen(true);
  };

  const openEditModalFromPrefill = (student: EditStudentPrefill) => {
    setFormMode('edit');
    setSelectedStudent({
      id: student.id,
      user_id: student.user_id,
      user: student.user,
      age: student.age,
      grade: student.grade,
      school: student.school,
      guardian_name: student.guardian_name,
      guardian_contact: student.guardian_contact,
      profile_image: student.profile_image,
      teacher_id: student.teacher_id,
      created_at: student.created_at ?? new Date().toISOString()
    } as AdminStudent);
    setFormState({
      full_name: student.user.full_name,
      username: student.user.username,
      email: student.user.email,
      password: '',
      age: student.age ? String(student.age) : '',
      grade: student.grade ?? '',
      school: student.school ?? '',
      guardian_name: student.guardian_name ?? '',
      guardian_contact: student.guardian_contact ?? '',
      profile_image: student.profile_image ?? '',
      teacher_id: student.teacher_id ? String(student.teacher_id) : '',
      subject_ids: student.subject_ids ?? []
    });
    setIsAddEditOpen(true);
  };

  const openDetailDrawer = (student: AdminStudent) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  const openDeleteDialog = (student: AdminStudent) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const closeModals = () => {
    setIsAddEditOpen(false);
    setIsDeleteOpen(false);
    setIsDetailsOpen(false);
    setSelectedStudent(null);
  };

  const handleInputChange = (field: keyof typeof initialFormState, value: string | number[]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setFormState((prev) => ({ ...prev, profile_image: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({ ...prev, profile_image: String(reader.result ?? '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      toast.error('You must be logged in as admin');
      return;
    }

    if (!formState.full_name || !formState.username || !formState.email || !formState.grade) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formMode === 'create' && !formState.password) {
      toast.error('Password is required for new student accounts');
      return;
    }

    setIsSubmitting(true);

    try {
      const basePayload = {
        full_name: formState.full_name,
        username: formState.username,
        email: formState.email,
        age: formState.age ? Number(formState.age) : undefined,
        grade: formState.grade,
        school: formState.school || undefined,
        guardian_name: formState.guardian_name || undefined,
        guardian_contact: formState.guardian_contact || undefined,
        profile_image: formState.profile_image || undefined,
        teacher_ids: formState.teacher_ids.length > 0 ? formState.teacher_ids : undefined,
        teacher_id: formState.teacher_ids.length > 0 ? formState.teacher_ids[0] : undefined,
      };

      if (formMode === 'create') {
        const student = await adminStudentService.createStudent(token, {
          ...basePayload,
          password: formState.password
        });

        if (formState.subject_ids.length > 0) {
          for (const subjectId of formState.subject_ids) {
            try {
              await adminStudentService.enrollStudentInSubject(token, student.id, subjectId);
            } catch (error: any) {
              toast.error(`Failed to enroll in subject: ${error.message}`);
            }
          }
        }

        toast.success('Student created successfully');
      } else if (selectedStudent) {
        await adminStudentService.updateStudent(token, selectedStudent.id, {
          ...basePayload,
          password: formState.password || undefined
        });
        toast.success('Student updated successfully');
      }

      closeModals();
      setPage(1);
      await loadStudents(1);
    } catch (error: any) {
      toast.error(error.message || 'Could not save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedStudent) {
      return;
    }
    setIsSubmitting(true);
    try {
      await adminStudentService.deleteStudent(token, selectedStudent.id);
      toast.success('Student deleted');
      closeModals();
      setPage(1);
      await loadStudents(1);
    } catch (error: any) {
      toast.error(error.message || 'Could not delete student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSchoolFilter('');
    setGradeFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fedora mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-tuatara">Student Management</h1>
          {/* <p className="text-fedora max-w-2xl">
            Create, update, and review student profiles. Changes are saved to the live database.
          </p> */}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
          <Button onClick={openCreateModal}>
            <FilePlus className="h-4 w-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* <div>
            <CardTitle>Search & filter students</CardTitle>
            <p className="text-sm text-fedora">
              Use the controls below to refine the student list.
            </p>
          </div> */}

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Search by name</span>
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search student name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Filter by grade</span>
              <select
                className="flex h-10 w-full rounded-xl border border-fedora/30 bg-transparent px-3 py-2 text-sm text-tuatara focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scarlet"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}>
                <option value="">All grades</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Filter by school</span>
              <Input
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                placeholder="School name"
              />
            </label>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleClearFilters}>
                Reset filters
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Students</CardTitle>
            <p className="text-sm text-fedora">
              Showing {students.length} of {total} students.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-fedora">
            <Search className="h-4 w-4" />
            <span>
              Page {page} of {totalPages}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-fedora/10 text-xs uppercase tracking-[0.15em] text-fedora">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Username</th>
                  {/* <th className="px-4 py-3">Username</th> */}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-fedora/10 last:border-0">
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Skeleton className="h-9 w-24 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12">
                      <EmptyState
                        icon={Search}
                        title="No students found"
                        description="Try adjusting your filters or add a new student to begin managing your roster."
                        className="p-0"
                      />
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-fedora/10 last:border-0 hover:bg-fedora/5 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.profile_image}
                            fallback={student.user.full_name.charAt(0)}
                          />
                          <div>
                            <p className="font-medium text-tuatara">{student.user.full_name}</p>
                            <p className="text-xs text-fedora">{student.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{student.grade || '—'}</td>
                      <td className="px-4 py-4">{student.school || '—'}</td>
                      <td className="px-4 py-4">{student.guardian_name || '—'}</td>
                      <td className="px-4 py-4">{student.guardian_contact || '—'}</td>
                      <td className="px-4 py-4">{student.user.username}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailDrawer(student)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(student)}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(student)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fedora">
            Showing {students.length} students on page {page}.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || isLoading}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages || isLoading}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-fedora/20 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-tuatara">
                  {formMode === 'create' ? 'Add Student' : 'Edit Student'}
                </h2>
                <p className="text-sm text-fedora">
                  {formMode === 'create'
                    ? 'Create a new student account and assign login credentials.'
                    : 'Update the student profile and login details.'}
                </p>
              </div>
              <Button variant="ghost" onClick={closeModals}>
                Close
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Full name</span>
                  <Input
                    value={formState.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Email</span>
                  <Input
                    type="email"
                    value={formState.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Username</span>
                  <Input
                    value={formState.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="jane.doe"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Password</span>
                  <Input
                    type="password"
                    value={formState.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={formMode === 'edit' ? 'Leave blank to keep current password' : 'Enter a secure password'}
                    {...(formMode === 'create' ? { required: true } : {})}
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Age</span>
                  <Input
                    type="number"
                    value={formState.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="14"
                  />
                  
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Grade</span>
                  <select
                    className="flex h-10 w-full rounded-xl border border-fedora/30 bg-transparent px-3 py-2 text-sm text-tuatara focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scarlet"
                    value={formState.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    required>
                    <option value="">Select grade</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">School</span>
                  <Input
                    value={formState.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    placeholder="Brookside Academy"
                  />
                </label>
              </div>
              <div className="block">
                <label>
                  <span className="text-sm font-medium text-tuatara">Assigned Teachers</span>
                  <p className="text-xs text-fedora mb-2">Select one or more teachers for this student</p>
                  <select
                    multiple
                    value={formState.teacher_ids.map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => Number(option.value));
                      handleInputChange('teacher_ids', selected);
                    }}
                    className="flex h-auto w-full rounded-xl border border-fedora/30 bg-transparent px-3 py-2 text-sm text-tuatara focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scarlet"
                    size={Math.min(6, Math.max(3, teachers.length))}>
                    {isLoadingTeachers ? (
                      <option disabled>Loading teachers...</option>
                    ) : teachers.length === 0 ? (
                      <option disabled>No teachers available</option>
                    ) : (
                      teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.user.full_name} {teacher.grade_assigned ? `(${teacher.grade_assigned})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              </div>
              <div className="block">
                <label>
                  <span className="text-sm font-medium text-tuatara">Subjects</span>
                  <p className="text-xs text-fedora mb-2">Select one or more subjects to enroll the student in</p>
                  <select
                    multiple
                    value={formState.subject_ids.map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => Number(option.value));
                      handleInputChange('subject_ids', selected);
                    }}
                    className="flex h-auto w-full rounded-xl border border-fedora/30 bg-transparent px-3 py-2 text-sm text-tuatara focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scarlet"
                    size={Math.min(5, Math.max(3, subjects.length))}>
                    {isLoadingSubjects ? (
                      <option disabled>Loading subjects...</option>
                    ) : subjects.length === 0 ? (
                      <option disabled>No subjects available</option>
                    ) : (
                      subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} {subject.grade ? `(${subject.grade})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Guardian name</span>
                  <Input
                    value={formState.guardian_name}
                    onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                    placeholder="Maria Doe"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Guardian contact</span>
                  <Input
                    value={formState.guardian_contact}
                    onChange={(e) => handleInputChange('guardian_contact', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Profile image</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-tuatara file:mr-4 file:rounded-xl file:border-0 file:bg-fedora/10 file:px-4 file:py-2 file:text-sm file:font-medium"
                    />
                    <UploadCloud className="h-5 w-5 text-fedora" />
                  </div>
                </label>
                {formState.profile_image ? (
                  <div className="rounded-3xl border border-fedora/20 bg-fedora/10 p-4">
                    <p className="text-sm text-fedora mb-2">Preview</p>
                    <img
                      src={formState.profile_image}
                      alt="Preview"
                      className="h-24 w-full rounded-2xl object-cover"
                    />
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" type="button" onClick={closeModals}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {formMode === 'create' ? 'Create Student' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsOpen && selectedStudent ? (
        <div className="fixed inset-0 z-50 flex overflow-hidden bg-black/40 px-4 py-8">
          <div className="absolute inset-0" onClick={closeModals} />
          <div className="relative ml-auto flex h-full w-full max-w-xl flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-fedora/20 px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-fedora">Student detail</p>
                <h2 className="text-2xl font-semibold text-tuatara">{selectedStudent.user.full_name}</h2>
              </div>
              <Button variant="ghost" onClick={closeModals}>
                Close
              </Button>
            </div>
            <div className="space-y-6 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar
                  src={selectedStudent.profile_image}
                  fallback={selectedStudent.user.full_name.charAt(0)}
                  className="h-24 w-24"
                />
                <div className="space-y-2">
                  <p className="text-sm text-fedora">Email</p>
                  <p className="text-lg font-medium text-tuatara">{selectedStudent.user.email}</p>
                  <p className="text-sm text-fedora">Username</p>
                  <p className="text-lg font-medium text-tuatara">{selectedStudent.user.username}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-fedora/20 bg-fedora/10 p-5">
                  <p className="text-sm text-fedora">Grade</p>
                  <p className="mt-2 text-lg font-medium text-tuatara">{selectedStudent.grade || '—'}</p>
                </div>
                <div className="rounded-3xl border border-fedora/20 bg-fedora/10 p-5">
                  <p className="text-sm text-fedora">School</p>
                  <p className="mt-2 text-lg font-medium text-tuatara">{selectedStudent.school || '—'}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-fedora/20 bg-fedora/10 p-5">
                  <p className="text-sm text-fedora">Guardian</p>
                  <p className="mt-2 text-lg font-medium text-tuatara">{selectedStudent.guardian_name || '—'}</p>
                </div>
                <div className="rounded-3xl border border-fedora/20 bg-fedora/10 p-5">
                  <p className="text-sm text-fedora">Contact</p>
                  <p className="mt-2 text-lg font-medium text-tuatara">{selectedStudent.guardian_contact || '—'}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-fedora/20 bg-fedora/10 p-5">
                <p className="text-sm text-fedora">Account created</p>
                <p className="mt-2 text-lg font-medium text-tuatara">
                  {new Date(selectedStudent.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteOpen && selectedStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="absolute inset-0" onClick={closeModals} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-tuatara">Confirm Delete</h2>
            <p className="mt-3 text-sm text-fedora">
              Are you sure you want to remove {selectedStudent.user.full_name}? This action cannot be undone.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeModals}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
                Delete student
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
