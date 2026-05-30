import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Badge, Button, Card, Empty, ErrorBanner, Loading, PageTitle, Screen, StatCard, styles } from '@/components/veva-ui';
import { useAuth } from '@/context/auth';
import { formatCurrency } from '@/lib/api';
import type { OwnerDashboardData, PageResponse, Payment, TenantDashboardData } from '@/lib/types';
import { useApiQuery } from '@/lib/use-api';

function statusTone(status?: string) {
  if (status === 'SUCCESS' || status === 'CURRENT') return 'success' as const;
  if (status === 'FAILED') return 'danger' as const;
  return 'warning' as const;
}

export default function DashboardScreen() {
  const auth = useAuth();

  if (auth.isOwnerMode) return <OwnerDashboard />;
  return <TenantDashboard />;
}

function OwnerDashboard() {
  const auth = useAuth();
  const dashboard = useApiQuery<OwnerDashboardData>('/dashboard/owner', auth.accessToken);

  return (
    <Screen>
      <PageTitle title="Owner Dashboard" subtitle={`Welcome${auth.fullName ? `, ${auth.fullName}` : ''}`} />
      <ErrorBanner message={dashboard.error} />
      {dashboard.loading ? <Loading /> : null}
      <View style={{ gap: 12 }}>
        <StatCard label="Total properties" value={dashboard.data?.totalProperties ?? 0} hint={`${dashboard.data?.occupied ?? 0} occupied`} />
        <StatCard label="Total tenants" value={dashboard.data?.totalTenants ?? 0} hint={`${dashboard.data?.vacant ?? 0} vacant units`} />
        <StatCard label="Pending rents" value={formatCurrency(dashboard.data?.pendingRents)} />
        <StatCard label="Monthly revenue" value={formatCurrency(dashboard.data?.monthlyRevenue)} hint={`${dashboard.data?.collectionRate ?? 100}% collection rate`} />
      </View>

      <Card>
        <Text style={styles.emptyTitle}>Recent payments</Text>
        {dashboard.data?.recentPayments?.length ? dashboard.data.recentPayments.slice(0, 6).map((payment) => (
          <View key={payment.id} style={{ gap: 6 }}>
            <Text style={{ fontWeight: '900' }}>{payment.propertyTitle}</Text>
            <Text style={styles.subtitle}>{payment.payerName} - {payment.dueDate}</Text>
            <View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '900' }}>{formatCurrency(payment.amount)}</Text>
              <Badge label={payment.status.toLowerCase()} tone={statusTone(payment.status)} />
            </View>
          </View>
        )) : <Empty title="No payments yet" text="Create a rent request from Payments." />}
      </Card>

      <Button title="Add property" onPress={() => router.push('/properties')} />
    </Screen>
  );
}

function TenantDashboard() {
  const auth = useAuth();
  const summary = useApiQuery<TenantDashboardData>('/dashboard/tenant', auth.accessToken);
  const payments = useApiQuery<PageResponse<Payment>>('/payments?size=5', auth.accessToken);

  return (
    <Screen>
      <PageTitle title="Tenant Dashboard" subtitle={summary.data?.propertyTitle ?? 'Rental home'} />
      <ErrorBanner message={summary.error || payments.error} />
      {summary.loading ? <Loading /> : null}
      <View style={{ gap: 12 }}>
        <StatCard label="Rent status" value={summary.data?.status ?? 'CURRENT'} />
        <StatCard label="Next due" value={`${summary.data?.nextDueInDays ?? 0} days`} hint={summary.data?.nextDueDate} />
        <StatCard label="Pending amount" value={formatCurrency(summary.data?.pendingAmount)} />
        <StatCard label="Monthly rent" value={formatCurrency(summary.data?.rentAmount)} />
      </View>

      <Card>
        <Text style={styles.emptyTitle}>Latest activity</Text>
        {payments.data?.content?.length ? payments.data.content.map((payment) => (
          <View key={payment.id} style={{ gap: 6 }}>
            <Text style={{ fontWeight: '900' }}>{payment.propertyTitle}</Text>
            <Text style={styles.subtitle}>{payment.type.replace('_', ' ')} due {payment.dueDate}</Text>
            <View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '900' }}>{formatCurrency(payment.amount)}</Text>
              <Badge label={payment.status.toLowerCase()} tone={statusTone(payment.status)} />
            </View>
          </View>
        )) : <Empty title="No payment requests yet" />}
      </Card>

      <Button title="View payments" onPress={() => router.push('/payments')} />
    </Screen>
  );
}
