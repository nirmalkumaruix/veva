import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, ErrorBanner, Field, Input, Screen, colors } from '@/components/veva-ui';
import { useAuth } from '@/context/auth';
import { apiErrorMessage } from '@/lib/api';

export default function AuthScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('owner@veetu.test');
  const [password, setPassword] = useState('Password@123');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'OWNER' | 'TENANT'>('OWNER');

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await auth.login(email, password);
      } else {
        await auth.register({ email, password, fullName, mobile, role });
      }
      router.replace('/(tabs)');
    } catch (err) {
      setError(apiErrorMessage(err, mode === 'login' ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Screen>
        <View style={styles.hero}>
          <Text style={styles.brand}>VeVa</Text>
          <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
          <Text style={styles.subtitle}>Manage rent, tenants, receipts, and reminders from your phone.</Text>
        </View>

        <Card>
          <View style={styles.segment}>
            <Pressable onPress={() => setMode('login')} style={[styles.segmentButton, mode === 'login' && styles.segmentActive]}>
              <Text style={[styles.segmentText, mode === 'login' && styles.segmentActiveText]}>Login</Text>
            </Pressable>
            <Pressable onPress={() => setMode('register')} style={[styles.segmentButton, mode === 'register' && styles.segmentActive]}>
              <Text style={[styles.segmentText, mode === 'register' && styles.segmentActiveText]}>Register</Text>
            </Pressable>
          </View>

          <ErrorBanner message={error} />

          {mode === 'register' ? (
            <>
              <Field label="Full name">
                <Input value={fullName} onChangeText={setFullName} autoCapitalize="words" />
              </Field>
              <Field label="Mobile">
                <Input value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
              </Field>
              <Field label="Role">
                <View style={styles.roleRow}>
                  <Button title="Owner" variant={role === 'OWNER' ? 'primary' : 'secondary'} onPress={() => setRole('OWNER')} />
                  <Button title="Tenant" variant={role === 'TENANT' ? 'primary' : 'secondary'} onPress={() => setRole('TENANT')} />
                </View>
              </Field>
            </>
          ) : null}

          <Field label="Email">
            <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </Field>
          <Field label="Password">
            <Input value={password} onChangeText={setPassword} secureTextEntry />
          </Field>
          <Button title={mode === 'login' ? 'Login' : 'Create account'} loading={loading} onPress={submit} />
        </Card>

        <Card>
          <Text style={styles.demoTitle}>Demo users</Text>
          <Text style={styles.demoText}>owner@veetu.test, tenant@veetu.test, admin@veetu.test</Text>
          <Text style={styles.demoText}>Password: Password@123</Text>
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    paddingVertical: 24,
  },
  brand: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  segment: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 7,
    flex: 1,
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: '#fff',
  },
  segmentText: {
    color: colors.muted,
    fontWeight: '800',
  },
  segmentActiveText: {
    color: colors.ink,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoTitle: {
    color: colors.ink,
    fontWeight: '900',
  },
  demoText: {
    color: colors.muted,
    lineHeight: 20,
  },
});
