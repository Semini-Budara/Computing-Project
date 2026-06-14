import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminTeacherService, AdminTeacher } from '../../services/adminTeacherService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Edit3, Trash2, FilePlus, Search } from 'lucide-react';

const gradeOptions = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

const initialFormState = {
  full_name: '',
  username: '',
  email: '',
  password: '',
  department: '',
  grade_assigned: '',
  class_fee: '',
  contact_number: '',
  qualifications: '',
  experience: '',
  subjects_taught: '',
  profile_image: ''
};

export function TeachersManagement() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [searchText, setSearchText] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);

  const loadTeachers = async (pageToLoad = page) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await adminTeacherService.listTeachers(
        token,
        pageToLoad,
        pageSize,
        searchText || undefined,
        gradeFilter || undefined,
        departmentFilter || undefined
      );
      setTeachers(data);
      // For now, we'll assume the API returns all teachers since pagination isn't fully implemented
      setTotal(data.length);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeachers(page);
  }, [page, pageSize, gradeFilter, searchText, departmentFilter, token]);

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedTeacher(null);
    setFormState(initialFormState);
    setIsAddEditOpen(true);
  };

  const openEditModal = (teacher: AdminTeacher) => {
    setFormMode('edit');
    setSelectedTeacher(teacher);
    setFormState({
      full_name: teacher.user.full_name,
      username: teacher.user.username,
      email: teacher.user.email,
      password: '',
      department: teacher.department ?? '',
      grade_assigned: teacher.grade_assigned ?? '',
      class_fee: teacher.class_fee ?? '',
      contact_number: teacher.contact_number ?? '',
      qualifications: teacher.qualifications ?? '',
      experience: teacher.experience ?? '',
      subjects_taught: teacher.subjects_taught ?? '',
      profile_image: teacher.profile_image ?? ''
    });
    setIsAddEditOpen(true);
  };

  const openDeleteDialog = (teacher: AdminTeacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteOpen(true);
  };

  const closeModals = () => {
    setIsAddEditOpen(false);
    setIsDeleteOpen(false);
    setSelectedTeacher(null);
  };

  const handleInputChange = (field: keyof typeof initialFormState, value: string) => {
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

    if (!formState.full_name || !formState.username || !formState.email || !formState.department || !formState.grade_assigned) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formMode === 'create' && !formState.password) {
      toast.error('Password is required for new teacher accounts');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: formState.full_name,
        username: formState.username,
        email: formState.email,
        password: formState.password || undefined,
        department: formState.department || undefined,
        grade_assigned: formState.grade_assigned || undefined,
        class_fee: formState.class_fee || undefined,
        contact_number: formState.contact_number || undefined,
        qualifications: formState.qualifications || undefined,
        experience: formState.experience || undefined,
        subjects_taught: formState.subjects_taught || undefined,
        profile_image: formState.profile_image || undefined
      };

      if (formMode === 'create') {
        await adminTeacherService.createTeacher(token, payload as any);
        toast.success('Teacher created successfully');
      } else if (selectedTeacher) {
        await adminTeacherService.updateTeacher(token, selectedTeacher.id, payload);
        toast.success('Teacher updated successfully');
      }

      closeModals();
      setPage(1);
      await loadTeachers(1);
    } catch (error: any) {
      toast.error(error.message || 'Could not save teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedTeacher) return;
    setIsSubmitting(true);
    try {
      await adminTeacherService.deleteTeacher(token, selectedTeacher.id);
      toast.success('Teacher deleted');
      closeModals();
      setPage(1);
      await loadTeachers(1);
    } catch (error: any) {
      toast.error(error.message || 'Could not delete teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setGradeFilter('');
    setDepartmentFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fedora mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-tuatara">Teacher Management</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
          <Button onClick={openCreateModal}>
            <FilePlus className="h-4 w-4 mr-2" /> Add Teacher
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Search by name or email</span>
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search teacher" />
            </label>
            {/* <label className="block">
              <span className="text-sm font-medium text-tuatara">Department</span>
              <Input value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} placeholder="Filter by department" />
            </label> */}
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Grade Assigned</span>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All grades</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={handleClearFilters}>
                <Search className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : teachers.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No teachers found"
              description="Add teachers to populate the admin teacher list."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Teacher</th>
                    {/* <th className="px-4 py-3">Department</th> */}
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Subjects</th>
                    <th className="px-4 py-3">Qualifications</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={teacher.profile_image} fallback={teacher.user.full_name?.charAt(0).toUpperCase() || 'T'} />
                          <div>
                            <p className="font-medium text-tuatara">{teacher.user.full_name}</p>
                            <p className="text-sm text-fedora">{teacher.user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-4 py-4">{teacher.department || '-'}</td> */}
                      <td className="px-4 py-4">{teacher.grade_assigned || '-'}</td>
                      <td className="px-4 py-4">{teacher.subjects_taught ? teacher.subjects_taught.split(',').join(', ') : '-'}</td>
                      <td className="px-4 py-4">{teacher.qualifications || '-'}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openEditModal(teacher)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(teacher)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-tuatara">
                  {formMode === 'create' ? 'Add Teacher' : 'Edit Teacher'}
                </h2>
                <p className="text-sm text-fedora">Fill in teacher account and profile details.</p>
              </div>
              <Button variant="ghost" onClick={closeModals}>
                Close
              </Button>
            </div>
            <form className="space-y-6 p-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Full name</span>
                  <Input value={formState.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} placeholder="Teacher full name" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Username</span>
                  <Input value={formState.username} onChange={(e) => handleInputChange('username', e.target.value)} placeholder="Teacher username" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Email</span>
                  <Input value={formState.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" placeholder="Teacher email" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Password</span>
                  <Input value={formState.password} onChange={(e) => handleInputChange('password', e.target.value)} type="password" placeholder="Create password" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Contact number</span>
                  <Input
                    value={formState.contact_number}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                    placeholder="Enter contact number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Department</span>
                  <Input value={formState.department} onChange={(e) => handleInputChange('department', e.target.value)} placeholder="Department" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Grade assigned</span>
                  <Input
                    value={formState.grade_assigned}
                    onChange={(e) => handleInputChange('grade_assigned', e.target.value)}
                    placeholder="Enter grade manually"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Class fee</span>
                  <Input
                    value={formState.class_fee}
                    onChange={(e) => handleInputChange('class_fee', e.target.value)}
                    placeholder="Enter class fee"
                  />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Qualifications</span>
                  <Input value={formState.qualifications} onChange={(e) => handleInputChange('qualifications', e.target.value)} placeholder="List qualifications" />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Experience</span>
                  <Input value={formState.experience} onChange={(e) => handleInputChange('experience', e.target.value)} placeholder="Years of experience and specialties" />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Subjects taught</span>
                  <Input value={formState.subjects_taught} onChange={(e) => handleInputChange('subjects_taught', e.target.value)} placeholder="Comma-separated subjects" />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Profile picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  />
                  {formState.profile_image && (
                    <p className="mt-2 text-sm text-fedora">Image is stored as a base64 preview string.</p>
                  )}
                </label>
              </div>
              <CardFooter className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {formMode === 'create' ? 'Create Teacher' : 'Save Changes'}
                </Button>
                <Button variant="secondary" onClick={closeModals}>
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-tuatara">Delete teacher</h2>
            <p className="mt-3 text-sm text-fedora">
              Are you sure you want to delete {selectedTeacher.user.full_name}? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
                Delete
              </Button>
              <Button variant="secondary" onClick={closeModals}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
