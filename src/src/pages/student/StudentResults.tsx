import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { studentProfileService, StudentResult } from '../../services/studentProfileService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

const StudentResults: React.FC = () => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchResults = async () => {
      if (!token) return;

      try {
        const data = await studentProfileService.getResults(token);
        setResults(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-600">View your academic performance across subjects</p>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-600">View your academic performance across subjects</p>
        </div>
        <EmptyState
          title="No Results Available"
          description="Your results will appear here once your teachers have entered them."
          icon="📊"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-600">View your academic performance across subjects</p>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.subject_id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{result.subject_name}</span>
                <Badge variant="secondary">{result.grade}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">1st Term</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {result.term1_result || 'Not entered'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">2nd Term</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {result.term2_result || 'Not entered'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">3rd Term</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {result.term3_result || 'Not entered'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentResults;