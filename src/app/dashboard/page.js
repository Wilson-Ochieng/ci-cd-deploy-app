"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Truck,
  Package,
  ClipboardList,
  User,
  LogOut,
  PlusCircle,
  Navigation,
  CheckCircle,
  Clock,
  Shield,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuthContext();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Role-specific menu items
  const navItems = [
    { id: "overview", name: "Overview", icon: ClipboardList },
    { id: "loads", name: "My Loads", icon: Package, roles: ["shipper"] },
    { id: 'admin', name: 'Admin Panel', icon: Shield, roles: ['admin'] },
    {
      id: "post-load",
      name: "Post a Load",
      icon: PlusCircle,
      roles: ["shipper"],
    },
    {
      id: "available-loads",
      name: "Available Loads",
      icon: Navigation,
      roles: ["transporter"],
    },
    { id: "my-trips", name: "My Trips", icon: Truck, roles: ["transporter"] },
  ];

  const filteredNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );
  {user.role === 'admin' && (
  <button
    onClick={() => router.push('/admin')}
    className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
  >
    <Shield className="h-5 w-5" />
    <span>Admin Panel</span>
  </button>
)}

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out dark:bg-gray-800 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo area */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Truck className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                LoadLink KE
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.fullName || user.phone_number}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              onClick={logout}
              className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {new Date().toLocaleDateString("en-KE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {/* Dynamic content based on active tab */}
          {activeTab === "overview" && <OverviewTab user={user} />}
          {activeTab === "loads" && user.role === "shipper" && (
            <ShipperLoadsTab />
          )}
          {activeTab === "post-load" && user.role === "shipper" && (
            <PostLoadTab />
          )}
          {activeTab === "available-loads" && user.role === "transporter" && (
            <AvailableLoadsTab />
          )}
          {activeTab === "my-trips" && user.role === "transporter" && (
            <MyTripsTab />
          )}
        </main>
      </div>
    </div>
  );
}

// ========== Tab Components (placeholders – you'll connect to your API) ==========

function OverviewTab({ user }) {
  // Dummy stats – replace with real data from your backend
  const stats = [
    { title: "Total Loads", value: "12", icon: Package, color: "blue" },
    { title: "Active Trips", value: "3", icon: Truck, color: "green" },
    { title: "Completed", value: "28", icon: CheckCircle, color: "purple" },
    { title: "Pending", value: "2", icon: Clock, color: "orange" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {user.fullName?.split(" ")[0] || user.phonenumber}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`rounded-full bg-${stat.color}-100 p-2 text-${stat.color}-600 dark:bg-${stat.color}-900/20 dark:text-${stat.color}-400`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity placeholder */}
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 border-b border-gray-100 pb-3 last:border-0 dark:border-gray-700"
            >
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Load #LD{i} was delivered successfully.
              </p>
              <span className="ml-auto text-xs text-gray-400">
                {i} hour{i !== 1 ? "s" : ""} ago
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShipperLoadsTab() {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        My Posted Loads
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        You haven&apos;t posted any loads yet.
      </p>
      {/* Later: fetch and display loads from your API */}
    </div>
  );
}

function PostLoadTab() {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        Post a New Load
      </h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pickup Location
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            placeholder="Nairobi, CBD"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Dropoff Location
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            placeholder="Mombasa, Town"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Weight (kg)
          </label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            placeholder="500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Post Load
        </button>
      </form>
    </div>
  );
}

function AvailableLoadsTab() {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        Available Loads
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        No loads available at the moment.
      </p>
    </div>
  );
}

function MyTripsTab() {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        My Trips
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        You have no active trips.
      </p>
    </div>
  );
}
