import { useEffect, useState } from 'react';

export function useVerifyTopups(refreshKey?: number) {
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTopups([]); // Reset state sebelum fetch
    async function fetchTopups() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/verify/topup', { credentials: 'include', cache: 'no-store' });
        const data = await res.json();
        if (res.ok) {
          setTopups(data);
          localStorage.setItem('verify_topups', JSON.stringify(data));
        } else {
          setError(data.error || 'Failed to fetch topup requests');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchTopups();
  }, [refreshKey]); // Add refreshKey as dependency

  return { topups, loading, error };
}

export function useVerifyUsers(refreshKey?: number) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsers([]); // Reset state sebelum fetch
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/verify', { credentials: 'include', cache: 'no-store' });
        const data = await res.json();
        if (res.ok) {
          setUsers(data);
          localStorage.setItem('verify_users', JSON.stringify(data));
        } else {
          setError(data.error || 'Failed to fetch user verifications');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [refreshKey]); // Add refreshKey as dependency

  return { users, loading, error };
}
