import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, Download, Edit3, IndianRupee, Mail, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { api, apiErrorMessage, type ApiResponse } from '../lib/api';
import { useAuth } from '../store/auth';
import { Badge, Button, Card, Empty, Field, Input, PageHeader, Select, Textarea, cn } from '../components/ui';

type PageResponse<T> = { content: T[]; totalElements: number; number: number; size: number };
type Role = 'OWNER' | 'TENANT' | 'ADMIN';
type PropertyType = 'HOUSE' | 'APARTMENT' | 'VILLA' | 'COMMERCIAL';
type PaymentType = 'RENT' | 'ADVANCE' | 'MAINTENANCE' | 'EB_BILL' | 'WATER_BILL' | 'REFUND';
type PaymentStatus = 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

type OwnerDashboardData = {
  totalProperties: number;
  occupied: number;
  vacant: number;
  totalTenants: number;
  pendingRents: number | string;
  monthlyRevenue: number | string;
  collectionRate: number;
  recentPayments: Payment[];
};

type TenantDashboardData = {
  status: string;
  nextDueDate: string;
  nextDueInDays: number;
  pendingAmount: number | string;
  propertyTitle: string;
  rentAmount: number | string;
  advanceAmount: number | string;
};

type Property = {
  id: string;
  title: string;
  type: PropertyType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  rentAmount: number | string;
  advanceAmount: number | string;
  dueDay: number;
  occupied: boolean;
  images: { id: string; url: string; altText?: string }[];
};

type Tenant = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  mobile?: string;
  propertyId: string;
  propertyTitle: string;
  rentAmount: number | string;
  advanceAmount: number | string;
  emergencyContact?: string;
  kycDocumentUrl?: string;
  moveInDate?: string;
};

type Payment = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  payerName: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number | string;
  lateFee: number | string;
  dueDate: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  receiptUrl?: string;
  upiIntentUrl?: string;
};

type Invoice = {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  propertyTitle: string;
  payerName: string;
  amount: number | string;
  issuedDate: string;
  dueDate: string;
  pdfUrl: string;
};

type Agreement = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  agreementPdfUrl?: string;
  active: boolean;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  channel: string;
  readFlag: boolean;
  createdAt: string;
};

type UserMe = { id: string; email: string; fullName: string; mobile?: string; roles: Role[] };
type OwnerProfile = { id?: string; businessName?: string; gstNumber?: string; payoutUpiId?: string; billingAddress?: string; logoUrl?: string };

const propertyTypes: PropertyType[] = ['HOUSE', 'APARTMENT', 'VILLA', 'COMMERCIAL'];
const paymentTypes: PaymentType[] = ['RENT', 'ADVANCE', 'MAINTENANCE', 'EB_BILL', 'WATER_BILL'];
const today = () => new Date().toISOString().slice(0, 10);

const blankProperty = {
  title: '',
  type: 'HOUSE' as PropertyType,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: 'Tamil Nadu',
  postalCode: '',
  rentAmount: '',
  advanceAmount: '',
  dueDay: 5,
  occupied: false,
};

const blankTenant = {
  email: '',
  fullName: '',
  mobile: '',
  propertyId: '',
  emergencyContact: '',
  kycDocumentUrl: '',
  moveInDate: today(),
};

const blankPayment = {
  propertyId: '',
  payerId: '',
  type: 'RENT' as PaymentType,
  amount: '',
  dueDate: today(),
};

const blankAgreement = {
  propertyId: '',
  tenantId: '',
  startDate: today(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  agreementPdfUrl: '',
};

function currency(value: unknown) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

function numberValue(value: unknown) {
  return Number(value || 0);
}

function statusClass(status: PaymentStatus | string) {
  return cn(
    'capitalize',
    status === 'SUCCESS' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    status === 'FAILED' && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
    status === 'REFUNDED' && 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    (status === 'CREATED' || status === 'PENDING' || status === 'DUE') && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    status === 'CURRENT' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return <Card className="space-y-2">
    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-3xl font-black tracking-tight">{value}</p>
    {hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
  </Card>;
}

function isOwnerRole(roles: string[]) {
  return roles.includes('OWNER') || roles.includes('ADMIN');
}

export function OwnerDashboard() {
  const dashboard = useQuery({
    queryKey: ['ownerDashboard'],
    queryFn: async () => (await api.get<ApiResponse<OwnerDashboardData>>('/dashboard/owner')).data.data,
  });
  const rows = dashboard.data?.recentPayments?.length
    ? dashboard.data.recentPayments.map((payment) => ({ name: payment.propertyTitle, amount: numberValue(payment.amount) }))
    : [{ name: 'No payments', amount: 0 }];

  return <div className="space-y-6">
    <PageHeader title="Owner Dashboard" eyebrow="Portfolio control" action={<Link to="/properties"><Button><Plus size={16} /> Add property</Button></Link>} />
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard label="Total properties" value={dashboard.data?.totalProperties ?? 0} hint={`${dashboard.data?.occupied ?? 0} occupied`} />
      <StatCard label="Total tenants" value={dashboard.data?.totalTenants ?? 0} hint={`${dashboard.data?.vacant ?? 0} vacant units`} />
      <StatCard label="Pending rents" value={currency(dashboard.data?.pendingRents)} />
      <StatCard label="Monthly revenue" value={currency(dashboard.data?.monthlyRevenue)} hint={`${dashboard.data?.collectionRate ?? 100}% collection rate`} />
    </div>
    <div className="grid gap-4 lg:grid-cols-[1.5fr_.9fr]">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="text-xl font-black">Collection analytics</h2><p className="text-sm text-slate-500">Recent invoice amounts by property</p></div>
          <Badge>{dashboard.data?.collectionRate ?? 100}% collected</Badge>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => currency(value)} />
            <Bar dataKey="amount" fill="#0f766e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="space-y-4">
        <h2 className="text-xl font-black">Recent payments</h2>
        {dashboard.data?.recentPayments?.length ? dashboard.data.recentPayments.slice(0, 6).map((payment) => <div key={payment.id} className="flex items-center justify-between rounded-lg border border-slate-200/70 p-3 dark:border-slate-700">
          <div>
            <p className="font-bold">{payment.propertyTitle}</p>
            <p className="text-sm text-slate-500">{payment.payerName} - {payment.dueDate}</p>
          </div>
          <div className="text-right">
            <p className="font-black">{currency(payment.amount)}</p>
            <Badge className={statusClass(payment.status)}>{payment.status.toLowerCase()}</Badge>
          </div>
        </div>) : <Empty title="No payments yet" text="Create a rent request from the payments page." />}
      </Card>
    </div>
  </div>;
}

export function TenantDashboard() {
  const summary = useQuery({
    queryKey: ['tenantDashboard'],
    queryFn: async () => (await api.get<ApiResponse<TenantDashboardData>>('/dashboard/tenant')).data.data,
  });
  const payments = useQuery({
    queryKey: ['tenantPayments', 'recent'],
    queryFn: async () => (await api.get<ApiResponse<PageResponse<Payment>>>('/payments?size=5')).data.data,
  });
  const chart = payments.data?.content?.length
    ? payments.data.content.map((payment) => ({ name: payment.type.replace('_', ' '), amount: numberValue(payment.amount) }))
    : [{ name: 'Rent', amount: numberValue(summary.data?.rentAmount) }];

  return <div className="space-y-6">
    <PageHeader title="Tenant Dashboard" eyebrow={summary.data?.propertyTitle ?? 'Rental home'} action={<Link to="/payments"><Button><IndianRupee size={16} /> Pay rent</Button></Link>} />
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard label="Rent status" value={summary.data?.status ?? 'CURRENT'} />
      <StatCard label="Next due" value={`${summary.data?.nextDueInDays ?? 0} days`} hint={summary.data?.nextDueDate} />
      <StatCard label="Pending amount" value={currency(summary.data?.pendingAmount)} />
      <StatCard label="Monthly rent" value={currency(summary.data?.rentAmount)} />
    </div>
    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Card>
        <h2 className="mb-4 text-xl font-black">Payment summary</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => currency(value)} />
            <Area type="monotone" dataKey="amount" stroke="#0f766e" fill="#0f766e33" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card className="space-y-4">
        <h2 className="text-xl font-black">Latest activity</h2>
        {payments.data?.content?.length ? payments.data.content.map((payment) => <div key={payment.id} className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-700">
          <div className="flex justify-between gap-3">
            <div><p className="font-bold">{payment.propertyTitle}</p><p className="text-sm text-slate-500">{payment.type.replace('_', ' ')} due {payment.dueDate}</p></div>
            <p className="font-black">{currency(payment.amount)}</p>
          </div>
          <Badge className={statusClass(payment.status)}>{payment.status.toLowerCase()}</Badge>
        </div>) : <Empty title="No payment requests yet" />}
      </Card>
    </div>
  </div>;
}

export function AdminDashboard() {
  const admin = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => (await api.get<ApiResponse<Record<string, number | string>>>('/dashboard/admin')).data.data,
  });
  return <div className="space-y-6">
    <PageHeader title="Admin Panel" eyebrow="Platform operations" />
    <div className="grid gap-4 md:grid-cols-5">
      <StatCard label="Users" value={admin.data?.users ?? 0} />
      <StatCard label="Properties" value={admin.data?.properties ?? 0} />
      <StatCard label="Payments" value={admin.data?.payments ?? 0} />
      <StatCard label="Revenue" value={currency(admin.data?.revenue)} />
      <StatCard label="Pending dues" value={currency(admin.data?.pendingDues)} />
    </div>
    <Card><Empty title="User suspension, complaints, and subscription controls are API-ready." text="The admin APIs are protected and the dashboard has live platform totals." /></Card>
  </div>;
}

export function Properties() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(blankProperty);
  const [editing, setEditing] = useState<Property | null>(null);
  const properties = useProperties();
  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, rentAmount: Number(form.rentAmount), advanceAmount: Number(form.advanceAmount), dueDay: Number(form.dueDay) };
      if (editing) return (await api.put<ApiResponse<Property>>(`/properties/${editing.id}`, payload)).data.data;
      return (await api.post<ApiResponse<Property>>('/properties', payload)).data.data;
    },
    onSuccess: () => {
      toast.success(editing ? 'Property updated' : 'Property created');
      setForm(blankProperty);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not save property')),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiResponse<void>>(`/properties/${id}`)).data,
    onSuccess: () => {
      toast.success('Property deleted');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not delete property')),
  });

  function edit(property: Property) {
    setEditing(property);
    setForm({
      title: property.title,
      type: property.type,
      addressLine1: property.addressLine1,
      addressLine2: property.addressLine2 ?? '',
      city: property.city,
      state: property.state,
      postalCode: property.postalCode,
      rentAmount: String(property.rentAmount),
      advanceAmount: String(property.advanceAmount),
      dueDay: property.dueDay,
      occupied: property.occupied,
    });
  }

  return <div className="space-y-6">
    <PageHeader title="Properties" eyebrow="Rental inventory" />
    <Card>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4 lg:grid-cols-4">
        <Field label="Property title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })}>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</Select></Field>
        <Field label="Rent amount"><Input type="number" min="1" value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: e.target.value })} required /></Field>
        <Field label="Advance amount"><Input type="number" min="1" value={form.advanceAmount} onChange={(e) => setForm({ ...form, advanceAmount: e.target.value })} required /></Field>
        <Field label="Address line 1"><Input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} required /></Field>
        <Field label="Address line 2"><Input value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} /></Field>
        <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></Field>
        <Field label="State"><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required /></Field>
        <Field label="Postal code"><Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required /></Field>
        <Field label="Due day"><Input type="number" min="1" max="28" value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })} required /></Field>
        <Field label="Availability"><Select value={form.occupied ? 'occupied' : 'vacant'} onChange={(e) => setForm({ ...form, occupied: e.target.value === 'occupied' })}><option value="vacant">Vacant</option><option value="occupied">Occupied</option></Select></Field>
        <div className="flex items-end gap-2">
          <Button disabled={save.isPending} className="w-full">{editing ? <Edit3 size={16} /> : <Plus size={16} />} {editing ? 'Update' : 'Add'} property</Button>
          {editing ? <Button type="button" className="bg-white text-slate-950 ring-1 ring-slate-200" onClick={() => { setEditing(null); setForm(blankProperty); }}>Cancel</Button> : null}
        </div>
      </form>
    </Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {properties.data?.length ? properties.data.map((property) => <Card key={property.id} className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-xl font-black">{property.title}</h2><p className="text-sm text-slate-500">{property.addressLine1}, {property.city}</p></div>
          <Badge className={property.occupied ? statusClass('CURRENT') : statusClass('PENDING')}>{property.occupied ? 'occupied' : 'vacant'}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <StatMini label="Rent" value={currency(property.rentAmount)} />
          <StatMini label="Advance" value={currency(property.advanceAmount)} />
          <StatMini label="Due day" value={property.dueDay} />
        </div>
        <div className="flex gap-2">
          <Button type="button" className="bg-white text-slate-950 ring-1 ring-slate-200" onClick={() => edit(property)}><Edit3 size={16} /> Edit</Button>
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => remove.mutate(property.id)}><Trash2 size={16} /> Delete</Button>
        </div>
      </Card>) : <div className="md:col-span-2 xl:col-span-3"><Empty title="No properties yet" text="Add the first rental property to unlock tenant assignment and rent tracking." /></div>}
    </div>
  </div>;
}

export function Tenants() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(blankTenant);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const properties = useProperties();
  const tenants = useTenants();
  const save = useMutation({
    mutationFn: async () => {
      if (editing) return (await api.put<ApiResponse<Tenant>>(`/tenants/${editing.id}`, form)).data.data;
      return (await api.post<ApiResponse<Tenant>>('/tenants', form)).data.data;
    },
    onSuccess: () => {
      toast.success(editing ? 'Tenant updated' : 'Tenant added');
      setEditing(null);
      setForm(blankTenant);
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not save tenant')),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiResponse<void>>(`/tenants/${id}`)).data,
    onSuccess: () => {
      toast.success('Tenant removed');
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not remove tenant')),
  });

  function edit(tenant: Tenant) {
    setEditing(tenant);
    setForm({
      email: tenant.email,
      fullName: tenant.fullName,
      mobile: tenant.mobile ?? '',
      propertyId: tenant.propertyId,
      emergencyContact: tenant.emergencyContact ?? '',
      kycDocumentUrl: tenant.kycDocumentUrl ?? '',
      moveInDate: tenant.moveInDate ?? today(),
    });
  }

  return <div className="space-y-6">
    <PageHeader title="Tenants" eyebrow="People and KYC" />
    <Card>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4 lg:grid-cols-4">
        <Field label="Full name"><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
        <Field label="Mobile"><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
        <Field label="Property"><Select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required><option value="">Select property</option>{properties.data?.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}</Select></Field>
        <Field label="Emergency contact"><Input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></Field>
        <Field label="KYC document URL"><Input value={form.kycDocumentUrl} onChange={(e) => setForm({ ...form, kycDocumentUrl: e.target.value })} /></Field>
        <Field label="Move-in date"><Input type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} /></Field>
        <div className="flex items-end gap-2">
          <Button disabled={save.isPending} className="w-full">{editing ? <Edit3 size={16} /> : <Mail size={16} />} {editing ? 'Update' : 'Invite'} tenant</Button>
          {editing ? <Button type="button" className="bg-white text-slate-950 ring-1 ring-slate-200" onClick={() => { setEditing(null); setForm(blankTenant); }}>Cancel</Button> : null}
        </div>
      </form>
    </Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tenants.data?.length ? tenants.data.map((tenant) => <Card key={tenant.id} className="space-y-4">
        <div><h2 className="text-xl font-black">{tenant.fullName}</h2><p className="text-sm text-slate-500">{tenant.email} - {tenant.mobile || 'No mobile'}</p></div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/70">
          <p className="text-sm text-slate-500">Assigned property</p>
          <p className="font-bold">{tenant.propertyTitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatMini label="Rent" value={currency(tenant.rentAmount)} />
          <StatMini label="Advance" value={currency(tenant.advanceAmount)} />
        </div>
        <div className="flex gap-2">
          <Button type="button" className="bg-white text-slate-950 ring-1 ring-slate-200" onClick={() => edit(tenant)}><Edit3 size={16} /> Edit</Button>
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => remove.mutate(tenant.id)}><Trash2 size={16} /> Remove</Button>
        </div>
      </Card>) : <div className="md:col-span-2 xl:col-span-3"><Empty title="No tenants yet" text="Invite a tenant and assign them to one of your properties." /></div>}
    </div>
  </div>;
}

export function Payments() {
  const auth = useAuth();
  const ownerMode = isOwnerRole(auth.roles);
  const queryClient = useQueryClient();
  const [form, setForm] = useState(blankPayment);
  const properties = useProperties(ownerMode);
  const tenants = useTenants(ownerMode);
  const tenant = useTenantProfile(!ownerMode);
  const payments = useQuery({
    queryKey: ['payments'],
    queryFn: async () => (await api.get<ApiResponse<PageResponse<Payment>>>('/payments')).data.data,
  });
  const create = useMutation({
    mutationFn: async () => {
      const payload = {
        propertyId: ownerMode ? form.propertyId : tenant.data?.propertyId,
        payerId: ownerMode ? form.payerId || undefined : undefined,
        type: form.type,
        amount: Number(form.amount),
        dueDate: form.dueDate,
      };
      return (await api.post<ApiResponse<Payment>>('/payments', payload)).data.data;
    },
    onSuccess: () => {
      toast.success('Payment request created');
      setForm(blankPayment);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tenantDashboard'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not create payment request')),
  });
  const action = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'success' | 'refund' | 'reminders' }) => {
      if (type === 'reminders') return (await api.post<ApiResponse<Payment>>(`/payments/${id}/reminders`)).data.data;
      return (await api.patch<ApiResponse<Payment>>(`/payments/${id}/${type}`)).data.data;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.type === 'reminders' ? 'Reminder sent' : 'Payment updated');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Payment action failed')),
  });

  return <div className="space-y-6">
    <PageHeader title="Payments" eyebrow="Rent collection" action={<Link to="/invoices"><Button className="bg-white text-slate-950 ring-1 ring-slate-200"><Download size={16} /> Receipts</Button></Link>} />
    <Card>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="grid gap-4 lg:grid-cols-5">
        {ownerMode ? <Field label="Property"><Select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required><option value="">Select property</option>{properties.data?.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}</Select></Field> : <Field label="Property"><Input value={tenant.data?.propertyTitle ?? ''} disabled /></Field>}
        {ownerMode ? <Field label="Tenant"><Select value={form.payerId} onChange={(e) => setForm({ ...form, payerId: e.target.value })}><option value="">Assigned tenant</option>{tenants.data?.map((tenant) => <option key={tenant.userId} value={tenant.userId}>{tenant.fullName}</option>)}</Select></Field> : null}
        <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PaymentType })}>{paymentTypes.map((type) => <option key={type}>{type}</option>)}</Select></Field>
        <Field label="Amount"><Input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></Field>
        <Field label="Due date"><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></Field>
        <div className="flex items-end"><Button disabled={create.isPending || (!ownerMode && !tenant.data?.propertyId)} className="w-full"><Plus size={16} /> Create request</Button></div>
      </form>
    </Card>
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th className="py-3">Property</th><th>Payer</th><th>Type</th><th>Due</th><th>Amount</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
        <tbody>
          {payments.data?.content?.map((payment) => <tr key={payment.id} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-3 font-bold">{payment.propertyTitle}</td>
            <td>{payment.payerName}</td>
            <td>{payment.type.replace('_', ' ')}</td>
            <td>{payment.dueDate}</td>
            <td>{currency(payment.amount)}</td>
            <td><Badge className={statusClass(payment.status)}>{payment.status.toLowerCase()}</Badge></td>
            <td className="py-2">
              <div className="flex justify-end gap-2">
                {payment.status !== 'SUCCESS' ? <Button type="button" className="h-9 bg-emerald-600 px-3" onClick={() => action.mutate({ id: payment.id, type: 'success' })}><CheckCircle2 size={15} /> Paid</Button> : null}
                {ownerMode ? <Button type="button" className="h-9 bg-white px-3 text-slate-950 ring-1 ring-slate-200" onClick={() => action.mutate({ id: payment.id, type: 'reminders' })}><Send size={15} /> Remind</Button> : null}
                {payment.receiptUrl ? <a href={payment.receiptUrl} className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-950 px-3 font-semibold text-white"><Download size={15} /> Receipt</a> : null}
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
      {!payments.data?.content?.length ? <Empty title="No payments yet" text="Create a rent, advance, utility, or maintenance request." /> : null}
    </Card>
  </div>;
}

export function Invoices() {
  const invoices = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => (await api.get<ApiResponse<Invoice[]>>('/invoices')).data.data,
  });
  return <div className="space-y-6">
    <PageHeader title="Invoices" eyebrow="Receipts and reports" />
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead><tr className="border-b text-slate-500"><th className="py-3">Invoice</th><th>Property</th><th>Payer</th><th>Issued</th><th>Due</th><th>Amount</th><th className="text-right">Download</th></tr></thead>
        <tbody>
          {invoices.data?.map((invoice) => <tr key={invoice.id} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-3 font-bold">{invoice.invoiceNumber}</td>
            <td>{invoice.propertyTitle}</td>
            <td>{invoice.payerName}</td>
            <td>{invoice.issuedDate}</td>
            <td>{invoice.dueDate}</td>
            <td>{currency(invoice.amount)}</td>
            <td className="text-right"><a className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 font-semibold text-white" href={invoice.pdfUrl}><Download size={15} /> Receipt</a></td>
          </tr>)}
        </tbody>
      </table>
      {!invoices.data?.length ? <Empty title="No invoices yet" text="Invoices are generated automatically when a payment request is created." /> : null}
    </Card>
  </div>;
}

export function Agreements() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(blankAgreement);
  const properties = useProperties();
  const tenants = useTenants();
  const agreements = useQuery({
    queryKey: ['agreements'],
    queryFn: async () => (await api.get<ApiResponse<Agreement[]>>('/agreements')).data.data,
  });
  const create = useMutation({
    mutationFn: async () => (await api.post<ApiResponse<Agreement>>('/agreements', form)).data.data,
    onSuccess: () => {
      toast.success('Agreement saved');
      setForm(blankAgreement);
      queryClient.invalidateQueries({ queryKey: ['agreements'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not save agreement')),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete<ApiResponse<void>>(`/agreements/${id}`)).data,
    onSuccess: () => {
      toast.success('Agreement deleted');
      queryClient.invalidateQueries({ queryKey: ['agreements'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not delete agreement')),
  });

  return <div className="space-y-6">
    <PageHeader title="Agreements" eyebrow="Rental documents" />
    <Card>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="grid gap-4 lg:grid-cols-5">
        <Field label="Property"><Select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required><option value="">Select property</option>{properties.data?.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}</Select></Field>
        <Field label="Tenant"><Select value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} required><option value="">Select tenant</option>{tenants.data?.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.fullName}</option>)}</Select></Field>
        <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></Field>
        <Field label="End date"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></Field>
        <Field label="PDF URL"><Input value={form.agreementPdfUrl} onChange={(e) => setForm({ ...form, agreementPdfUrl: e.target.value })} /></Field>
        <div className="lg:col-span-5"><Button disabled={create.isPending}><Plus size={16} /> Save agreement</Button></div>
      </form>
    </Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {agreements.data?.map((agreement) => <Card key={agreement.id} className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-xl font-black">{agreement.propertyTitle}</h2><p className="text-sm text-slate-500">{agreement.tenantName}</p></div>
          <Badge className={agreement.active ? statusClass('CURRENT') : statusClass('PENDING')}>{agreement.active ? 'active' : 'inactive'}</Badge>
        </div>
        <p className="text-sm text-slate-500">{agreement.startDate} to {agreement.endDate}</p>
        <div className="flex gap-2">
          {agreement.agreementPdfUrl ? <a className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 font-semibold text-white" href={agreement.agreementPdfUrl}><Download size={15} /> PDF</a> : null}
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => remove.mutate(agreement.id)}><Trash2 size={16} /> Delete</Button>
        </div>
      </Card>)}
      {!agreements.data?.length ? <div className="md:col-span-2 xl:col-span-3"><Empty title="No agreements yet" text="Attach an agreement period and PDF URL after adding a tenant." /></div> : null}
    </div>
  </div>;
}

export function Notifications() {
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get<ApiResponse<NotificationItem[]>>('/notifications')).data.data,
  });
  const markRead = useMutation({
    mutationFn: async (id: string) => (await api.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`)).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
    },
  });

  return <div className="space-y-6">
    <PageHeader title="Notifications" eyebrow="Reminders and receipts" />
    <div className="space-y-3">
      {notifications.data?.map((item) => <Card key={item.id} className={cn('flex items-start justify-between gap-4', item.readFlag && 'opacity-70')}>
        <div className="flex gap-3">
          <div className="mt-1 rounded-lg bg-kolam/10 p-2 text-kolam"><Bell size={18} /></div>
          <div><h2 className="font-black">{item.title}</h2><p className="text-sm text-slate-600 dark:text-slate-300">{item.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></div>
        </div>
        {!item.readFlag ? <Button type="button" className="bg-white text-slate-950 ring-1 ring-slate-200" onClick={() => markRead.mutate(item.id)}>Mark read</Button> : <Badge>read</Badge>}
      </Card>)}
      {!notifications.data?.length ? <Empty title="No notifications" text="Payment reminders and receipt updates appear here." /> : null}
    </div>
  </div>;
}

export function Settings() {
  const auth = useAuth();
  const ownerMode = auth.roles.includes('OWNER');
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get<ApiResponse<UserMe>>('/users/me')).data.data,
  });
  const owner = useQuery({
    queryKey: ['ownerProfile'],
    enabled: ownerMode,
    queryFn: async () => (await api.get<ApiResponse<OwnerProfile | null>>('/owners/me')).data.data,
  });
  const [profile, setProfile] = useState({ fullName: '', mobile: '' });
  const [ownerForm, setOwnerForm] = useState<OwnerProfile>({});
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (me.data) setProfile({ fullName: me.data.fullName ?? '', mobile: me.data.mobile ?? '' });
  }, [me.data]);

  useEffect(() => {
    if (owner.data) setOwnerForm(owner.data);
  }, [owner.data]);

  const saveProfile = useMutation({
    mutationFn: async () => (await api.patch<ApiResponse<UserMe>>('/users/me', profile)).data.data,
    onSuccess: (data) => {
      localStorage.setItem('fullName', data.fullName);
      toast.success('Profile saved');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not save profile')),
  });
  const saveOwner = useMutation({
    mutationFn: async () => (await api.put<ApiResponse<OwnerProfile>>('/owners/me', ownerForm)).data.data,
    onSuccess: () => {
      toast.success('Owner profile saved');
      queryClient.invalidateQueries({ queryKey: ['ownerProfile'] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not save owner profile')),
  });
  const changePassword = useMutation({
    mutationFn: async () => (await api.patch<ApiResponse<void>>('/users/me/password', password)).data,
    onSuccess: () => {
      toast.success('Password changed');
      setPassword({ currentPassword: '', newPassword: '' });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Password change failed')),
  });

  return <div className="space-y-6">
    <PageHeader title="Settings" eyebrow="Profile and security" />
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); saveProfile.mutate(); }} className="space-y-4">
          <h2 className="text-xl font-black">Profile</h2>
          <Field label="Full name"><Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required /></Field>
          <Field label="Mobile"><Input value={profile.mobile ?? ''} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} /></Field>
          <Field label="Email"><Input value={me.data?.email ?? ''} disabled /></Field>
          <Button disabled={saveProfile.isPending}>Save profile</Button>
        </form>
      </Card>
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); changePassword.mutate(); }} className="space-y-4">
          <h2 className="text-xl font-black">Security</h2>
          <Field label="Current password"><Input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required /></Field>
          <Field label="New password"><Input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} minLength={8} required /></Field>
          <Button disabled={changePassword.isPending}>Change password</Button>
        </form>
      </Card>
    </div>
    {ownerMode ? <Card>
      <form onSubmit={(e) => { e.preventDefault(); saveOwner.mutate(); }} className="grid gap-4 lg:grid-cols-3">
        <h2 className="text-xl font-black lg:col-span-3">Owner business profile</h2>
        <Field label="Business name"><Input value={ownerForm.businessName ?? ''} onChange={(e) => setOwnerForm({ ...ownerForm, businessName: e.target.value })} /></Field>
        <Field label="GST number"><Input value={ownerForm.gstNumber ?? ''} onChange={(e) => setOwnerForm({ ...ownerForm, gstNumber: e.target.value })} /></Field>
        <Field label="Payout UPI ID"><Input value={ownerForm.payoutUpiId ?? ''} onChange={(e) => setOwnerForm({ ...ownerForm, payoutUpiId: e.target.value })} /></Field>
        <Field label="Logo URL"><Input value={ownerForm.logoUrl ?? ''} onChange={(e) => setOwnerForm({ ...ownerForm, logoUrl: e.target.value })} /></Field>
        <Field label="Billing address"><Textarea value={ownerForm.billingAddress ?? ''} onChange={(e) => setOwnerForm({ ...ownerForm, billingAddress: e.target.value })} /></Field>
        <div className="flex items-end"><Button disabled={saveOwner.isPending}>Save owner profile</Button></div>
      </form>
    </Card> : null}
  </div>;
}

function StatMini({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/70"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="font-black">{value}</p></div>;
}

function useProperties(enabled = true) {
  return useQuery({
    queryKey: ['properties'],
    enabled,
    queryFn: async () => (await api.get<ApiResponse<Property[]>>('/properties/all')).data.data,
  });
}

function useTenants(enabled = true) {
  return useQuery({
    queryKey: ['tenants'],
    enabled,
    queryFn: async () => (await api.get<ApiResponse<Tenant[]>>('/tenants')).data.data,
  });
}

function useTenantProfile(enabled = true) {
  return useQuery({
    queryKey: ['tenantProfile'],
    enabled,
    queryFn: async () => (await api.get<ApiResponse<Tenant>>('/tenants/me')).data.data,
  });
}
