import { SegmentedControl } from '@rranker/sdk/components/SegmentedControl';

export type MaimaiUploadPage = 'friend_code' | 'qr' | 'lxns_guide';

const methods = [
  { id: 'friend_code', label: '好友码', accessibilityLabel: '切换到好友码页面' },
  { id: 'qr', label: '玩家二维码', accessibilityLabel: '切换到玩家二维码页面' },
  { id: 'lxns_guide', label: '同步引导', accessibilityLabel: '切换到同步引导页面' },
] as const;

export function MaimaiUploadTabs({
  value,
  disabled,
  syncGuideAvailable,
  onChange,
}: {
  value: MaimaiUploadPage;
  disabled: boolean;
  syncGuideAvailable: boolean;
  onChange: (value: MaimaiUploadPage) => void;
}) {
  const options = syncGuideAvailable ? methods : methods.filter(method => method.id !== 'lxns_guide');
  return <SegmentedControl label="舞萌上传方式" options={options} value={!syncGuideAvailable && value === 'lxns_guide' ? 'friend_code' : value} disabled={disabled} onChange={onChange}
    style={{ marginHorizontal: 20, marginBottom: 12 }} />;
}
