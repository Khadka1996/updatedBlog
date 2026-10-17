'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Modal, Form, Input, Select, Switch, Radio, Checkbox, DatePicker, Slider,
  Upload, Button, Alert, Segmented, Divider, Tooltip, message,
} from 'antd';
import {
  PictureOutlined, CodeOutlined, UploadOutlined, EyeOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import AdCreative from '../../components/ads/AdCreative';
import { EMPTY_AD, NETWORKS, PAGES, PLACEMENTS, SIZES } from './adOptions';

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
  }, [open, ad, form]);

  // Page scripts (popunder etc.) only make sense as inline code.
  useEffect(() => {
    if (placement === 'global_script') {
      form.setFieldsValue({ type: 'code', renderMode: 'inline' });
    }
  }, [placement, form]);

  const uploadImage = async ({ file, onSuccess, onError }) => {
    const body = new FormData();
    body.append('image', file);
    setUploading(true);
    try {
      const res = await fetch('/api/ads/upload-image', { method: 'POST', credentials: 'include', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
      form.setFieldsValue({ imagePath: data.imagePath });
      form.validateFields(['imagePath']).catch(() => {});
      msg.success('Image uploaded');
      onSuccess?.(data);
    } catch (err) {
      msg.error(err.message);
      onError?.(err);
    } finally {
      setUploading(false);
    }
  };

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
        <Button key="save" type="primary" loading={saving} onClick={handleSubmit} className="bg-[#174fa2]">
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
              label="Banner image"
              required
              extra="JPG, PNG, WEBP or GIF, up to 5MB. You can also paste an https:// image URL."
            >
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <Upload accept=".jpg,.jpeg,.png,.webp,.gif" showUploadList={false} customRequest={uploadImage}>
                  <Button icon={<UploadOutlined />} loading={uploading}>Upload image</Button>
                </Upload>
                <Form.Item
                  name="imagePath"
                  noStyle
                  rules={[
                    { required: true, message: 'Upload a banner image' },
                    { pattern: /^(\/uploads\/|https?:\/\/)/, message: 'Must be an uploaded image or an https:// URL' },
                  ]}
                >
                  <Input placeholder="/uploads/ads/... or https://..." className="flex-1" />
                </Form.Item>
              </div>
              {imagePath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePath} alt="Banner preview" className="mt-3 max-h-40 rounded border border-gray-200" />
              )}
            </Form.Item>
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
