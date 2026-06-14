import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminSubjectService, AdminSubject, AdminTeacherInfo } from '../../services/adminSubjectService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Edit3, Trash2, FilePlus, Search } from 'lucide-react';

const gradeOptions = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

const initialFormState = {
  name: '',
  description: '',
  grade: '',
  teacher_id: '',
  monthly_fee: '',
  schedule_time: ''
};

export function SubjectsManagement() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacherInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<AdminSubject | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [searchText, setSearchText] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((subject) => {
        const query = searchText.toLowerCase();
        const matchesSearch =
          subject.name.toLowerCase().includes(query) ||
          (subject.description?.toLowerCase().includes(query) ?? false);
        const matchesGrade = gradeFilter ? subject.grade === gradeFilter : true;
        return matchesSearch && matchesGrade;
      }),
    [subjects, searchText, gradeFilter]
  );

  const getTeacherName = (teacher_id?: number) => {
    if (!teacher_id) return '-';
    const teacher = teachers.find((t) => t.id === teacher_id);
    return teacher ? teacher.user.full_name : '-';
  };

  const loadSubjects = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [subjectsData, teachersData] = await Promise.all([
        adminSubjectService.listSubjects(token),
        adminSubjectService.listTeachers(token)
      ]);
      setSubjects(subjectsData);
      setTeachers(teachersData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSubjects();
  }, [token]);

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedSubject(null);
    setFormState(initialFormState);
    setIsAddEditOpen(true);
  };

  const openEditModal = (subject: AdminSubject) => {
    setFormMode('edit');
    setSelectedSubject(subject);
    setFormState({
      name: subject.name,
      description: subject.description ?? '',
      grade: subject.grade ?? '',
      teacher_id: subject.teacher_id ? String(subject.teacher_id) : '',
      monthly_fee: subject.monthly_fee ? String(subject.monthly_fee) : '',
      schedule_time: subject.schedule_time ?? ''
    });
    setIsAddEditOpen(true);
  };

  const openDeleteDialog = (subject: AdminSubject) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  const closeModals = () => {
    setIsAddEditOpen(false);
    setIsDeleteOpen(false);
    setSelectedSubject(null);
  };

  const handleInputChange = (field: keyof typeof initialFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      toast.error('You must be logged in as admin');
      return;
    }

    if (!formState.name || !formState.grade) {
      toast.error('Please fill in all required fields (Name and Grade)');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formState.name,
        description: formState.description || undefined,
        grade: formState.grade || undefined,
        teacher_id: formState.teacher_id ? Number(formState.teacher_id) : undefined,
        monthly_fee: formState.monthly_fee ? Number(formState.monthly_fee) : undefined,
        schedule_time: formState.schedule_time || undefined
      };

      if (formMode === 'create') {
        await adminSubjectService.createSubject(token, payload);
        toast.success('Subject created successfully');
      } else if (selectedSubject) {
        await adminSubjectService.updateSubject(token, selectedSubject.id, payload);
        toast.success('Subject updated successfully');
      }

      closeModals();
      await loadSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Could not save subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedSubject) return;
    setIsSubmitting(true);
    try {
      await adminSubjectService.deleteSubject(token, selectedSubject.id);
      toast.success('Subject deleted');
      closeModals();
      await loadSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Could not delete subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setGradeFilter('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fedora mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-tuatara">Subject Management</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
          <Button onClick={openCreateModal}>
            <FilePlus className="h-4 w-4 mr-2" /> Add Subject
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Search by name</span>
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search subject" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Grade</span>
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
          ) : filteredSubjects.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No subjects found"
              description="Add subjects to populate the admin subject list."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Monthly Fee (Rs.)</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-tuatara">{subject.name}</div>
                        {subject.description && (
                          <p className="text-sm text-fedora">{subject.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">{subject.grade || '-'}</td>
                      <td className="px-4 py-4">{getTeacherName(subject.teacher_id)}</td>
                      <td className="px-4 py-4">{subject.monthly_fee ? `Rs. ${subject.monthly_fee.toFixed(2)}` : '-'}</td>
                      <td className="px-4 py-4">{subject.schedule_time || '-'}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openEditModal(subject)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(subject)}>
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
                  {formMode === 'create' ? 'Add Subject' : 'Edit Subject'}
                </h2>
                <p className="text-sm text-fedora">Fill in subject details including teacher assignment and fees.</p>
              </div>
              <Button variant="ghost" onClick={closeModals}>
                Close
              </Button>
            </div>
            <form className="space-y-6 p-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Subject name *</span>
                  <Input
                    value={formState.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Subject name"
                  />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Description</span>
                  <Input
                    value={formState.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Subject description"
                  />
                </label>
                

                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Grade *</span>
                  <Input
                    value={formState.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    placeholder="Grade"
                  />
                </label>
                {/* <label className="block">
                  <span className="text-sm font-medium text-tuatara">Grade *</span>
                  <select
                    value={formState.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Select grade</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label> */}
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Assign teacher</span>
                  <select
                    value={formState.teacher_id}
                    onChange={(e) => handleInputChange('teacher_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">No teacher assigned</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={String(teacher.id)}>
                        {teacher.user.full_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Monthly fee (Rs.)</span>
                  <Input
                    value={formState.monthly_fee}
                    onChange={(e) => handleInputChange('monthly_fee', e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </label>
                {/* <label className="block">
                  <span className="text-sm font-medium text-tuatara">Schedule time</span>
                  <Input
                    value={formState.schedule_time}
                    onChange={(e) => handleInputChange('schedule_time', e.target.value)}
                    placeholder="e.g., Mon-Wed 10:00 AM - 11:00 AM"
                  />
                </label> */}
              </div>
              <CardFooter className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {formMode === 'create' ? 'Create Subject' : 'Save Changes'}
                </Button>
                <Button variant="secondary" onClick={closeModals}>
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-tuatara">Delete subject</h2>
            <p className="mt-3 text-sm text-fedora">
              Are you sure you want to delete "{selectedSubject.name}"? This action cannot be undone.
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
