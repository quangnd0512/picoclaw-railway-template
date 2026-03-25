import { useState } from 'react';
import { useBackendQuery } from '../../hooks/useBackend';
import { 
  usePairingList, 
  useApprovePairing, 
  useRevokePairing, 
  useClearPendingPairings 
} from '../../hooks/usePairing';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export function PairingOps() {
  const { data: backendData } = useBackendQuery();
  const { 
    data: pairingList, 
    isFetching: isLoadingList, 
    refetch: loadList 
  } = usePairingList();

  const approveMut = useApprovePairing();
  const revokeMut = useRevokePairing();
  const clearPendingMut = useClearPendingPairings();

  const { toasts, addToast, removeToast } = useToast();

  const [approvePlatform, setApprovePlatform] = useState('telegram');
  const [approveCode, setApproveCode] = useState('');

  const [revokePlatform, setRevokePlatform] = useState('telegram');
  const [revokeUserId, setRevokeUserId] = useState('');

  if (backendData?.backend !== 'hermes') {
    return null;
  }

  const PLATFORMS = [
    { value: 'telegram', label: 'Telegram' },
    { value: 'discord', label: 'Discord' },
    { value: 'slack', label: 'Slack' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'signal', label: 'Signal' },
    { value: 'email', label: 'Email' },
    { value: 'homeassistant', label: 'Home Assistant' },
  ];

  const handleApprove = async () => {
    if (!approveCode.trim()) return;
    try {
      await approveMut.mutateAsync({ platform: approvePlatform, code: approveCode });
      addToast('Pairing approved successfully', 'success');
      setApproveCode('');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to approve pairing', 'error');
    }
  };

  const handleRevoke = async () => {
    if (!revokeUserId.trim()) return;
    try {
      await revokeMut.mutateAsync({ platform: revokePlatform, userId: revokeUserId });
      addToast('Pairing revoked successfully', 'success');
      setRevokeUserId('');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to revoke pairing', 'error');
    }
  };

  const handleClearPending = async () => {
    try {
      await clearPendingMut.mutateAsync();
      addToast('Pending pairings cleared', 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to clear pending', 'error');
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Pairing Operations</h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 space-y-4">
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Manage device pairings for messaging channels
          </span>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => loadList()} 
            disabled={isLoadingList}
            className="text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-600/20 dark:hover:bg-blue-600/30"
          >
            {isLoadingList ? 'Loading...' : 'Refresh List'}
          </Button>
        </div>

        {pairingList && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Active Pairings</h3>
              {pairingList.active.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No active pairings found.</p>
              ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full text-left text-xs text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-2 font-medium">User ID</th>
                        <th className="px-4 py-2 font-medium">Platform</th>
                        <th className="px-4 py-2 font-medium">Username</th>
                        <th className="px-4 py-2 font-medium">Approved At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {pairingList.active.map((p) => (
                        <tr key={p.user_id + p.platform}>
                          <td className="px-4 py-2">{p.user_id}</td>
                          <td className="px-4 py-2 capitalize">{p.platform}</td>
                          <td className="px-4 py-2">{p.username || '-'}</td>
                          <td className="px-4 py-2">{p.approved_at || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pending Requests</h3>
              {pairingList.pending.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No pending requests found.</p>
              ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full text-left text-xs text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-2 font-medium">Code</th>
                        <th className="px-4 py-2 font-medium">Platform</th>
                        <th className="px-4 py-2 font-medium">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {pairingList.pending.map((p) => (
                        <tr key={p.code + p.platform}>
                          <td className="px-4 py-2 font-mono">{p.code}</td>
                          <td className="px-4 py-2 capitalize">{p.platform}</td>
                          <td className="px-4 py-2">{p.created_at || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Approve Pairing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="approve-platform" className="block text-xs text-gray-500 mb-1">Platform</label>
              <Select
                id="approve-platform"
                value={approvePlatform}
                onChange={(e) => setApprovePlatform(e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="approve-code" className="block text-xs text-gray-500 mb-1">Pairing Code</label>
              <Input
                id="approve-code"
                type="text"
                value={approveCode}
                onChange={(e) => setApproveCode(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="8-char code"
                className="uppercase font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="success"
                className="w-full"
                onClick={handleApprove}
                disabled={approveMut.isPending || !approveCode.trim()}
              >
                {approveMut.isPending ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Revoke Pairing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="revoke-platform" className="block text-xs text-gray-500 mb-1">Platform</label>
              <Select
                id="revoke-platform"
                value={revokePlatform}
                onChange={(e) => setRevokePlatform(e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="revoke-user" className="block text-xs text-gray-500 mb-1">User ID</label>
              <Input
                id="revoke-user"
                type="text"
                value={revokeUserId}
                onChange={(e) => setRevokeUserId(e.target.value)}
                placeholder="User identifier"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="danger"
                className="w-full"
                onClick={handleRevoke}
                disabled={revokeMut.isPending || !revokeUserId.trim()}
              >
                {revokeMut.isPending ? 'Revoking...' : 'Revoke'}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Clear Pending Pairings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Remove all pending pairing requests
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClearPending}
              disabled={clearPendingMut.isPending}
              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-600/20 dark:text-yellow-400 dark:hover:bg-yellow-600/30"
            >
              {clearPendingMut.isPending ? 'Clearing...' : 'Clear All Pending'}
            </Button>
          </div>
        </div>
        
      </div>

      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type === 'error' ? 'error' : 'success'}
          isVisible={true}
          onDismiss={() => removeToast(t.id)}
        />
      ))}
    </section>
  );
}
