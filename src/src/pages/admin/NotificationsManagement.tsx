import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminNotificationService, AdminNotification } from '../../services/adminNotificationService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Edit3, Trash2, FilePlus, Search } from 'lucide-react';

const targetAudienceOptions = [
  { value: 'all', label: 'All' },
  { value: 'students', label: 'Students' },
  { value: 'teachers', label: 'Teachers' }
];

const categoryOptions = [
  { value: 'Special Event', label: 'Special Event' },
  { value: 'Payment', label: 'Payment' },
  { value: 'Class Update', label: 'Class Update' }
];

const initialFormState = {
  title: '',
  message: '',
  target_role: 'all',
  category: 'Special Event'
};

export function NotificationsManagement() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formState, setFormState] = useState(initialFormState);
  const [searchText, setSearchText] = useState('');
  const [filterAudience, setFilterAudience] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const query = searchText.toLowerCase();
        const matchesSearch =
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query);
        const matchesAudience = filterAudience ? notification.target_role === filterAudience : true;
        const matchesCategory = filterCategory ? notification.category === filterCategory : true;
        return matchesSearch && matchesAudience && matchesCategory;
      }),
    [notifications, searchText, filterAudience, filterCategory]
  );

  const loadNotifications = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await adminNotificationService.listNotifications(token);
      setNotifications(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [token]);

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedNotification(null);
    setFormState(initialFormState);
    setIsAddEditOpen(true);
  };

  const openEditModal = (notification: AdminNotification) => {
    setFormMode('edit');
    setSelectedNotification(notification);
    setFormState({
      title: notification.title,
      message: notification.message,
      target_role: notification.target_role ?? 'all',
      category: notification.category ?? 'Special Event'
    });
    setIsAddEditOpen(true);
  };

  const openDeleteDialog = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setIsDeleteOpen(true);
  };

  const closeModals = () => {
    setIsAddEditOpen(false);
    setIsDeleteOpen(false);
    setSelectedNotification(null);
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

    if (!formState.title || !formState.message) {
      toast.error('Please provide a title and message for the announcement');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formState.title,
        message: formState.message,
        target_role: formState.target_role as 'all' | 'students' | 'teachers',
        category: formState.category
      };

      if (formMode === 'create') {
        await adminNotificationService.createNotification(token, payload);
        toast.success('Announcement created successfully');
      } else if (selectedNotification) {
        await adminNotificationService.updateNotification(token, selectedNotification.id, payload);
        toast.success('Announcement updated successfully');
      }

      closeModals();
      await loadNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Could not save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !selectedNotification) return;
    setIsSubmitting(true);
    try {
      await adminNotificationService.deleteNotification(token, selectedNotification.id);
      toast.success('Announcement deleted');
      closeModals();
      await loadNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Could not delete announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilterAudience('');
    setFilterCategory('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fedora mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-tuatara">Announcements</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
          <Button onClick={openCreateModal}>
            <FilePlus className="h-4 w-4 mr-2" /> Add Announcement
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Search announcements</span>
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search by title or message" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Target audience</span>
              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All audiences</option>
                {targetAudienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-tuatara">Category</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All categories</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No announcements found"
              description="Create announcements to share updates with your users."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Audience</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredNotifications.map((notification) => (
                    <tr key={notification.id}>
                      <td className="px-4 py-4 font-medium text-tuatara">{notification.title}</td>
                      <td className="px-4 py-4">{notification.target_role === 'all' ? 'All' : notification.target_role === 'students' ? 'Students' : 'Teachers'}</td>
                      <td className="px-4 py-4">{notification.category || '-'}</td>
                      <td className="px-4 py-4">{notification.message.length > 80 ? `${notification.message.slice(0, 80)}...` : notification.message}</td>
                      <td className="px-4 py-4">{new Date(notification.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openEditModal(notification)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(notification)}>
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
                  {formMode === 'create' ? 'Compose Announcement' : 'Edit Announcement'}
                </h2>
                <p className="text-sm text-fedora">Fill in the announcement details below.</p>
              </div>
              <Button variant="ghost" onClick={closeModals}>
                Close
              </Button>
            </div>
            <form className="space-y-6 p-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Title *</span>
                  <Input
                    value={formState.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Announcement title"
                  />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-tuatara">Message *</span>
                  <textarea
                    value={formState.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Write the announcement message here"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Target Audience</span>
                  <select
                    value={formState.target_role}
                    onChange={(e) => handleInputChange('target_role', e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    {targetAudienceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-tuatara">Category</span>
                  <select
                    value={formState.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <CardFooter className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {formMode === 'create' ? 'Create Announcement' : 'Save Changes'}
                </Button>
                <Button variant="secondary" onClick={closeModals}>
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-tuatara">Delete announcement</h2>
            <p className="mt-3 text-sm text-fedora">
              Are you sure you want to delete "{selectedNotification.title}"? This action cannot be undone.
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
