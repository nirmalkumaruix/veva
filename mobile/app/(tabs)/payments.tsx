import { useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';

import { Badge, Button, Card, Empty, ErrorBanner, Field, Input, Loading, PageTitle, Row, Screen } from '@/components/veva-ui';
import { useAuth } from '@/context/auth';
import { formatCurrency, request, today } from '@/lib/api';
import type { PageResponse, Payment, PaymentType, Property, Tenant } from '@/lib/types';
import { useApiQuery } from '@/lib/use-api';

const paymentTypes: PaymentType[] = ['RENT', 'ADVANCE', 'MAINTENANCE', 'EB_BILL', 'WATER_BILL'];

function statusTone(status?: string) {
  if (status === 'SUCCESS') return 'success' as const;
  if (status === 'FAILED') return 'danger' as const;
  return 'warning' as const;
}

export default function PaymentsScreen() {
  const auth = useAuth();
  const payments = useApiQuery<PageResponse<Payment>>('/payments', auth.accessToken);
  const properties = useApiQuery<Property[]>('/properties/all', auth.accessToken, auth.isOwnerMode);
  const tenants = useApiQuery<Tenant[]>('/tenants', auth.accessToken, auth.isOwnerMode);
  const tenantProfile = useApiQuery<Tenant>('/tenants/me', auth.accessToken, !auth.isOwnerMode);
  const [form, setForm] = useState({ propertyId: '', payerId: '', type: 'RENT' as PaymentType, amount: '', dueDate: today() });
  const [saving, setSaving] = useState(false);

  async function createPayment() {
    setSaving(true);
    try {
      await request<Payment>('/payments', {
        method: 'POST',
        token: auth.accessToken,
        body: {
          propertyId: auth.isOwnerMode ? form.propertyId : tenantProfile.data?.propertyId,
          payerId: auth.isOwnerMode ? form.payerId || undefined : undefined,
          type: form.type,
          amount: Number(form.amount),
          dueDate: form.dueDate,
        },
      });
      setForm({ propertyId: '', payerId: '', type: 'RENT', amount: '', dueDate: today() });
      payments.reload();
    } catch (err) {
      Alert.alert('Could not create payment', err instanceof Error ? err.message : 'Try again');
    } finally {
      setSaving(false);
    }
  }

  async function paymentAction(id: string, action: 'success' | 'reminders') {
    try {
      if (action === 'reminders') {
        await request<Payment>(`/payments/${id}/reminders`, { method: 'POST', token: auth.accessToken });
      } else {
        await request<Payment>(`/payments/${id}/success`, { method: 'PATCH', token: auth.accessToken });
      }
      payments.reload();
    } catch (err) {
      Alert.alert('Payment update failed', err instanceof Error ? err.message : 'Try again');
    }
  }

  return (
    <Screen>
      <PageTitle title="Payments" subtitle="Rent collection" />
      <ErrorBanner message={payments.error || properties.error || tenants.error || tenantProfile.error} />

      <Card>
        {auth.isOwnerMode ? (
          <>
            <Field label="Property ID"><Input value={form.propertyId} onChangeText={(propertyId) => setForm({ ...form, propertyId })} placeholder="Paste property id" /></Field>
            <Field label="Tenant user ID"><Input value={form.payerId} onChangeText={(payerId) => setForm({ ...form, payerId })} placeholder="Optional, assigned tenant used if blank" /></Field>
          </>
        ) : (
          <Row label="Property" value={tenantProfile.data?.propertyTitle ?? 'Loading'} />
        )}
        <Field label="Type"><Input value={form.type} onChangeText={(type) => setForm({ ...form, type: type as PaymentType })} autoCapitalize="characters" placeholder={paymentTypes.join(', ')} /></Field>
        <Field label="Amount"><Input value={form.amount} onChangeText={(amount) => setForm({ ...form, amount })} keyboardType="numeric" /></Field>
        <Field label="Due date"><Input value={form.dueDate} onChangeText={(dueDate) => setForm({ ...form, dueDate })} placeholder="YYYY-MM-DD" /></Field>
        <Button title="Create request" loading={saving} onPress={createPayment} />
      </Card>

      {auth.isOwnerMode ? (
        <Card>
          <Text style={{ fontWeight: '900' }}>Reference IDs</Text>
          {properties.data?.map((property) => <Text key={property.id} selectable>{property.title}: {property.id}</Text>)}
          {tenants.data?.map((tenant) => <Text key={tenant.userId} selectable>{tenant.fullName}: {tenant.userId}</Text>)}
        </Card>
      ) : null}

      {payments.loading ? <Loading /> : null}
      {payments.data?.content?.length ? payments.data.content.map((payment) => (
        <Card key={payment.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '900' }}>{payment.propertyTitle}</Text>
              <Text style={{ color: '#64748b' }}>{payment.payerName} - {payment.type.replace('_', ' ')}</Text>
            </View>
            <Badge label={payment.status.toLowerCase()} tone={statusTone(payment.status)} />
          </View>
          <Row label="Amount" value={formatCurrency(payment.amount)} />
          <Row label="Due date" value={payment.dueDate} />
          {payment.upiIntentUrl ? <Button title="Open UPI app" variant="secondary" onPress={() => Linking.openURL(payment.upiIntentUrl!)} /> : null}
          {payment.status !== 'SUCCESS' ? <Button title="Mark paid" onPress={() => paymentAction(payment.id, 'success')} /> : null}
          {auth.isOwnerMode ? <Button title="Send reminder" variant="secondary" onPress={() => paymentAction(payment.id, 'reminders')} /> : null}
        </Card>
      )) : <Empty title="No payments yet" text="Create a rent, advance, utility, or maintenance request." />}
    </Screen>
  );
}
