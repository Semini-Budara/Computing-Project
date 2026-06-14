import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminEnrollmentService, AdminEnrollment } from '../../services/adminEnrollmentService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

export function EnrollmentRequests() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AdminEnrollment[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadRequests = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await adminEnrollmentService.listPendingEnrollments(token);
      setRequests(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load enrollment requests');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRequest = async (enrollmentId: number) => {
    if (!token) return;
    try {
      await adminEnrollmentService.deleteEnrollmentRequest(token, enrollmentId);
      toast.success('Enrollment request deleted');
      if (selectedRequest?.id === enrollmentId) {
        setSelectedRequest(null);
      }
      await loadRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete enrollment request');
    }
  };

  const acceptRequest = (request: AdminEnrollment) => {
    if (!request.student) {
      toast.error('Selected request does not contain a student record');
      return;
    }

    setSelectedRequest(null);
    navigate('/admin/students', {
      state: {
        openEdit: true,
        editStudent: {
          id: request.student.id,
          user_id: request.student.user_id,
          user: request.student.user,
          created_at: new Date().toISOString(),
          grade: request.subject?.grade ?? '',
          subject_ids: request.subject?.id ? [request.subject.id] : []
        }
      }
    });
  };

  useEffect(() => {
    void loadRequests();
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fedora mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-tuatara">Enrollment Requests</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold text-tuatara">Pending Requests</h2>
            <p className="text-sm text-fedora">Review requests submitted by students.</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-slate-600">No pending enrollment requests at this time.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Request ID #{request.id}</p>
                      <h3 className="text-lg font-semibold text-tuatara">
                        {request.subject?.name ?? `Subject #${request.subject_id}`}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Student: {request.student?.user.full_name ?? `Student #${request.student_id}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                        {request.status}
                      </span>
                      <Button type="button" variant="secondary" onClick={() => setSelectedRequest(request)}>
                        View Request
                      </Button>
                      <Button type="button" variant="outline" onClick={() => deleteRequest(request.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-fedora">Enrollment Request</p>
                <h2 className="text-2xl font-semibold text-tuatara">Student Profile</h2>
              </div>
              <Button type="button" variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Student</p>
                  <p className="mt-3 text-lg font-semibold text-tuatara">{selectedRequest.student?.user.full_name ?? 'Unknown Student'}</p>
                  <p className="mt-1 text-sm text-slate-600">{selectedRequest.student?.user.email}</p>
                  <p className="mt-1 text-sm text-slate-600">Username: {selectedRequest.student?.user.username}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Requested Subject</p>
                  <p className="mt-3 text-lg font-semibold text-tuatara">{selectedRequest.subject?.name ?? 'Unknown Subject'}</p>
                  <p className="mt-1 text-sm text-slate-600">Grade: {selectedRequest.subject?.grade ?? 'N/A'}</p>
                  <p className="mt-1 text-sm text-slate-600">Payment: {selectedRequest.payment_status}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">Status: {selectedRequest.status}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Request ID #{selectedRequest.id}</span>
                </div>
                <p className="mt-4 text-sm text-slate-600">Review the student profile and then click Accept Now to open the Edit Student form in Admin → Students.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
                <Button type="button" variant="secondary" onClick={() => acceptRequest(selectedRequest)}>
                  Accept Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
