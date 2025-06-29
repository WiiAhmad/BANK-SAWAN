import { useEffect, useState } from 'react';

export function useVerifyTopups() {
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopups() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/verify/topup', { credentials: 'include' });
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
  }, []);

  return { topups, loading, error };
}

export function useVerifyUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/verify', { credentials: 'include' });
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
  }, []);

  return { users, loading, error };
}
