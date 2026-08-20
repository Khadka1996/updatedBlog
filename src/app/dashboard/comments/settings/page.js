'use client';

import { useEffect, useState } from 'react';
import {
  FaBell,
  FaCheck,
  FaComments,
  FaFilter,
  FaLink,
  FaSave,
  FaShieldAlt,
  FaUndo,
} from 'react-icons/fa';

const STORAGE_KEY = 'everestkit.comment-settings';

const defaultSettings = {
  commentsEnabled: true,
  requireApproval: false,
  allowReplies: true,
  allowLinks: false,
  notifyOnReport: true,
  notifyOnNewComment: false,
  autoMarkSpam: true,
  minimumReportCount: 3,
  maxCommentLength: 2000,
};

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-teal-300">
      <span>
        <span className="block text-sm font-semibold text-gray-900">{label}</span>
        <span className="mt-1 block text-sm text-gray-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-gray-300 transition peer-checked:bg-teal-600 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}

export default function CommentSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    } catch {
      // Use defaults when stored settings are unavailable or invalid.
    }
  }, []);

  const updateSetting = (key, value) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = (event) => {
    event.preventDefault();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    window.localStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  };

  return (
    <section className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <FaComments aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comment Settings</h1>
              <p className="mt-1 text-sm text-gray-500">Configure how comments and moderation alerts should behave.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <FaUndo aria-hidden="true" />
            Reset defaults
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          These settings are currently saved in this browser only. Server-side settings require a backend preferences endpoint.
        </div>

        <form onSubmit={saveSettings} className="mt-6 space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-teal-600" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-900">Comment moderation</h2>
            </div>
            <div className="space-y-3">
              <Toggle
                checked={settings.commentsEnabled}
                onChange={(value) => updateSetting('commentsEnabled', value)}
                label="Enable comments"
                description="Allow readers to post comments on published blog articles."
              />
              <Toggle
                checked={settings.requireApproval}
                onChange={(value) => updateSetting('requireApproval', value)}
                label="Require approval"
                description="Hold new comments for review before they appear publicly."
              />
              <Toggle
                checked={settings.allowReplies}
                onChange={(value) => updateSetting('allowReplies', value)}
                label="Allow replies"
                description="Let readers reply to existing comments."
              />
              <Toggle
                checked={settings.allowLinks}
                onChange={(value) => updateSetting('allowLinks', value)}
                label="Allow links in comments"
                description="Allow clickable links in user-submitted comment content."
              />
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FaFilter className="text-teal-600" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-900">Spam protection</h2>
            </div>
            <div className="space-y-3">
              <Toggle
                checked={settings.autoMarkSpam}
                onChange={(value) => updateSetting('autoMarkSpam', value)}
                label="Automatically mark repeated reports as spam"
                description="Flag a comment after it reaches the selected report threshold."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Report threshold
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.minimumReportCount}
                    onChange={(event) => updateSetting('minimumReportCount', Number(event.target.value))}
                    className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Maximum comment length
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={settings.maxCommentLength}
                    onChange={(event) => updateSetting('maxCommentLength', Number(event.target.value))}
                    className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FaBell className="text-teal-600" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-3">
              <Toggle
                checked={settings.notifyOnReport}
                onChange={(value) => updateSetting('notifyOnReport', value)}
                label="Notify me about reported comments"
                description="Show moderation alerts when readers report a comment."
              />
              <Toggle
                checked={settings.notifyOnNewComment}
                onChange={(value) => updateSetting('notifyOnNewComment', value)}
                label="Notify me about new comments"
                description="Show an alert whenever a new comment is submitted."
              />
            </div>
          </section>

          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-500">
              <FaLink className="mr-1 inline text-gray-400" aria-hidden="true" />
              Changes affect this browser only until server-side preferences are connected.
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              {saved ? <FaCheck aria-hidden="true" /> : <FaSave aria-hidden="true" />}
              {saved ? 'Saved' : 'Save settings'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
