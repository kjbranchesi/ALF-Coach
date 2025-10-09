import React from 'react';
import { CheckCircle, Clock, CloudOff } from 'lucide-react';
import { unifiedStorage } from '../../../services/UnifiedStorageManager';

type Props = {
  projectId?: string;
  pollingMs?: number;
};

export function SyncStatusChip({ projectId, pollingMs = 2000 }: Props) {
  const [state, setState] = React.useState<{ dirty: boolean; lastLocalUpdate?: Date | null; lastCloudSyncAt?: Date | null; status?: string } | null>(null);
  const [online, setOnline] = React.useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const refresh = React.useCallback(async () => {
    if (!projectId) { return; }
    try {
      const next = await unifiedStorage.getSyncState(projectId);
      setState(next);
    } catch {
      // ignore
    }
  }, [projectId]);

  React.useEffect(() => {
    void refresh();
    if (!projectId) { return; }
    const id = window.setInterval(refresh, pollingMs);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [projectId, pollingMs, refresh]);

  if (!projectId || !state) { return null; }

  const isDirty = state.dirty;
  const isSynced = !isDirty && state.status === 'synced';
  const cloudRecent = state.lastCloudSyncAt && Date.now() - state.lastCloudSyncAt.getTime() < 60000; // 60s

  let bg = 'bg-gray-200 text-gray-700';
  let label = 'Saved locally';
  let Icon = Clock;

  if (!online) {
    bg = 'bg-amber-100 text-amber-800';
    label = 'Offline • Saved locally';
    Icon = CloudOff;
  } else if (isSynced && cloudRecent) {
    bg = 'bg-emerald-100 text-emerald-800';
    label = 'Synced to cloud';
    Icon = CheckCircle;
  } else if (!isDirty && state.status === 'local') {
    bg = 'bg-sky-100 text-sky-800';
    label = 'Saved locally';
    Icon = Clock;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${bg}`} title={
      `Local updated: ${state.lastLocalUpdate ? state.lastLocalUpdate.toLocaleTimeString() : '—'}\nCloud sync: ${state.lastCloudSyncAt ? state.lastCloudSyncAt.toLocaleTimeString() : '—'}\nStatus: ${state.status || '—'}`
    }>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
}

export default SyncStatusChip;

