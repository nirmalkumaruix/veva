import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, apiErrorMessage, type ApiResponse } from '../lib/api';
import { useAuth } from '../store/auth';
import { Button, Card, Field, Input, Select } from '../components/ui';

type TokenResponse = { accessToken: string; refreshToken: string; fullName: string; roles: string[] };

export function Login() {
  const [email, setEmail] = useState('owner@veetu.test');
  const [password, setPassword] = useState('Password@123');
  const auth = useAuth();
  const nav = useNavigate();
  const login = useMutation({
    mutationFn: async () => (await api.post<ApiResponse<TokenResponse>>('/auth/login', { email, password })).data.data,
    onSuccess: (data) => {
      auth.setAuth(data.accessToken, data.fullName, data.roles, data.refreshToken);
      toast.success(`Welcome, ${data.fullName}`);
      nav(data.roles.includes('TENANT') ? '/tenant' : data.roles.includes('ADMIN') ? '/admin' : '/owner');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Login failed. Check the email and password.')),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    login.mutate();
  }

  return <Card className="mx-auto max-w-md space-y-5">
    <div><h1 className="text-3xl font-black">Welcome back</h1><p className="mt-1 text-slate-500">Use the demo owner, tenant, or admin account.</p></div>
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
      <Field label="Password"><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" /></Field>
      <Button disabled={login.isPending} className="w-full">{login.isPending ? 'Signing in...' : 'Login'}</Button>
    </form>
    <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
      <p className="font-semibold">Demo users</p>
      <p>owner@veetu.test, tenant@veetu.test, admin@veetu.test</p>
      <p>Password: Password@123</p>
    </div>
    <p className="text-center text-sm text-slate-500">New owner? <Link className="font-semibold text-kolam" to="/register">Create an account</Link></p>
  </Card>;
}

export function Register() {
  const [form, setForm] = useState({ email: '', password: 'Password@123', fullName: '', mobile: '', role: 'OWNER' });
  const auth = useAuth();
  const nav = useNavigate();
  const register = useMutation({
    mutationFn: async () => (await api.post<ApiResponse<TokenResponse>>('/auth/register', form)).data.data,
    onSuccess: (data) => {
      auth.setAuth(data.accessToken, data.fullName, data.roles, data.refreshToken);
      toast.success('Account created');
      nav(data.roles.includes('TENANT') ? '/tenant' : '/owner');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Registration failed. Try another email.')),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    register.mutate();
  }

  return <Card className="mx-auto max-w-lg space-y-5">
    <div><h1 className="text-3xl font-black">Create account</h1><p className="mt-1 text-slate-500">Start managing rent, tenants, and receipts.</p></div>
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Full name"><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></Field>
      <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required /></Field>
      <Field label="Mobile"><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
      <Field label="Password"><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required /></Field>
      <Field label="Role"><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>OWNER</option><option>TENANT</option></Select></Field>
      <Button disabled={register.isPending}>{register.isPending ? 'Creating...' : 'Register'}</Button>
    </form>
  </Card>;
}
