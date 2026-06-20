import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-concrete flex flex-col items-center justify-center p-4 text-center">
      <div className="h-24 w-24 rounded-full bg-scarlet/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-12 w-12 text-scarlet" />
      </div>
      <h1 className="text-4xl font-bold text-tuatara mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-fedora max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/')}>Return Home</Button>
    </div>);

}