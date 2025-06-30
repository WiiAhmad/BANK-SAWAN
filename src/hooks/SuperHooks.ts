//GET http://localhost:3000/api/admin/log
//GET http://localhost:3000/api/admin/tx

import { useEffect, useState } from 'react';

export function useAdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/log', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setLogs(data);
          localStorage.setItem('admin_logs', JSON.stringify(data));
        } else {
          setError(data.error || 'Failed to fetch admin logs');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return { logs, loading, error };
}
// example response for logs
// [
//     {
//         "id": "5d87ce1e-96f6-4575-921c-5ce432c51ac1",
//         "userId": "c8174dc3-8236-4ac7-ba1f-a88ec45ec5be",
//         "action": "LOGIN",
//         "entity": "ADMIN",
//         "details": null,
//         "timestamp": "2025-06-30T04:19:13.128Z",
//         "level": "INFO",
//         "user": {
//             "id": "c8174dc3-8236-4ac7-ba1f-a88ec45ec5be",
//             "name": "Admin User",
//             "email": "admin@example.com",
//             "role": "ADMIN"
//         }
//     },
//     {
//         "id": "552794d3-ca9c-49b3-9f9e-d8e23647c25f",
//         "userId": "c7e196ff-b72f-4559-be5a-6c4ca4c5f22c",
//         "action": "LOGOUT",
//         "entity": "USER",
//         "details": null,
//         "timestamp": "2025-06-30T04:19:08.222Z",
//         "level": "INFO",
//         "user": {
//             "id": "c7e196ff-b72f-4559-be5a-6c4ca4c5f22c",
//             "name": "user",
//             "email": "user@example.com",
//             "role": "USER"
//         }
//     },
// ]

export function useAdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/tx', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setTransactions(data);
          localStorage.setItem('admin_transactions', JSON.stringify(data));
        } else {
          setError(data.error || 'Failed to fetch admin transactions');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  return { transactions, loading, error };
}
// example response for transactions
// [
//     {
//         "id": "a9613935-b478-4286-b0f1-2226e959d88a",
//         "senderId": "c7e196ff-b72f-4559-be5a-6c4ca4c5f22c",
//         "receiverId": "f9d23b70-966f-4cc8-8ac3-b696bc945c13",
//         "senderWalletId": "c4154daf-3fe9-4ab7-99e5-f9f6d758a287",
//         "receiverWalletId": "a25eded2-ca37-439f-93e4-bf48373b3666",
//         "amount": "10000",
//         "currency": "IDR",
//         "status": "COMPLETED",
//         "description": "Transfer to WAL175120982079011XT",
//         "createdAt": "2025-06-30T04:18:01.879Z",
//         "updatedAt": "2025-06-30T04:18:01.879Z",
//         "completedAt": "2025-06-30T04:18:01.877Z",
//         "sender": {
//             "id": "c7e196ff-b72f-4559-be5a-6c4ca4c5f22c",
//             "name": "user",
//             "email": "user@example.com"
//         },
//         "receiver": {
//             "id": "f9d23b70-966f-4cc8-8ac3-b696bc945c13",
//             "name": "Verified User",
//             "email": "user1@example.com"
//         }
//     }
// ]