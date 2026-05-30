import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import { Badge, Button, Card, Empty, ErrorBanner, Field, Input, Loading, PageTitle, Row, Screen, colors } from '@/components/veva-ui';
import { useAuth } from '@/context/auth';
import { apiUrl, formatCurrency, request, today } from '@/lib/api';
import type { Agreement, Invoice, NotificationItem, OwnerProfile, Property, Tenant, UserMe } from '@/lib/types';
import { useApiQuery } from '@/lib/use-api';

type Section = 'invoices' | 'agreements' | 'notifications' | 'settings';

export default function MoreScreen() {
  const auth = useAuth();
  const [section, setSection] = useState<Section>('invoices');

  return (
    <Screen>
      <PageTitle title="More" subtitle="Receipts, documents, alerts, and profile" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip active={section === 'invoices'} label="Invoices" onPress={() => setSection('invoices')} />
        {auth.isOwnerMode ? <Chip active={section === 'agreements'} label="Agreements" onPress={() => setSection('agreements')} /> : null}
        <Chip active={section === 'notifications'} label="Notifications" onPress={() => setSection('notifications')} />
        <Chip active={section === 'settings'} label="Settings" onPress={() => setSection('settings')} />
      </View>

      {section === 'invoices' ? <Invoices /> : null}
      {section === 'agreements' ? <Agreements /> : null}
      {section === 'notifications' ? <Notifications /> : null}
      {section === 'settings' ? <Settings /> : null}
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{
      backgroundColor: active ? colors.primary : '#fff',
      borderColor: active ? colors.primary : colors.line,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 9,
    }}>
      <Text style={{ color: active ? '#fff' : colors.ink, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function Invoices() {
  const auth = useAuth();
  const invoices = useApiQuery<Invoice[]>('/invoices', auth.accessToken);

  return (
    <>
      <ErrorBanner message={invoices.error} />
      {invoices.loading ? <Loading /> : null}
      {invoices.data?.length ? invoices.data.map((invoice) => (
        <Card key={invoice.id}>
          <Text style={{ fontSize: 18, fontWeight: '900' }}>{invoice.invoiceNumber}</Text>
          <Row label="Property" value={invoice.propertyTitle} />
          <Row label="Payer" value={invoice.payerName} />
          <Row label="Amount" value={formatCurrency(invoice.amount)} />
          <Row label="Due date" value={invoice.dueDate} />
          {invoice.pdfUrl ? <Button title="Open receipt" onPress={() => Linking.openURL(apiUrl(invoice.pdfUrl))} /> : null}
        </Card>
      )) : <Empty title="No invoices yet" text="Invoices are generated when a payment request is created." />}
    </>
  );
}

function Agreements() {
  const auth = useAuth();
  const agreements = useApiQuery<Agreement[]>('/agreements', auth.accessToken, auth.isOwnerMode);
  const properties = useApiQuery<Property[]>('/properties/all', auth.accessToken, auth.isOwnerMode);
  const tenants = useApiQuery<Tenant[]>('/tenants', auth.accessToken, auth.isOwnerMode);
  const [form, setForm] = useState({ propertyId: '', tenantId: '', startDate: today(), endDate: today(), agreementPdfUrl: '' });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await request<Agreement>('/agreements', { method: 'POST', token: auth.accessToken, body: form });
      setForm({ propertyId: '', tenantId: '', startDate: today(), endDate: today(), agreementPdfUrl: '' });
      agreements.reload();
    } catch (err) {
      Alert.alert('Could not save agreement', err instanceof Error ? err.message : 'Try again');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    Alert.alert('Delete agreement?', 'This removes the agreement record.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await request<void>(`/agreements/${id}`, { method: 'DELETE', token: auth.accessToken });
            agreements.reload();
          } catch (err) {
            Alert.alert('Could not delete agreement', err instanceof Error ? err.message : 'Try again');
          }
        },
      },
    ]);
  }

  return (
    <>
      <ErrorBanner message={agreements.error || properties.error || tenants.error} />
      <Card>
        <Field label="Property ID"><Input value={form.propertyId} onChangeText={(propertyId) => setForm({ ...form, propertyId })} placeholder="Paste property id" /></Field>
        <Field label="Tenant profile ID"><Input value={form.tenantId} onChangeText={(tenantId) => setForm({ ...form, tenantId })} placeholder="Paste tenant id" /></Field>
        <Field label="Start date"><Input value={form.startDate} onChangeText={(startDate) => setForm({ ...form, startDate })} placeholder="YYYY-MM-DD" /></Field>
        <Field label="End date"><Input value={form.endDate} onChangeText={(endDate) => setForm({ ...form, endDate })} placeholder="YYYY-MM-DD" /></Field>
        <Field label="PDF URL"><Input value={form.agreementPdfUrl} onChangeText={(agreementPdfUrl) => setForm({ ...form, agreementPdfUrl })} /></Field>
        <Button title="Save agreement" loading={saving} onPress={save} />
      </Card>
      <Card>
        <Text style={{ fontWeight: '900' }}>Reference IDs</Text>
        {properties.data?.map((property) => <Text key={property.id} selectable>{property.title}: {property.id}</Text>)}
        {tenants.data?.map((tenant) => <Text key={tenant.id} selectable>{tenant.fullName}: {tenant.id}</Text>)}
      </Card>
      {agreements.loading ? <Loading /> : null}
      {agreements.data?.length ? agreements.data.map((agreement) => (
        <Card key={agreement.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: '900' }}>{agreement.propertyTitle}</Text>
            <Badge label={agreement.active ? 'active' : 'inactive'} tone={agreement.active ? 'success' : 'warning'} />
          </View>
          <Row label="Tenant" value={agreement.tenantName} />
          <Row label="Period" value={`${agreement.startDate} to ${agreement.endDate}`} />
          {agreement.agreementPdfUrl ? <Button title="Open PDF" onPress={() => Linking.openURL(apiUrl(agreement.agreementPdfUrl))} /> : null}
          <Button title="Delete" variant="danger" onPress={() => remove(agreement.id)} />
        </Card>
      )) : <Empty title="No agreements yet" text="Attach an agreement period and PDF URL after adding a tenant." />}
    </>
  );
}

function Notifications() {
  const auth = useAuth();
  const notifications = useApiQuery<NotificationItem[]>('/notifications', auth.accessToken);

  async function markRead(id: string) {
    try {
      await request<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH', token: auth.accessToken });
      notifications.reload();
    } catch (err) {
      Alert.alert('Could not mark read', err instanceof Error ? err.message : 'Try again');
    }
  }

  return (
    <>
      <ErrorBanner message={notifications.error} />
      {notifications.loading ? <Loading /> : null}
      {notifications.data?.length ? notifications.data.map((item) => (
        <Card key={item.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, fontSize: 17, fontWeight: '900' }}>{item.title}</Text>
            <Badge label={item.readFlag ? 'read' : 'new'} tone={item.readFlag ? 'neutral' : 'warning'} />
          </View>
          <Text style={{ color: colors.muted, lineHeight: 20 }}>{item.message}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</Text>
          {!item.readFlag ? <Button title="Mark read" variant="secondary" onPress={() => markRead(item.id)} /> : null}
        </Card>
      )) : <Empty title="No notifications" text="Payment reminders and receipt updates appear here." />}
    </>
  );
}

function Settings() {
  const auth = useAuth();
  const me = useApiQuery<UserMe>('/users/me', auth.accessToken);
  const owner = useApiQuery<OwnerProfile | null>('/owners/me', auth.accessToken, auth.isOwnerMode);
  const [profile, setProfile] = useState({ fullName: '', mobile: '' });
  const [ownerForm, setOwnerForm] = useState<OwnerProfile>({});
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (me.data) setProfile({ fullName: me.data.fullName ?? '', mobile: me.data.mobile ?? '' });
  }, [me.data]);

  useEffect(() => {
    if (owner.data) setOwnerForm(owner.data);
  }, [owner.data]);

  async function saveProfile() {
    try {
      await request<UserMe>('/users/me', { method: 'PATCH', token: auth.accessToken, body: profile });
      me.reload();
      Alert.alert('Saved', 'Profile updated');
    } catch (err) {
      Alert.alert('Could not save profile', err instanceof Error ? err.message : 'Try again');
    }
  }

  async function saveOwnerProfile() {
    try {
      await request<OwnerProfile>('/owners/me', { method: 'PUT', token: auth.accessToken, body: ownerForm });
      owner.reload();
      Alert.alert('Saved', 'Owner profile updated');
    } catch (err) {
      Alert.alert('Could not save owner profile', err instanceof Error ? err.message : 'Try again');
    }
  }

  async function changePassword() {
    try {
      await request<void>('/users/me/password', { method: 'PATCH', token: auth.accessToken, body: password });
      setPassword({ currentPassword: '', newPassword: '' });
      Alert.alert('Saved', 'Password changed');
    } catch (err) {
      Alert.alert('Could not change password', err instanceof Error ? err.message : 'Try again');
    }
  }

  return (
    <>
      <ErrorBanner message={me.error || owner.error} />
      <Card>
        <Text style={{ fontSize: 18, fontWeight: '900' }}>Profile</Text>
        <Row label="Email" value={me.data?.email} />
        <Field label="Full name"><Input value={profile.fullName} onChangeText={(fullName) => setProfile({ ...profile, fullName })} placeholder={me.data?.fullName} /></Field>
        <Field label="Mobile"><Input value={profile.mobile} onChangeText={(mobile) => setProfile({ ...profile, mobile })} placeholder={me.data?.mobile || 'Mobile'} /></Field>
        <Button title="Save profile" onPress={saveProfile} />
      </Card>

      <Card>
        <Text style={{ fontSize: 18, fontWeight: '900' }}>Security</Text>
        <Field label="Current password"><Input value={password.currentPassword} onChangeText={(currentPassword) => setPassword({ ...password, currentPassword })} secureTextEntry /></Field>
        <Field label="New password"><Input value={password.newPassword} onChangeText={(newPassword) => setPassword({ ...password, newPassword })} secureTextEntry /></Field>
        <Button title="Change password" onPress={changePassword} />
      </Card>

      {auth.isOwnerMode ? (
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '900' }}>Owner business profile</Text>
          <Field label="Business name"><Input value={ownerForm.businessName ?? ''} onChangeText={(businessName) => setOwnerForm({ ...ownerForm, businessName })} placeholder={owner.data?.businessName} /></Field>
          <Field label="GST number"><Input value={ownerForm.gstNumber ?? ''} onChangeText={(gstNumber) => setOwnerForm({ ...ownerForm, gstNumber })} placeholder={owner.data?.gstNumber} /></Field>
          <Field label="Payout UPI ID"><Input value={ownerForm.payoutUpiId ?? ''} onChangeText={(payoutUpiId) => setOwnerForm({ ...ownerForm, payoutUpiId })} placeholder={owner.data?.payoutUpiId} /></Field>
          <Field label="Billing address"><Input value={ownerForm.billingAddress ?? ''} onChangeText={(billingAddress) => setOwnerForm({ ...ownerForm, billingAddress })} placeholder={owner.data?.billingAddress} multiline /></Field>
          <Button title="Save owner profile" onPress={saveOwnerProfile} />
        </Card>
      ) : null}

      <Button title="Logout" variant="danger" onPress={() => { auth.logout(); router.replace('/auth'); }} />
    </>
  );
}
