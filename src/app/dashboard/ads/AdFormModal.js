'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Modal, Form, Input, Select, Switch, Radio, Checkbox, DatePicker, Slider,
  Upload, Button, Alert, Segmented, Divider, Tooltip, Progress, Tag, message,
} from 'antd';
import {
  PictureOutlined, CodeOutlined, EyeOutlined, InfoCircleOutlined, InboxOutlined,
  CheckCircleFilled, DeleteOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import AdCreative from '../../components/ads/AdCreative';
import { EMPTY_AD, NETWORKS, PAGES, PLACEMENTS, PLACEMENT_LABEL, SIZES, suggestPlacements } from './adOptions';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CODE_PLACEHOLDER = `Paste the code your ad network gives you, for example:

<script type="text/javascript">
  atOptions = { 'key' : 'xxxxxxxx', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/xxxxxxxx/invoke.js"></script>`;

export default function AdFormModal({ open, ad, onClose, onSaved }) {
  const [msg, msgHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);
  const type = Form.useWatch('type', form);
  const placement = Form.useWatch('placement', form);
  const imagePath = Form.useWatch('imagePath', form);
  const renderMode = Form.useWatch('renderMode', form);
  const isEdit = Boolean(ad?._id);

  useEffect(() => {
    if (!open) return;
    const source = { ...EMPTY_AD, ...(ad || {}) };
    form.resetFields();
    form.setFieldsValue({
      ...source,
      schedule: [source.startDate ? dayjs(source.startDate) : null, source.endDate ? dayjs(source.endDate) : null],
    });
    setPreviewAd(null);
    setUploadInfo(null);
    setProgress(0);
  }, [open, ad, form]);

  // Page scripts (popunder etc.) only make sense as inline code.
  useEffect(() => {
    if (placement === 'global_script') {
      form.setFieldsValue({ type: 'code', renderMode: 'inline' });
    }
  }, [placement, form]);

  const applySuggestion = (sug) => {
    form.setFieldsValue({ placement: sug.placement, size: sug.size, devices: sug.devices });
  };

  // Upload with a progress bar (XHR — fetch can't report upload progress).
  const uploadFile = (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      msg.error('Please choose a JPG, PNG, WEBP or GIF image');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      msg.error('Image must be 20MB or smaller');
      return;
    }
    const body = new FormData();
    body.append('image', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/ads/upload-image');
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      setUploading(false);
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status === 413) { msg.error('That image is too large for the server. Try one under 20MB.'); return; }
      if (xhr.status === 401 || xhr.status === 403) { msg.error('Your session expired — please sign in again.'); return; }
      if (xhr.status >= 400 || !data.success) { msg.error(data.message || `Upload failed (${xhr.status})`); return; }

      const info = { ...data, fileName: file.name };
      setUploadInfo(info);
      const updates = { imagePath: data.imagePath, imageMobilePath: data.imageMobilePath || '' };
      const current = form.getFieldsValue(['name', 'altText']);
      const niceName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      if (!current.name) updates.name = niceName.charAt(0).toUpperCase() + niceName.slice(1);
      if (!current.altText) updates.altText = updates.name || current.name || niceName;
      form.setFieldsValue(updates);
      form.validateFields(['imagePath']).catch(() => {});
      // New ads: pre-select the best placement for this image's shape.
      const sug = data.width ? suggestPlacements(data.width, data.height)[0] : null;
      if (!isEdit && sug) applySuggestion(sug);
      msg.success(data.finalBytes && data.originalBytes > data.finalBytes
        ? `Uploaded and optimised (${(data.originalBytes / 1048576).toFixed(1)}MB → ${(data.finalBytes / 1048576).toFixed(1)}MB)`
        : 'Image uploaded');
    };
    xhr.onerror = () => { setUploading(false); msg.error('Network error — check your connection and try again'); };
    setUploading(true);
    setProgress(0);
    xhr.send(body);
  };

  // Paste an image straight from the clipboard (Ctrl+V) while the form is open.
  useEffect(() => {
    if (!open || type !== 'image') return undefined;
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.kind === 'file' && i.type.startsWith('image/'));
      if (item) { e.preventDefault(); uploadFile(item.getAsFile()); }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

  const buildPayload = (values) => {
    const [start, end] = values.schedule || [];
    const payload = {
      name: values.name,
      type: values.type,
      placement: values.placement,
      size: values.size,
      pages: values.pages || [],
      devices: values.devices,
      isActive: values.isActive,
      weight: values.weight,
      startDate: start ? start.toISOString() : null,
      endDate: end ? end.toISOString() : null,
    };
    if (values.type === 'image') {
      Object.assign(payload, {
        imagePath: values.imagePath,
        imageMobilePath: values.imageMobilePath || '',
        websiteLink: values.websiteLink,
        altText: values.altText || '',
        openInNewTab: values.openInNewTab,
      });
    } else {
      Object.assign(payload, {
        network: values.network || '',
        code: values.code,
        renderMode: values.renderMode,
      });
    }
    return payload;
  };

  const handlePreview = async () => {
    try {
      const fields = type === 'image' ? ['imagePath', 'websiteLink'] : ['code'];
      await form.validateFields(fields);
      const values = form.getFieldsValue(true);
      // Previews always run sandboxed so pasted code can't touch the dashboard.
      setPreviewAd({ ...buildPayload(values), _id: 'preview', renderMode: 'iframe' });
    } catch {}
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/ads/${ad._id}` : '/api/ads', {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(values)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not save the ad');
      onSaved?.(data.advertisement, isEdit ? 'Ad updated' : 'Ad created');
    } catch (err) {
      msg.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedPlacement = PLACEMENTS.find((p) => p.value === placement);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={isEdit ? 'Edit ad' : 'New ad'}
      width={760}
      destroyOnHidden
      maskClosable={false}
      footer={[
        <Button key="preview" icon={<EyeOutlined />} onClick={handlePreview}>Preview</Button>,
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="save" type="primary" loading={saving} onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Create ad'}
        </Button>,
      ]}
    >
      {msgHolder}
      <Form form={form} layout="vertical" requiredMark="optional" initialValues={EMPTY_AD}>
        <Form.Item name="type" label="Ad type">
          <Segmented
            block
            disabled={placement === 'global_script'}
            options={[
              { value: 'image', label: 'Image banner', icon: <PictureOutlined /> },
              { value: 'code', label: 'Ad network code (3rd party)', icon: <CodeOutlined /> },
            ]}
          />
        </Form.Item>

        {type === 'image' && (
          <Form.Item label="Banner image" required className="mb-4">
            <Form.Item
              name="imagePath"
              noStyle
              rules={[
                { required: true, message: 'Upload a banner image' },
                { pattern: /^(\/uploads\/|https?:\/\/)/, message: 'Must be an uploaded image or an https:// URL' },
              ]}
            >
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="imageMobilePath" noStyle><Input type="hidden" /></Form.Item>
            {!imagePath ? (
              <Upload.Dragger
                accept=".jpg,.jpeg,.png,.webp,.gif"
                showUploadList={false}
                multiple={false}
                disabled={uploading}
                customRequest={({ file }) => uploadFile(file)}
                className="!bg-blue-50/40"
              >
                <p className="ant-upload-drag-icon"><InboxOutlined className="!text-[#174fa2]" /></p>
                <p className="ant-upload-text font-medium">Drop your banner here, or click to choose</p>
                <p className="ant-upload-hint">You can also paste an image with Ctrl+V · JPG, PNG, WEBP or GIF (animated OK) up to 20MB — it&apos;s optimised automatically</p>
                {uploading && <Progress percent={progress} size="small" className="!px-10 !mt-2" status={progress >= 100 ? 'active' : 'normal'} format={(p) => (p >= 100 ? 'Optimising…' : `${p}%`)} />}
              </Upload.Dragger>
            ) : (
              <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePath} alt="Banner preview" className="max-h-44 max-w-full sm:max-w-[260px] object-contain rounded border border-gray-200 bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] self-start" />
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="flex items-center gap-2 font-medium text-gray-800">
                      <CheckCircleFilled className="text-green-600" /> {uploadInfo?.fileName || 'Banner image'}
                    </div>
                    {uploadInfo?.width && (
                      <div className="text-gray-500 mt-1">
                        {uploadInfo.originalWidth} × {uploadInfo.originalHeight}px
                        {uploadInfo.animated && <Tag color="purple" className="ml-2">Animated</Tag>}
                        {uploadInfo.finalBytes && <span className="ml-1">· {(uploadInfo.finalBytes / 1024).toFixed(0)} KB</span>}
                      </div>
                    )}
                    {uploadInfo?.width && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-600 mb-1"><ThunderboltOutlined /> Best places for this image — click to use:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestPlacements(uploadInfo.width, uploadInfo.height).map((sug) => (
                            <Button
                              key={sug.placement}
                              size="small"
                              type={placement === sug.placement ? 'primary' : 'default'}
                              onClick={() => applySuggestion(sug)}
                            >
                              {PLACEMENT_LABEL[sug.placement]}{sug.devices !== 'all' ? ` (${sug.devices})` : ''}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button size="small" type="link" danger icon={<DeleteOutlined />} className="!px-0 mt-2"
                      onClick={() => { form.setFieldsValue({ imagePath: '', imageMobilePath: '' }); setUploadInfo(null); }}>
                      Replace image
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label="Ad name"
          tooltip="Only you see this name — use it to recognise the ad in the list."
          rules={[{ required: true, whitespace: true, message: 'Give the ad a name' }, { max: 120 }]}
        >
          <Input placeholder={type === 'image' ? 'e.g. Daraz Dashain sale banner' : 'e.g. Adsterra 728x90 tools top'} />
        </Form.Item>

        {type === 'image' ? (
          <>
            <Form.Item
              name="websiteLink"
              label="Link (where the banner goes when clicked)"
              rules={[
                { required: true, message: 'Enter the advertiser link' },
                { type: 'url', message: 'Enter a full URL starting with https://' },
              ]}
            >
              <Input placeholder="https://advertiser-website.com/offer" />
            </Form.Item>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item name="altText" label="Alt text" rules={[{ max: 200 }]}>
                <Input placeholder="Short description of the banner" />
              </Form.Item>
              <Form.Item name="openInNewTab" label="Open link in new tab" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
          </>
        ) : (
          <>
            <Form.Item name="network" label="Ad network">
              <Select showSearch options={NETWORKS.map((n) => ({ value: n, label: n }))} />
            </Form.Item>
            <Form.Item
              name="code"
              label="Ad code"
              rules={[
                { required: true, whitespace: true, message: 'Paste the ad code from your network' },
                { max: 20000, message: 'Ad code is too long (max 20,000 characters)' },
              ]}
            >
              <TextArea rows={8} placeholder={CODE_PLACEHOLDER} className="font-mono text-xs" spellCheck={false} />
            </Form.Item>
            <Form.Item
              name="renderMode"
              label={
                <span>
                  How should the code run?{' '}
                  <Tooltip title="Banners (728x90, 300x250 ...) work best isolated. Popunders, social bars, push notifications and interstitials need to run on the page.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </span>
              }
            >
              <Radio.Group disabled={placement === 'global_script'}>
                <Radio value="iframe">Isolated frame — recommended for banners</Radio>
                <Radio value="inline">Directly on the page — popunder, social bar, push</Radio>
              </Radio.Group>
            </Form.Item>
            {renderMode === 'inline' && (
              <Alert
                type="warning"
                showIcon
                className="mb-4"
                message="Inline code runs with full access to the page. Only paste code from ad networks you trust."
              />
            )}
          </>
        )}

        <Divider orientation="left" plain>Where to show it</Divider>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Form.Item name="placement" label="Placement" rules={[{ required: true }]} extra={selectedPlacement?.hint}>
            <Select options={PLACEMENTS.map((p) => ({ value: p.value, label: p.label }))} />
          </Form.Item>
          <Form.Item name="size" label="Size" extra="Use the size your network gave you, or Responsive.">
            <Select options={SIZES} disabled={placement === 'global_script'} />
          </Form.Item>
        </div>

        <Form.Item name="pages" label="Show on" extra="Leave all unticked to show on every page.">
          <Checkbox.Group options={PAGES} />
        </Form.Item>

        <Form.Item name="devices" label="Devices">
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="all">All devices</Radio.Button>
            <Radio.Button value="desktop">Desktop only</Radio.Button>
            <Radio.Button value="mobile">Mobile only</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Divider orientation="left" plain>Schedule & rotation</Divider>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Form.Item name="schedule" label="Run between (optional)" extra="Leave empty to run until you pause it.">
            <RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" allowEmpty={[true, true]} className="w-full" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </Form.Item>
        </div>

        <Form.Item
          name="weight"
          label="Rotation weight"
          extra="When several ads share a placement, an ad with weight 10 shows twice as often as one with weight 5."
        >
          <Slider min={1} max={10} marks={{ 1: '1', 5: '5', 10: '10' }} />
        </Form.Item>
      </Form>

      {previewAd && (
        <div className="mt-2 border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">
            Preview (sandboxed). Some networks only serve real ads on your live domain, so an empty preview here can still work on the site.
          </div>
          <AdCreative ad={previewAd} />
        </div>
      )}
    </Modal>
  );
}
