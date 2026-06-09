'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  HiOutlineCog6Tooth,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  const { user, logout, refetchUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security'>('general');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const passwordRequirements = [
    { label: 'At least 6 characters', met: passwords.new.length >= 6 },
    { label: 'Contains a number', met: /\d/.test(passwords.new) },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(passwords.new) },
  ];

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, bio: formData.bio }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Profile saved successfully');
        await refetchUser(); // refresh user in context so navbar updates
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current) { toast.error('Current password is required'); return; }
    if (passwords.new.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return; }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Password updated successfully');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      console.error('Failed to update password:', err);
      toast.error('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: HiOutlineUser },
    { id: 'notifications' as const, label: 'Notifications', icon: HiOutlineBell },
    { id: 'security' as const, label: 'Security', icon: HiOutlineShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
          <HiOutlineCog6Tooth className="text-cyan-600 dark:text-cyan-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage your account and preferences
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="space-y-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* General Tab */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Theme */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Theme</p>
                  <div className="flex gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: HiOutlineSun },
                      { id: 'dark', label: 'Dark', icon: HiOutlineMoon },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setTheme(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          theme === id
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon size={18} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Bio
                    </label>
                    <Input
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} loading={savingProfile} className="w-full">
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-3">
                {['Task reminders', 'Deadline alerts', 'Comments and mentions', 'Email digests'].map((pref) => (
                  <label key={pref} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-indigo-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{pref}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showCurrentPw ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showNewPw ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                      </button>
                    </div>
                    {passwords.new && (
                      <div className="mt-2 space-y-1">
                        {passwordRequirements.map(({ label, met }) => (
                          <div key={label} className="flex items-center gap-2 text-xs">
                            <HiOutlineCheckCircle
                              size={13}
                              className={met ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}
                            />
                            <span className={met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}>
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      className={
                        passwords.confirm && passwords.confirm !== passwords.new
                          ? 'border-red-400 dark:border-red-600'
                          : ''
                      }
                    />
                    {passwords.confirm && passwords.confirm !== passwords.new && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    loading={savingPassword}
                    disabled={
                      !passwords.current ||
                      !passwords.new ||
                      !passwords.confirm ||
                      passwords.new !== passwords.confirm
                    }
                    className="w-full"
                  >
                    Update Password
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                  Log out from all devices
                </p>
                <Button
                  onClick={() => logout()}
                  variant="secondary"
                  className="text-red-600 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Logout All Devices
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
