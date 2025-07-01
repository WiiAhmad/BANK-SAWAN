// get all wallet 
// GET http://localhost:3000/api/user/wallets

//Example response all wallets
// [
//     {
//         "id": "c4154daf-3fe9-4ab7-99e5-f9f6d758a287",
//         "userId": "c7e196ff-b72f-4559-be5a-6c4ca4c5f22c",
//         "walletNumber": "WAL1751210284036IF64",
//         "name": "Wallet",
//         "description": null,
//         "balance": "190000",
//         "currency": "IDR",
//         "walletType": "MAIN",
//         "createdAt": "2025-06-29T15:18:04.037Z",
//         "updatedAt": "2025-06-30T04:18:01.873Z",
//         "deletedAt": null,
//         "isDeleted": false
//     },
//     {
//         "id": "ca0bdc14-9f46-45c8-a895-001a99bab99b",
//         "userId": "c7e196ff-b72f-4559-be5a-6c4ca4c5f22c",
//         "walletNumber": "WAL1751299684668K2CU",
//         "name": "Test created wallet sec",
//         "description": "Test",
//         "balance": "0",
//         "currency": "IDR",
//         "walletType": "SECONDARY",
//         "createdAt": "2025-06-30T16:08:04.669Z",
//         "updatedAt": "2025-06-30T16:08:04.669Z",
//         "deletedAt": null,
//         "isDeleted": false
//     },
//     {
//         "id": "fe736b87-971f-470b-a35a-ef06bf712f18",
//         "userId": "c7e196ff-b72f-4559-be5a-6c4ca4c5f22c",
//         "walletNumber": "SAV1751300458840WAV8V6Q6CNO",
//         "name": "Savings Wallet",
//         "description": "Wallet for savings plans",
//         "balance": "0",
//         "currency": "IDR",
//         "walletType": "SAVINGS",
//         "createdAt": "2025-06-30T16:20:58.841Z",
//         "updatedAt": "2025-06-30T16:20:58.841Z",
//         "deletedAt": null,
//         "isDeleted": false
//     }
// ]

import { useState, useEffect } from 'react';

export function useAllWallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Move fetchWallets outside useEffect so it can be called
  const fetchWallets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/wallets', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setWallets(data);
        localStorage.setItem('user_wallets', JSON.stringify(data));
      } else {
        setError(data.error || 'Failed to fetch wallets');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return { wallets, loading, error, refetch: fetchWallets };
}

// get all savings plans
// GET http://localhost:3000/api/user/savings

// Example response
// [
//     {
//         "id": "917af85b-e2f0-432c-bd4a-1f0d64deb672",
//         "userId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "walletId": "9c89cf8a-02df-4c4b-889c-f9154aeb82aa",
//         "title": "test 2",
//         "goalAmount": "300000",
//         "description": "test savings 2",
//         "targetDate": "2025-12-18T00:00:00.000Z",
//         "category": null,
//         "priority": "MEDIUM",
//         "currentAmount": "0",
//         "status": "ACTIVE",
//         "createdAt": "2025-07-01T06:20:57.913Z",
//         "updatedAt": "2025-07-01T06:20:57.913Z",
//         "deletedAt": null,
//         "isDeleted": false
//     },
//     {
//         "id": "a5f38191-44d3-4886-af88-64cfd21e0310",
//         "userId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "walletId": "9c89cf8a-02df-4c4b-889c-f9154aeb82aa",
//         "title": "test 1",
//         "goalAmount": "200000",
//         "description": "test savings 1",
//         "targetDate": "2025-12-17T00:00:00.000Z",
//         "category": null,
//         "priority": "MEDIUM",
//         "currentAmount": "0",
//         "status": "ACTIVE",
//         "createdAt": "2025-07-01T06:20:35.479Z",
//         "updatedAt": "2025-07-01T06:20:35.479Z",
//         "deletedAt": null,
//         "isDeleted": false
//     }
// ]

export function useAllSavings() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/savings', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setSavings(data);
        localStorage.setItem('user_savings', JSON.stringify(data));
      } else {
        setError(data.error || 'Failed to fetch savings plans');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  return { savings, loading, error, refetch: fetchSavings };
}

// get all transactions http://localhost:3000/api/user/tx

// Example response
// [
//     {
//         "id": "50a94ea6-be69-44a3-bbbe-82f1808b68a3",
//         "senderId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "receiverId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "senderWalletId": "79d7a4a3-5e5b-4635-8fde-b4db4d84cf7d",
//         "receiverWalletId": "9c89cf8a-02df-4c4b-889c-f9154aeb82aa",
//         "amount": "10000",
//         "currency": "IDR",
//         "status": "COMPLETED",
//         "description": "Transfer to SAV1751350835466UG",
//         "createdAt": "2025-07-01T06:43:10.942Z",
//         "updatedAt": "2025-07-01T06:43:10.942Z",
//         "completedAt": "2025-07-01T06:43:10.940Z",
//         "sender": {
//             "id": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//             "name": "user",
//             "email": "user@example.com"
//         },
//         "receiver": {
//             "id": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//             "name": "user",
//             "email": "user@example.com"
//         }
//     }
// ]


export function useAllTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/tx', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setTransactions(data);
        localStorage.setItem('user_transactions', JSON.stringify(data));
      } else {
        setError(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return { transactions, loading, error, refetch: fetchTransactions };
}

// get all savings goals
// GET http://localhost:3000/api/user/savings

// Example response
// [
//     {
//         "id": "917af85b-e2f0-432c-bd4a-1f0d64deb672",
//         "userId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "walletId": "9c89cf8a-02df-4c4b-889c-f9154aeb82aa",
//         "title": "test 2",
//         "goalAmount": "310000",
//         "description": "test savings 2",
//         "targetDate": "2025-12-18T00:00:00.000Z",
//         "category": null,
//         "priority": "MEDIUM",
//         "currentAmount": "10000",
//         "status": "ACTIVE",
//         "createdAt": "2025-07-01T06:20:57.913Z",
//         "updatedAt": "2025-07-01T07:11:10.373Z",
//         "deletedAt": null,
//         "isDeleted": false
//     },
//     {
//         "id": "a5f38191-44d3-4886-af88-64cfd21e0310",
//         "userId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "walletId": "9c89cf8a-02df-4c4b-889c-f9154aeb82aa",
//         "title": "test 1",
//         "goalAmount": "200000",
//         "description": "test savings 1",
//         "targetDate": "2025-12-17T00:00:00.000Z",
//         "category": null,
//         "priority": "MEDIUM",
//         "currentAmount": "0",
//         "status": "ACTIVE",
//         "createdAt": "2025-07-01T06:20:35.479Z",
//         "updatedAt": "2025-07-01T06:20:35.479Z",
//         "deletedAt": null,
//         "isDeleted": false
//     }
// ]

export function useSavingsGoals() {
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSavingsGoals() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/savings', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setSavingsGoals(data);
          localStorage.setItem('user_savings_goals', JSON.stringify(data));
        } else {
          setError(data.error || 'Failed to fetch savings goals');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchSavingsGoals();
  }, []);

  return { savingsGoals, loading, error };
}

// get all user transactions
// get http://localhost:3000/api/user/tx

//example response

// [
//     {
//         "id": "556f63e2-7844-404b-8de1-3221ef2a9251",
//         "senderId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "receiverId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "senderWalletId": "79d7a4a3-5e5b-4635-8fde-b4db4d84cf7d",
//         "receiverWalletId": "9c89cf8a-02df-4c4b-889c-f9154aeb82aa",
//         "amount": "10000",
//         "currency": "IDR",
//         "status": "COMPLETED",
//         "description": "Top up to savings plan: test 2",
//         "createdAt": "2025-07-01T07:11:10.374Z",
//         "updatedAt": "2025-07-01T07:11:10.374Z",
//         "completedAt": "2025-07-01T07:11:10.373Z",
//         "sender": {
//             "id": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//             "name": "user",
//             "email": "user@example.com"
//         },
//         "receiver": {
//             "id": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//             "name": "user",
//             "email": "user@example.com"
//         }
//     },
//     {
//         "id": "c5707134-e021-4912-82c9-63e0d5973439",
//         "senderId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "receiverId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "senderWalletId": "79d7a4a3-5e5b-4635-8fde-b4db4d84cf7d",
//         "receiverWalletId": "9c89cf8a-02df-4c4b-889c-f9154aeb82aa",
//         "amount": "10000",
//         "currency": "IDR",
//         "status": "COMPLETED",
//         "description": "Top up to savings plan: test 2",
//         "createdAt": "2025-07-01T07:08:44.115Z",
//         "updatedAt": "2025-07-01T07:08:44.115Z",
//         "completedAt": "2025-07-01T07:08:44.113Z",
//         "sender": {
//             "id": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//             "name": "user",
//             "email": "user@example.com"
//         },
//         "receiver": {
//             "id": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//             "name": "user",
//             "email": "user@example.com"
//         }
//     },
//     {
//         "id": "50a94ea6-be69-44a3-bbbe-82f1808b68a3",
//         "senderId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "receiverId": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//         "senderWalletId": "79d7a4a3-5e5b-4635-8fde-b4db4d84cf7d",
//         "receiverWalletId": "9c89cf8a-02df-4c4b-889c-f9154aeb82aa",
//         "amount": "10000",
//         "currency": "IDR",
//         "status": "COMPLETED",
//         "description": "Transfer to SAV1751350835466UG",
//         "createdAt": "2025-07-01T06:43:10.942Z",
//         "updatedAt": "2025-07-01T06:43:10.942Z",
//         "completedAt": "2025-07-01T06:43:10.940Z",
//         "sender": {
//             "id": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//             "name": "user",
//             "email": "user@example.com"
//         },
//         "receiver": {
//             "id": "0644d507-ebcb-4d2b-9a54-c1cf6a840fe9",
//             "name": "user",
//             "email": "user@example.com"
//         }
//     }
// ]

export function useUserTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/tx', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setTransactions(data);
          localStorage.setItem('user_transactions', JSON.stringify(data));
        } else {
          setError(data.error || 'Failed to fetch transactions');
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