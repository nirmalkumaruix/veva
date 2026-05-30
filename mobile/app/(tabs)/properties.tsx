import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Badge, Button, Card, Empty, ErrorBanner, Field, Input, Loading, PageTitle, Row, Screen } from '@/components/veva-ui';
import { useAuth } from '@/context/auth';
import { formatCurrency, request } from '@/lib/api';
import type { Property, PropertyType } from '@/lib/types';
import { useApiQuery } from '@/lib/use-api';

const blank = {
  title: '',
  type: 'HOUSE' as PropertyType,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: 'Tamil Nadu',
  postalCode: '',
  rentAmount: '',
  advanceAmount: '',
  dueDay: '5',
};

export default function PropertiesScreen() {
  const auth = useAuth();
  const properties = useApiQuery<Property[]>('/properties/all', auth.accessToken, auth.isOwnerMode);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await request<Property>('/properties', {
        method: 'POST',
        token: auth.accessToken,
        body: {
          ...form,
          rentAmount: Number(form.rentAmount),
          advanceAmount: Number(form.advanceAmount),
          dueDay: Number(form.dueDay),
          occupied: false,
        },
      });
      setForm(blank);
      properties.reload();
    } catch (err) {
      Alert.alert('Could not save property', err instanceof Error ? err.message : 'Try again');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    Alert.alert('Delete property?', 'This will remove the property from your active list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await request<void>(`/properties/${id}`, { method: 'DELETE', token: auth.accessToken });
            properties.reload();
          } catch (err) {
            Alert.alert('Could not delete property', err instanceof Error ? err.message : 'Try again');
          }
        },
      },
    ]);
  }

  if (!auth.isOwnerMode) {
    return <Screen><Empty title="Owner access only" text="Tenants can view their assigned home from the dashboard." /></Screen>;
  }

  return (
    <Screen>
      <PageTitle title="Properties" subtitle="Rental inventory" />
      <ErrorBanner message={properties.error} />

      <Card>
        <Field label="Property title"><Input value={form.title} onChangeText={(title) => setForm({ ...form, title })} /></Field>
        <Field label="Type"><Input value={form.type} onChangeText={(type) => setForm({ ...form, type: type as PropertyType })} autoCapitalize="characters" /></Field>
        <Field label="Rent amount"><Input value={form.rentAmount} onChangeText={(rentAmount) => setForm({ ...form, rentAmount })} keyboardType="numeric" /></Field>
        <Field label="Advance amount"><Input value={form.advanceAmount} onChangeText={(advanceAmount) => setForm({ ...form, advanceAmount })} keyboardType="numeric" /></Field>
        <Field label="Address line 1"><Input value={form.addressLine1} onChangeText={(addressLine1) => setForm({ ...form, addressLine1 })} /></Field>
        <Field label="City"><Input value={form.city} onChangeText={(city) => setForm({ ...form, city })} /></Field>
        <Field label="State"><Input value={form.state} onChangeText={(state) => setForm({ ...form, state })} /></Field>
        <Field label="Postal code"><Input value={form.postalCode} onChangeText={(postalCode) => setForm({ ...form, postalCode })} keyboardType="number-pad" /></Field>
        <Field label="Due day"><Input value={form.dueDay} onChangeText={(dueDay) => setForm({ ...form, dueDay })} keyboardType="number-pad" /></Field>
        <Button title="Add property" loading={saving} onPress={save} />
      </Card>

      {properties.loading ? <Loading /> : null}
      {properties.data?.length ? properties.data.map((property) => (
        <Card key={property.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '900' }}>{property.title}</Text>
              <Text style={{ color: '#64748b' }}>{property.addressLine1}, {property.city}</Text>
            </View>
            <Badge label={property.occupied ? 'occupied' : 'vacant'} tone={property.occupied ? 'success' : 'warning'} />
          </View>
          <Row label="Rent" value={formatCurrency(property.rentAmount)} />
          <Row label="Advance" value={formatCurrency(property.advanceAmount)} />
          <Row label="Due day" value={property.dueDay} />
          <Button title="Delete" variant="danger" onPress={() => remove(property.id)} />
        </Card>
      )) : <Empty title="No properties yet" text="Add your first rental property." />}
    </Screen>
  );
}
