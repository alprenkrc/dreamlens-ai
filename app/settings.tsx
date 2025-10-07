import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  Moon, 
  TrendingUp, 
  Shield, 
  Settings, 
  Heart, 
  HelpCircle,
  Info,
  LogOut
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dreamReminders, setDreamReminders] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/account-choice');
          }
        },
      ]
    );
  };

  const showPrivacyInfo = () => {
    Alert.alert(
      'Privacy & Security',
      'Your dreams are encrypted and stored securely. We never share your personal data with third parties.',
      [{ text: 'OK' }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'Help & Support',
      'Need help? Contact us at support@dreamlens.app or visit our FAQ section.',
      [{ text: 'OK' }]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About DreamLens',
      'Version 1.0.0\n\nDreamLens helps you explore and understand your dreams through AI-powered analysis and beautiful visualizations.',
      [{ text: 'OK' }]
    );
  };

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          title: 'Push Notifications',
          subtitle: 'Get notified about new features',
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
        {
          icon: Moon,
          title: 'Dream Reminders',
          subtitle: 'Daily reminders to record dreams',
          type: 'switch',
          value: dreamReminders,
          onValueChange: setDreamReminders,
        },
        {
          icon: TrendingUp,
          title: 'Weekly Insights',
          subtitle: 'Receive your dream analysis reports',
          type: 'switch',
          value: weeklyInsights,
          onValueChange: setWeeklyInsights,
        },
      ],
    },
    {
      title: 'More',
      items: [
        {
          icon: Heart,
          title: 'Community',
          subtitle: 'Connect with other dreamers',
          type: 'action',
          onPress: () => Alert.alert('Coming Soon', 'Community features will be available soon!'),
        },
        {
          icon: Shield,
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          type: 'action',
          onPress: showPrivacyInfo,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          type: 'action',
          onPress: showHelp,
        },
        {
          icon: Info,
          title: 'About',
          subtitle: 'App version and information',
          type: 'action',
          onPress: showAbout,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => (
    <View key={index} style={styles.settingCard}>
      <BlurView intensity={20} style={styles.settingBlur}>
        <TouchableOpacity 
          style={styles.settingContent}
          onPress={item.type === 'action' ? item.onPress : undefined}
          disabled={item.type === 'switch'}
        >
          <item.icon size={20} color="#A78BFA" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          {item.type === 'switch' ? (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#374151', true: '#A78BFA' }}
              thumbColor={item.value ? '#FFFFFF' : '#9CA3AF'}
            />
          ) : (
            <ArrowLeft size={16} color="#9CA3AF" style={{ transform: [{ rotate: '180deg' }] }} />
          )}
        </TouchableOpacity>
      </BlurView>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0F0A2E', '#2D1B69', '#6B46C1']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Settings Sections */}
        <View style={styles.content}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
            </View>
          ))}

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <BlurView intensity={20} style={styles.logoutBlur}>
                <View style={styles.logoutContent}>
                  <LogOut size={20} color="#EF4444" />
                  <Text style={styles.logoutText}>Sign Out</Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  settingCard: {
    marginBottom: 12,
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingBlur: {
    padding: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  logoutButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  logoutBlur: {
    padding: 1,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 15,
  },
  bottomPadding: {
    height: 20,
  },
});
