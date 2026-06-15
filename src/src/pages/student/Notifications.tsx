import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { notificationsService, NotificationPayload } from '../../services/notificationsService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bell, Trash2 } from 'lucide-react';

export function StudentNotifications() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotifications = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await notificationsService.listStudentNotifications(token);
      setNotifications(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [token]);

  const handleDismiss = async (notificationId: number) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await notificationsService.dismissStudentNotification(token, notificationId);
      await loadNotifications();
      toast.success('Notification removed');
    } catch (error: any) {
      toast.error(error.message || 'Unable to remove notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await notificationsService.clearStudentNotifications(token);
      await loadNotifications();
      toast.success('All notifications cleared');
    } catch (error: any) {
      toast.error(error.message || 'Could not clear notifications');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-gradient-to-r from-scarlet via-red-500 to-red-700 p-8 text-white shadow-xl overflow-hidden">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-red-100/80">Student Alerts</p>
            <h1 className="text-4xl font-bold">Notifications</h1>
          </div>
          <Button variant="secondary" className="mt-4 sm:mt-0" onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-red-100/90">
          Stay up-to-date with announcements, reminders, and important school news.
        </p>
      </div>

      <Card className="rounded-[1.75rem] border border-red-100 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-red-50 p-6 border-b border-red-100">
          <div>
            <CardTitle>Announcements for Students</CardTitle>
          </div>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 rounded-2xl bg-fedora/5 animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="Announcements targeted to students or all users will appear here."
            />
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="border border-red-100 bg-red-50 shadow-sm">
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-scarlet">{notification.target_role === 'all' ? 'All Students & Teachers' : 'Students'}</p>
                        <h2 className="text-xl font-semibold text-tuatara">{notification.title}</h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-scarlet/10 px-3 py-1 text-sm font-medium text-scarlet">
                          {notification.category ?? 'General'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => void handleDismiss(notification.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Dismiss
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-fedora leading-6">{notification.message}</p>
                    <div className="text-xs text-fedora">{new Date(notification.created_at).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
