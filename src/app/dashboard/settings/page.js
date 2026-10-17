'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Tabs, Card, Switch, Input, InputNumber, Button, Alert, Space, Spin, Tag, message,
} from 'antd';
import {
  CodeOutlined, NotificationOutlined, SaveOutlined, ToolOutlined, CheckCircleFilled,
  CloseCircleFilled, ReloadOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

const CODE_BLOCKS = [
  {
    key: 'head',
    title: 'Header code (inside <head>)',
    help: 'Site verification tags, analytics (Google Analytics, Facebook Pixel), ad network verification scripts.',
    placeholder: '<meta name="monetag" content="...">\n<script async src="https://..."></script>',
  },
  {
    key: 'bodyStart',
    title: 'Body start (right after <body>)',
    help: 'Tag managers or scripts that ask to be placed immediately after the opening <body> tag.',
    placeholder: '<!-- Google Tag Manager (noscript) --> ...',
  },
  {
    key: 'sidebar',
    title: 'Sidebar code',
    help: 'Shown at the bottom of the blog article sidebar. Good for widgets or a fixed network unit.',
    placeholder: '<div>...widget or ad code...</div>',
  },
  {
    key: 'footer',
    title: 'Footer code (before </body>)',
    help: 'Chat widgets, popunder/social-bar scripts, anything that should load last.',
    placeholder: '<script src="https://..."></script>',
  },
  {
    key: 'customCss',
    title: 'Custom CSS',
    help: 'Plain CSS — no <style> tag needed. Applied to every public page.',
    placeholder: '.my-class { color: #174fa2; }',
  },
  {
    key: 'customJs',
    title: 'Custom JavaScript',
    help: 'Plain JavaScript — no <script> tag needed. Runs once after the page loads; errors are caught so they cannot break the site.',
    placeholder: "console.log('Hello from Everestkit');",
  },
];

const AD_SWITCHES = [
  { key: 'enabled', label: 'Show ads on the website', help: 'Master switch. Off hides every ad (managed ads and AdSense) instantly.' },
  { key: 'showOnMobile', label: 'Show ads on mobile', help: 'Turn off to keep the mobile experience ad-free.' },
  { key: 'hideForAdmins', label: 'Hide ads from admins', help: 'Browsers where an admin is signed in to the dashboard see no ads and don’t inflate view counts.' },
  { key: 'showAdLabel', label: 'Show “Advertisement” label', help: 'Small label above each ad — recommended by most networks.' },
  { key: 'adsenseFallback', label: 'Use Google AdSense when a slot has no ad', help: 'Only works once the AdSense keys are set in the frontend .env.' },
  { key: 'stickyDismissible', label: 'Visitors can close the sticky footer ad', help: 'Adds a × button; closed for the rest of the visit.' },
];

function SettingsInner() {
  const [msg, msgHolder] = message.useMessage();
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'code');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [health, setHealth] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', { credentials: 'include', cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not load settings');
      setSettings({
        ...data.settings,
        ads: { ...data.settings.ads, excludedPaths: (data.settings.ads.excludedPaths || []).join('\n') },
      });
      setDirty(false);
    } catch (err) {
      msg.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [msg]);

  const loadHealth = useCallback(async () => {
    setHealth(null);
    try {
      const res = await fetch('/api/convert/health', { cache: 'no-store' });
      setHealth(await res.json());
    } catch {
      setHealth({ error: true });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === 'system' && !health) loadHealth(); }, [tab, health, loadHealth]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onUnload = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  const setCode = (key, patch) => {
    setSettings((s) => ({ ...s, codeInjection: { ...s.codeInjection, [key]: { ...s.codeInjection[key], ...patch } } }));
    setDirty(true);
  };
  const setAds = (patch) => {
    setSettings((s) => ({ ...s, ads: { ...s.ads, ...patch } }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeInjection: settings.codeInjection,
          ads: { ...settings.ads, excludedPaths: settings.ads.excludedPaths.split('\n') },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not save settings');
      setSettings({
        ...data.settings,
        ads: { ...data.settings.ads, excludedPaths: (data.settings.ads.excludedPaths || []).join('\n') },
      });
      setDirty(false);
      msg.success('Settings saved — live on the website within a minute');
    } catch (err) {
      msg.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changeTab = (key) => {
    setTab(key);
    router.replace(`/dashboard/settings?tab=${key}`, { scroll: false });
  };

  if (loading || !settings) {
    return <div className="flex justify-center py-20">{msgHolder}<Spin size="large" /></div>;
  }

  const saveBar = (
    <div className="sticky bottom-0 z-10 -mx-1 mt-4 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/95 px-1 py-3 backdrop-blur">
      {dirty && <span className="text-sm text-orange-600">You have unsaved changes</span>}
      <Button onClick={load} disabled={saving}>Discard</Button>
      <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={!dirty} onClick={save} className="bg-[#174fa2]">
        Save settings
      </Button>
    </div>
  );

  const codeTab = (
    <div className="space-y-4">
      <Alert
        type="warning"
        showIcon
        message="Code here runs on every visitor’s browser"
        description="Only paste code from services you trust. Injected code never runs inside the dashboard, so a broken snippet can always be fixed from here."
      />
      {CODE_BLOCKS.map((block) => {
        const value = settings.codeInjection?.[block.key] || { enabled: false, code: '' };
        return (
          <Card
            key={block.key}
            size="small"
            title={<span className="font-semibold">{block.title}</span>}
            extra={
              <Space>
                <span className="text-xs text-gray-500">{value.enabled ? 'Enabled' : 'Disabled'}</span>
                <Switch checked={value.enabled} onChange={(enabled) => setCode(block.key, { enabled })} />
              </Space>
            }
          >
            <p className="text-sm text-gray-500 mb-2">{block.help}</p>
            <TextArea
              value={value.code}
              onChange={(e) => setCode(block.key, { code: e.target.value })}
              placeholder={block.placeholder}
              autoSize={{ minRows: 4, maxRows: 18 }}
              className="font-mono text-xs"
              spellCheck={false}
              maxLength={50000}
              showCount
            />
          </Card>
        );
      })}
      {saveBar}
    </div>
  );

  const adsTab = (
    <div className="space-y-4">
      <Card size="small" title="Display">
        <div className="divide-y divide-gray-100">
          {AD_SWITCHES.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-4 py-3">
              <div>
                <div className="font-medium text-gray-800">{item.label}</div>
                <div className="text-sm text-gray-500">{item.help}</div>
              </div>
              <Switch checked={settings.ads[item.key]} onChange={(v) => setAds({ [item.key]: v })} />
            </div>
          ))}
        </div>
      </Card>

      <Card size="small" title="Popup ads">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="font-medium text-gray-800 mb-1">Show popup after</div>
            <InputNumber min={0} max={600} value={settings.ads.popupDelaySeconds} onChange={(v) => setAds({ popupDelaySeconds: v ?? 0 })} suffix="seconds" className="w-full" />
          </div>
          <div>
            <div className="font-medium text-gray-800 mb-1">Show the popup to the same visitor at most once every</div>
            <InputNumber min={0} max={720} value={settings.ads.popupFrequencyHours} onChange={(v) => setAds({ popupFrequencyHours: v ?? 0 })} suffix="hours" className="w-full" />
            <div className="text-xs text-gray-500 mt-1">0 = on every page load (not recommended).</div>
          </div>
        </div>
      </Card>

      <Card size="small" title="Pages without ads">
        <p className="text-sm text-gray-500 mb-2">
          One path per line. End with * to match everything below it, e.g. <code>/tools/calculator</code> or <code>/privacy-policy*</code>.
          The dashboard and login pages never show ads.
        </p>
        <TextArea
          value={settings.ads.excludedPaths}
          onChange={(e) => setAds({ excludedPaths: e.target.value })}
          autoSize={{ minRows: 3, maxRows: 10 }}
          className="font-mono text-xs"
          placeholder={'/contact\n/privacy-policy*'}
        />
      </Card>

      <Card
        size="small"
        title="ads.txt"
        extra={<a href="/ads.txt" target="_blank" rel="noreferrer" className="text-sm">View /ads.txt</a>}
      >
        <p className="text-sm text-gray-500 mb-2">
          Ad networks (Adsterra, Media.net, AdSense ...) give you lines to add here. They verify your site with it before paying out.
        </p>
        <TextArea
          value={settings.ads.adsTxt}
          onChange={(e) => setAds({ adsTxt: e.target.value })}
          autoSize={{ minRows: 4, maxRows: 16 }}
          className="font-mono text-xs"
          spellCheck={false}
          placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
          maxLength={20000}
        />
      </Card>

      <Alert
        type="info"
        showIcon
        message={<span>Create and manage the ads themselves in <Link href="/dashboard/ads" className="text-blue-600">Manage Ads</Link>.</span>}
      />
      {saveBar}
    </div>
  );

  const StatusRow = ({ ok, label, fix }) => (
    <div className="flex items-start gap-3 py-3">
      {ok ? <CheckCircleFilled className="text-green-600 text-lg mt-0.5" /> : <CloseCircleFilled className="text-red-500 text-lg mt-0.5" />}
      <div>
        <div className="font-medium text-gray-800">{label} <Tag color={ok ? 'green' : 'red'}>{ok ? 'Working' : 'Not installed'}</Tag></div>
        {!ok && <code className="block mt-1 text-xs bg-gray-100 rounded px-2 py-1">{fix}</code>}
      </div>
    </div>
  );

  const systemTab = (
    <Card
      size="small"
      title="Document conversion tools"
      extra={<Button size="small" icon={<ReloadOutlined />} onClick={loadHealth}>Check again</Button>}
    >
      {!health ? <Spin /> : health.error ? (
        <Alert type="error" message="Could not reach the backend" />
      ) : (
        <div className="divide-y divide-gray-100">
          <StatusRow
            ok={health.libreoffice}
            label="LibreOffice — Word / Excel / PowerPoint → PDF"
            fix="sudo apt install -y libreoffice-writer libreoffice-calc libreoffice-impress fonts-noto"
          />
          <StatusRow
            ok={health.python}
            label="Python converters — PDF → Word / Excel / PowerPoint"
            fix="cd Server && python3 -m venv .venv-tools && .venv-tools/bin/pip install pdf2docx pdfplumber openpyxl python-pptx pymupdf"
          />
        </div>
      )}
    </Card>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      {msgHolder}
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-gray-500 text-sm mb-4">Site-wide code, ad behaviour and system status.</p>
      <Tabs
        activeKey={tab}
        onChange={changeTab}
        items={[
          { key: 'code', label: <span><CodeOutlined /> Code injection</span>, children: codeTab },
          { key: 'ads', label: <span><NotificationOutlined /> Ads</span>, children: adsTab },
          { key: 'system', label: <span><ToolOutlined /> System</span>, children: systemTab },
        ]}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spin size="large" /></div>}>
      <SettingsInner />
    </Suspense>
  );
}
