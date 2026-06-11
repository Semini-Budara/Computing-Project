import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
export function Login() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as Role || 'student';
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { token, user } = await authService.login(username, password, role);
      login(token, user);
      toast.success('Login successful');
      navigate(`/${role}/dashboard`);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(247,39,10,0.18),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(124,116,124,0.14),_transparent_28%),linear-gradient(180deg,_#fff8f7_0%,_#fff2f0_50%,_#fffaf9_100%)] flex items-center justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.75))]" />
      <div className="relative z-10 flex w-full max-w-6xl rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_30px_100px_rgba(247,39,10,0.12)] overflow-hidden">
        <div className="hidden lg:flex w-1/2 bg-[#120d12] relative overflow-hidden flex-col justify-between p-12 text-white">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,_rgba(247,39,10,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(255,160,130,0.2),transparent_22%)]" />
          <div className="relative z-10">
            <img src="/ACME_logo.png" alt="ACME Logo" className="h-14" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-scarlet">
              ACME Institute
            </div>
            <div>
              <h1 className="text-5xl font-black leading-tight tracking-[-0.03em]">
                Smart school management
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-slate-200">
                Fast, secure, and beautifully designed for every role in your institution.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300 mb-3">Why ACME?</p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Modern dashboard for every role</li>
                <li>• Transparent student progress tracking</li>
                <li>• Secure login and easy access</li>
              </ul>
            </div>
            {/* <div className="rounded-[1.75rem] border border-white/10 bg-scarlet/10 p-6"> */}
              {/* <p className="text-sm uppercase tracking-[0.3em] text-scarlet font-semibold mb-3">Brand colors</p> */}
              {/* <div className="grid grid-cols-3 gap-3">
                <span className="h-10 rounded-2xl bg-scarlet" />
                <span className="h-10 rounded-2xl bg-[#ff6f50]" />
                <span className="h-10 rounded-2xl bg-[#ffcfbe]" />
              </div> */}
            {/* </div> */}
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-10 lg:p-12">
          <div className="w-full max-w-md">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to roles
            </button>

            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-[#fff5f3] to-[#fff4f2] p-8 shadow-[0_20px_70px_rgba(204,72,58,0.08)]">
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h2 className="text-3xl font-extrabold text-tuatara">
                    Welcome back
                  </h2>
                  <Badge className="uppercase bg-scarlet/10 text-scarlet border border-scarlet/20">
                    {role}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Sign in with your ACME credentials and continue where you left off.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Username or Email
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your username or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-slate-200 bg-white/90"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-800">
                      Password
                    </label>
                    <a href="#" className="text-sm font-medium text-scarlet hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-200 bg-white/90"
                  />
                </div>

                <Button type="submit" className="w-full rounded-full bg-scarlet text-white shadow-[0_18px_40px_rgba(247,39,10,0.2)] hover:bg-[#dd2000]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Need help? Reach out to your administrator for access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
