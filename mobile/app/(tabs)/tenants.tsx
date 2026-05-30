import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button, Card, Empty, ErrorBanner, Field, Input, Loading, PageTitle, Row, Screen } from '@/components/veva-ui';
import { useAuth } from '@/context/auth';
import { formatCurrency, request, today } from '@/lib/api';
import type { Property, Tenant } from '@/lib/types';
import { useApiQuery } from '@/lib/use-api';

const blank = {
  email: '',
  fullName: '',
  mobile: '',
  propertyId: '',
  emergencyContact: '',
  kycDocumentUrl: '',
  moveInDate: today(),
};

export default function TenantsScreen() {
  const auth = useAuth();
  const tenants = useApiQuery<Tenant[]>('/tenants', auth.accessToken, auth.isOwnerMode);
  const properties = useApiQuery<Property[]>('/properties/all', auth.accessToken, auth.isOwnerMode);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await request<Tenant>('/tenants', {
        method: 'POST',
        token: auth.accessToken,
        body: form,
      });
      setForm(blank);
      tenants.reload();
      properties.reload();
    } catch (err) {
      Alert.alert('Could not save tenant', err instanceof Error ? err.message : 'Try again');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    Alert.alert('Remove tenant?', 'This will remove the tenant assignment.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await request<void>(`/tenants/${id}`, { method: 'DELETE', token: auth.accessToken });
            tenants.reload();
            properties.reload();
          } catch (err) {
            Alert.alert('Could not remove tenant', err instanceof Error ? err.message : 'Try again');
          }
        },
      },
    ]);
  }

  if (!auth.isOwnerMode) {
    return <Screen><Empty title="Owner access only" text="Tenant details appear in your dashboard and payments." /></Screen>;
  }

  return (
    <Screen>
      <PageTitle title="Tenants" subtitle="People and KYC" />
      <ErrorBanner message={tenants.error || properties.error} />

      <Card>
        <Field label="Full name"><Input value={form.fullName} onChangeText={(fullName) => setForm({ ...form, fullName })} /></Field>
        <Field label="Email"><Input value={form.email} onChangeText={(email) => setForm({ ...form, email })} autoCapitalize="none" keyboardType="email-address" /></Field>
        <Field label="Mobile"><Input value={form.mobile} onChangeText={(mobile) => setForm({ ...form, mobile })} keyboardType="phone-pad" /></Field>
        <Field label="Property ID"><Input value={form.propertyId} onChangeText={(propertyId) => setForm({ ...form, propertyId })} placeholder="Paste property id from list below" /></Field>
        <Field label="Emergency contact"><Input value={form.emergencyContact} onChangeText={(emergencyContact) => setForm({ ...form, emergencyContact })} /></Field>
        <Field label="KYC document URL"><Input value={form.kycDocumentUrl} onChangeText={(kycDocumentUrl) => setForm({ ...form, kycDocumentUrl })} /></Field>
        <Field label="Move-in date"><Input value={form.moveInDate} onChangeText={(moveInDate) => setForm({ ...form, moveInDate })} placeholder="YYYY-MM-DD" /></Field>
        <Button title="Invite tenant" loading={saving} onPress={save} />
      </Card>

      <Card>
        <Text style={{ fontWeight: '900' }}>Available property IDs</Text>
        {properties.data?.map((property) => (
          <View key={property.id}>
            <Text style={{ fontWeight: '800' }}>{property.title}</Text>
            <Text selectable style={{ color: '#64748b' }}>{property.id}</Text>
          </View>
        ))}
      </Card>

      {tenants.loading ? <Loading /> : null}
      {tenants.data?.length ? tenants.data.map((tenant) => (
        <Card key={tenant.id}>
          <Text style={{ fontSize: 18, fontWeight: '900' }}>{tenant.fullName}</Text>
          <Text style={{ color: '#64748b' }}>{tenant.email} - {tenant.mobile || 'No mobile'}</Text>
          <Row label="Assigned property" value={tenant.propertyTitle} />
          <Row label="Rent" value={formatCurrency(tenant.rentAmount)} />
          <Row label="Advance" value={formatCurrency(tenant.advanceAmount)} />
          <Row label="Tenant user ID" value={tenant.userId} />
          <Button title="Remove" variant="danger" onPress={() => remove(tenant.id)} />
        </Card>
      )) : <Empty title="No tenants yet" text="Invite a tenant and assign them to a property." />}
    </Screen>
  );
}
