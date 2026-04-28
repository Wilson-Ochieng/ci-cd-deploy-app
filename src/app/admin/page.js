'use client';

import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Package, Truck, BarChart3, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loads, setLoads] = useState([]);
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      } else {
        fetchAdminData();
      }
    }
  }, [user, isLoading, router]);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        credentials: 'include',
      });
      if (statsRes.ok) setStats(await statsRes.json());

      // Fetch users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include',
      });
      if (usersRes.ok) setUsersList(await usersRes.json());

      // Fetch loads
      const loadsRes = await fetch('http://localhost:5000/api/admin/loads', {
        credentials: 'include',
      });
      if (loadsRes.ok) setLoads(await loadsRes.json());

      // Fetch trips
      const tripsRes = await fetch('http://localhost:5000/api/admin/trips', {
        credentials: 'include',
      });
      if (tripsRes.ok) setTrips(await tripsRes.json());
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    }
  };

  const verifyTransporter = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/verify-transporter/${userId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        // Refresh user list
        const usersRes = await fetch('http://localhost:5000/api/admin/users', { credentials: 'include' });
        if (usersRes.ok) setUsersList(await usersRes.json());
      }
    } catch (err) {
      console.error('Verification failed', err);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage users, loads, and platform operations</p>
          </div>
          <Shield className="h-8 w-8 text-blue-600" />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          {['stats', 'users', 'loads', 'trips'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
            <StatCard title="Shippers" value={stats.totalShippers} icon={Users} color="green" />
            <StatCard title="Transporters" value={stats.totalTransporters} icon={Truck} color="orange" />
            <StatCard title="Total Loads" value={stats.totalLoads} icon={Package} color="purple" />
            <StatCard title="Total Trips" value={stats.totalTrips} icon={BarChart3} color="red" />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{u.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{u.fullName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.phoneNumber}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-500 dark:text-gray-400">{u.role}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {u.role === 'transporter' ? (
                        u.verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {u.role === 'transporter' && !u.verified && (
                        <button
                          onClick={() => verifyTransporter(u.id)}
                          className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Loads Tab */}
        {activeTab === 'loads' && (
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            {loads.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No loads posted yet.</p>
            ) : (
              <pre className="overflow-x-auto text-sm">{JSON.stringify(loads, null, 2)}</pre>
            )}
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === 'trips' && (
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            {trips.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No trips yet.</p>
            ) : (
              <pre className="overflow-x-auto text-sm">{JSON.stringify(trips, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-full bg-${color}-100 p-2 text-${color}-600 dark:bg-${color}-900/20 dark:text-${color}-400`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}