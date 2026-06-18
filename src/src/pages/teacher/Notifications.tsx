import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { notificationsService, NotificationPayload } from '../../services/notificationsService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bell, Trash2 } from 'lucide-react';
import '../../styles/teacher-brand.css';

export function TeacherNotifications() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotifications = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await notificationsService.listTeacherNotifications(token);
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
      await notificationsService.dismissTeacherNotification(token, notificationId);
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
      await notificationsService.clearTeacherNotifications(token);
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fedora mb-2">Teacher</p>
          <h1 className="text-3xl font-bold text-tuatara">Notifications</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/teacher/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Announcements for Teachers</CardTitle>
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
              description="Announcements targeted to teachers or all users will appear here."
            />
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="border border-fedora/10">
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-fedora">{notification.target_role === 'all' ? 'All Students & Teachers' : 'Teachers'}</p>
                        <h2 className="text-xl font-semibold text-tuatara">{notification.title}</h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
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
