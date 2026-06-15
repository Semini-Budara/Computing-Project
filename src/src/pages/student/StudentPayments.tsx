import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { studentProfileService, StudentPayment } from '../../services/studentProfileService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

type MonthlyPaymentStatus = 'Paid' | 'Pending Payment';

interface PaymentRow {
  id: number;
  subject_name: string;
  teacher_name: string;
  amount: number;
  currency: string;
  status: string;
  payment_id: number;
  statuses: Record<string, MonthlyPaymentStatus>;
}

const StudentPayments: React.FC = () => {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!token) return;

      try {
        const data = await studentProfileService.getPayments(token);
        setPayments(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [token]);

  const paymentRows = useMemo<PaymentRow[]>(() => {
    return payments.map((payment) => {
      const monthStatus: MonthlyPaymentStatus = payment.status === 'pending' ? 'Pending Payment' : 'Paid';
      return {
        id: payment.id,
        subject_name: payment.subject_name || 'Unknown subject',
        teacher_name: payment.teacher_name || 'Unknown teacher',
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        payment_id: payment.id,
        statuses: {
          Jan: 'Paid',
          Feb: 'Paid',
          Mar: 'Paid',
          Apr: 'Paid',
          May: monthStatus,
        },
      };
    });
  }, [payments]);

  const totalDue = useMemo(
    () => payments.filter((payment) => payment.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0),
    [payments]
  );

  const paidMonths = useMemo(
    () => paymentRows.reduce((count, row) => count + Object.values(row.statuses).filter((status) => status === 'Paid').length, 0),
    [paymentRows]
  );

  const pendingMonths = useMemo(
    () => paymentRows.reduce((count, row) => count + Object.values(row.statuses).filter((status) => status === 'Pending Payment').length, 0),
    [paymentRows]
  );

  const openPaymentModal = (paymentId: number) => {
    const payment = payments.find((p) => p.id === paymentId) || null;
    if (!payment) {
      toast.error('Payment record not found');
      return;
    }
    setSelectedPayment(payment);
    setModalOpen(true);
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvc('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPayment(null);
  };

  const handlePaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selectedPayment) return;

    setIsSubmitting(true);
    try {
      const updatedPayment = await studentProfileService.completePayment(token, selectedPayment.id);
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === selectedPayment.id ? { ...payment, ...updatedPayment, status: 'completed' } : payment
        )
      );
      closeModal();
      setSuccessOpen(true);
      toast.success('Payment completed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (status: MonthlyPaymentStatus) => (
    <Badge variant={status === 'Paid' ? 'success' : 'warning'}>
      {status}
    </Badge>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Review your 2026 monthly payment status and pay pending fees.</p>
        </div>
        <div className="grid gap-4">
          {[...Array(2)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Review your 2026 monthly payment status and pay pending fees.</p>
        </div>
        <EmptyState
          title="No payments found"
          description="You currently have no payment information. Enroll in a subject to see your payment schedule."
          icon={CreditCard}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-scarlet via-red-500 to-red-700 p-8 text-white shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 h-36 w-36 rounded-full bg-orange-200/30 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-red-100">Fee Dashboard</p>
            <h1 className="text-4xl font-bold">Stay on track with your school fees</h1>
          </div>
          <p className="max-w-2xl text-sm text-red-100/90">
            See how much you owe, how many months are fully paid, and take quick action on pending fees.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-red-700">Total Due</p>
          <p className="mt-4 text-3xl font-semibold text-tuatara">${totalDue.toFixed(2)}</p>
          <p className="mt-2 text-sm text-slate-500">Amount outstanding for pending payments.</p>
        </div>
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-red-700">Paid Months</p>
          <p className="mt-4 text-3xl font-semibold text-tuatara">{paidMonths}/{paymentRows.length * 5}</p>
          <p className="mt-2 text-sm text-slate-500">All completed payment months this term.</p>
        </div>
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-red-700">Pending Payments</p>
          <p className="mt-4 text-3xl font-semibold text-tuatara">{pendingMonths}</p>
          <p className="mt-2 text-sm text-slate-500">Payments waiting for completion.</p>
        </div> */}
      </div>

      <Card className="overflow-hidden border border-fedora/30">
        <CardHeader className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-red-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>2026 Monthly Payment Status</CardTitle>
              {/* <p className="text-sm text-slate-600">January through April are paid; May is pending for unpaid subjects.</p> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto px-6 py-6">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead>
              <tr className="text-sm uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-6 py-3 bg-red-50 text-red-900">Subject</th>
                <th className="whitespace-nowrap px-6 py-3 bg-red-50 text-red-900">Teacher</th>
                {months.map((month) => (
                  <th key={month} className="px-4 py-3 bg-red-50 text-center text-red-700">{month}</th>
                ))}
                <th className="px-6 py-3 bg-red-50 text-center text-red-700">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paymentRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-200 last:border-0">
                  <td className="whitespace-nowrap px-6 py-5 font-medium text-slate-900">{row.subject_name}</td>
                  <td className="whitespace-nowrap px-6 py-5 text-slate-600">{row.teacher_name}</td>
                  {months.map((month) => (
                    <td key={`${row.id}-${month}`} className="px-4 py-5 text-center">
                      {month === 'May' && row.statuses.May === 'Pending Payment' ? (
                        <Button size="sm" variant="default" onClick={() => openPaymentModal(row.payment_id)}>
                          Unpaid
                        </Button>
                      ) : (
                        renderStatusBadge(row.statuses[month])
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-5 text-center">
                    {row.statuses.May === 'Pending Payment' ? (
                      <Button size="sm" variant="default" onClick={() => openPaymentModal(row.payment_id)}>
                        Pay Now
                      </Button>
                    ) : (
                      <span className="text-sm text-green-600 font-medium">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {modalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-fedora/10 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Complete Payment</h2>
                <p className="text-sm text-slate-600">Pay for {selectedPayment.subject_name} with {selectedPayment.teacher_name}.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                title="Close payment form"
                aria-label="Close payment form"
                className="text-fedora hover:text-tuatara"
              >
                ✕
              </button>
            </div>
            <form className="space-y-6 p-6" onSubmit={handlePaymentSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Cardholder Name
                  <Input
                    required
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    placeholder="Jane Doe"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Card Number
                  <Input
                    required
                    type="text"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="1234 5678 9012 3456"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm text-slate-700">
                  Expiry Date
                  <Input
                    required
                    type="text"
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    placeholder="MM/YY"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  CVC
                  <Input
                    required
                    type="text"
                    value={cvc}
                    onChange={(event) => setCvc(event.target.value)}
                    placeholder="123"
                  />
                </label>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="font-medium">Amount</p>
                  <div className="rounded-xl border border-fedora/30 bg-slate-50 px-4 py-3 text-slate-900">
                    {selectedPayment.currency} {selectedPayment.amount.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing…' : 'Pay Now'}
                </Button>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-semibold text-slate-900">Payment Successful</h2>
            <p className="mt-3 text-slate-600">Your payment has been processed and recorded for May 2026.</p>
            <Button className="mt-6" onClick={() => setSuccessOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayments;
