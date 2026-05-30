import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

export const colors = {
  bg: '#f6f7f9',
  ink: '#111827',
  muted: '#64748b',
  line: '#e2e8f0',
  card: '#ffffff',
  primary: '#0f766e',
  primaryDark: '#115e59',
  danger: '#dc2626',
  amber: '#b45309',
  green: '#047857',
};

export function Screen({ children }: PropsWithChildren) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {children}
    </ScrollView>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Card>
  );
}

export function Field({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor="#94a3b8" {...props} style={[styles.input, props.style]} />;
}

export function Button({
  title,
  onPress,
  loading,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        variant === 'ghost' && styles.ghostButton,
        (disabled || loading) && styles.disabled,
      ]}>
      {loading ? <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.ink : '#fff'} /> : <Text style={[
        styles.buttonText,
        (variant === 'secondary' || variant === 'ghost') && styles.secondaryButtonText,
      ]}>{title}</Text>}
    </Pressable>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  return (
    <View style={[
      styles.badge,
      tone === 'success' && styles.successBadge,
      tone === 'warning' && styles.warningBadge,
      tone === 'danger' && styles.dangerBadge,
    ]}>
      <Text style={[
        styles.badgeText,
        tone === 'success' && styles.successBadgeText,
        tone === 'warning' && styles.warningBadgeText,
        tone === 'danger' && styles.dangerBadgeText,
      ]}>{label}</Text>
    </View>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <Card>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.subtitle}>{text}</Text> : null}
    </Card>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

export function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '-'}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenContent: {
    gap: 14,
    padding: 16,
    paddingBottom: 36,
  },
  titleWrap: {
    gap: 4,
    marginBottom: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  statValue: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '900',
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: colors.line,
    borderWidth: 1,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButtonText: {
    color: colors.ink,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  successBadge: {
    backgroundColor: '#dcfce7',
  },
  successBadgeText: {
    color: colors.green,
  },
  warningBadge: {
    backgroundColor: '#fef3c7',
  },
  warningBadgeText: {
    color: colors.amber,
  },
  dangerBadge: {
    backgroundColor: '#fee2e2',
  },
  dangerBadgeText: {
    color: colors.danger,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '700',
  },
  loading: {
    alignItems: 'center',
    gap: 10,
    padding: 20,
  },
  row: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    gap: 4,
    paddingTop: 10,
  },
  rowLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  rowValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
});
