
"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

type DashboardSummary = {
  totalMedicines: number;
  totalStock: number;
  lowStockCount: number;
  nearExpiryCount: number;
  expiredBatchCount: number;
};

type Medicine = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  expiryDate: string;
};

type Batch = {
  id: number;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  medicine: {
    id: number;
    name: string;
  };
};

type LowStockAlert = {
  id: number;
  name: string;
  quantity: number;
};

type ExpiryAlert = {
  id: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  medicine: {
    id: number;
    name: string;
  };
};

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    throw new Error("Please log in again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  return response;
}

export default function Home() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [nearExpiryAlerts, setNearExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [expiredBatches, setExpiredBatches] = useState<ExpiryAlert[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");

  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showEditMedicine, setShowEditMedicine] = useState(false);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showDeductStock, setShowDeductStock] = useState(false);

  const [medicineName, setMedicineName] = useState("");
  const [medicinePrice, setMedicinePrice] = useState("");
  const [medicineQuantity, setMedicineQuantity] = useState("");
  const [medicineExpiry, setMedicineExpiry] = useState("");

  const [editingMedicineId, setEditingMedicineId] = useState<number | null>(null);
  const [editMedicineName, setEditMedicineName] = useState("");
  const [editMedicinePrice, setEditMedicinePrice] = useState("");
  const [editMedicineExpiry, setEditMedicineExpiry] = useState("");

  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [batchExpiryDate, setBatchExpiryDate] = useState("");
  const [batchQuantity, setBatchQuantity] = useState("");

  const [deductMedicineId, setDeductMedicineId] = useState("");
  const [deductQuantity, setDeductQuantity] = useState("");

  const refreshData = useCallback(async () => {
    const [
      summaryResponse,
      medicinesResponse,
      batchesResponse,
      lowStockResponse,
      nearExpiryResponse,
      expiredResponse,
    ] = await Promise.all([
      apiRequest("/api/dashboard/summary"),
      apiRequest("/api/medicines"),
      apiRequest("/api/batches"),
      apiRequest("/api/alerts/low-stock"),
      apiRequest("/api/alerts/near-expiry"),
      apiRequest("/api/alerts/expired"),
    ]);

    const responses = [
      summaryResponse,
      medicinesResponse,
      batchesResponse,
      lowStockResponse,
      nearExpiryResponse,
      expiredResponse,
    ];

    if (responses.some((response) => !response.ok)) {
      throw new Error("Could not load all dashboard information. Please check your backend.");
    }

    const [
      summaryData,
      medicineData,
      batchData,
      lowStockData,
      nearExpiryData,
      expiredData,
    ] = await Promise.all(responses.map((response) => response.json()));

    setSummary(summaryData);
    setMedicines(medicineData);
    setBatches(batchData);
    setLowStockAlerts(lowStockData);
    setNearExpiryAlerts(nearExpiryData);
    setExpiredBatches(expiredData);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    refreshData()
      .catch((err) => setError(err.message || "Unable to load dashboard."))
      .finally(() => setLoading(false));
  }, [refreshData]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
    window.location.href = "/login";
  };

  const goToSection = (section: string) => {
  setActiveSection(section);

  setTimeout(() => {
    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};

  const handleAddMedicine = async () => {
    if (
      !medicineName.trim() ||
      !medicinePrice ||
      !medicineQuantity ||
      !medicineExpiry
    ) {
      alert("Please fill in all medicine details.");
      return;
    }

    try {
      const response = await apiRequest("/api/medicines", {
        method: "POST",
        body: JSON.stringify({
          name: medicineName.trim(),
          price: Number(medicinePrice),
          quantity: Number(medicineQuantity),
          expiryDate: medicineExpiry,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await refreshData();

      setMedicineName("");
      setMedicinePrice("");
      setMedicineQuantity("");
      setMedicineExpiry("");
      setShowAddMedicine(false);

      alert("Medicine added successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not add medicine.");
    }
  };

  const handleEditClick = (medicine: Medicine) => {
    setEditingMedicineId(medicine.id);
    setEditMedicineName(medicine.name);
    setEditMedicinePrice(String(medicine.price));
    setEditMedicineExpiry(medicine.expiryDate);
    setShowEditMedicine(true);
    setShowAddMedicine(false);
    setShowAddBatch(false);
    setShowDeductStock(false);
    goToSection("medicines");
  };

  const handleUpdateMedicine = async () => {
    if (
      editingMedicineId === null ||
      !editMedicineName.trim() ||
      !editMedicinePrice ||
      !editMedicineExpiry
    ) {
      alert("Please fill in all medicine details.");
      return;
    }

    try {
      const response = await apiRequest(
        `/api/medicines/${editingMedicineId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: editMedicineName.trim(),
            price: Number(editMedicinePrice),
            expiryDate: editMedicineExpiry,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await refreshData();

      setShowEditMedicine(false);
      setEditingMedicineId(null);

      alert("Medicine updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update medicine.");
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine and all its batches?"
    );

    if (!confirmed) return;

    try {
      const response = await apiRequest(`/api/medicines/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await refreshData();
      alert("Medicine deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete medicine.");
    }
  };

  const handleAddBatch = async () => {
    if (
      !selectedMedicineId ||
      !batchNumber.trim() ||
      !manufacturingDate ||
      !batchExpiryDate ||
      !batchQuantity
    ) {
      alert("Please fill in all batch details.");
      return;
    }

    if (batchExpiryDate <= manufacturingDate) {
      alert("Expiry date must be after manufacturing date.");
      return;
    }

    if (Number(batchQuantity) <= 0) {
      alert("Batch quantity must be greater than zero.");
      return;
    }

    try {
      const response = await apiRequest(
        `/api/batches/medicine/${selectedMedicineId}`,
        {
          method: "POST",
          body: JSON.stringify({
            batchNumber: batchNumber.trim(),
            manufacturingDate,
            expiryDate: batchExpiryDate,
            quantity: Number(batchQuantity),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await refreshData();

      setSelectedMedicineId("");
      setBatchNumber("");
      setManufacturingDate("");
      setBatchExpiryDate("");
      setBatchQuantity("");
      setShowAddBatch(false);

      alert("Batch added successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not add batch.");
    }
  };

  const handleDeductStock = async () => {
    if (!deductMedicineId || !deductQuantity) {
      alert("Please select a medicine and enter quantity.");
      return;
    }

    const quantity = Number(deductQuantity);
    const selectedMedicine = medicines.find(
      (medicine) => medicine.id === Number(deductMedicineId)
    );

    if (!selectedMedicine || quantity <= 0) {
      alert("Please enter a valid medicine and quantity.");
      return;
    }

    if (quantity > selectedMedicine.quantity) {
      alert("Cannot deduct more than the available stock.");
      return;
    }

    try {
      const response = await apiRequest(
        `/api/stock/deduct/${deductMedicineId}`,
        {
          method: "POST",
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await refreshData();

      setDeductMedicineId("");
      setDeductQuantity("");
      setShowDeductStock(false);

      alert("Stock deducted successfully using FEFO!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Stock deduction failed.");
    }
  };

  const openForm = (form: string) => {
    setShowAddMedicine(form === "medicine");
    setShowEditMedicine(false);
    setShowAddBatch(form === "batch");
    setShowDeductStock(form === "stock");

    const section =
      form === "medicine" ? "medicines" :
      form === "batch" ? "batches" : "stock";

    goToSection(section);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "medicines", label: "Medicines", icon: "💊" },
    { id: "batches", label: "Batches", icon: "▤" },
    { id: "stock", label: "Stock Management", icon: "⇅" },
    { id: "alerts", label: "Alerts", icon: "⚑" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-medium text-slate-600">
          Loading PharmaWise...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-lg rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-bold text-red-600">
            Unable to load PharmaWise
          </h2>
          <p className="mt-3 text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-teal-600 px-5 py-3 text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col bg-slate-900 p-6 text-white md:flex">
        <div>
          <h1 className="text-2xl font-bold text-teal-400">PharmaWise</h1>
          <p className="mt-2 text-sm text-slate-400">
            Smart Pharmacy Management
          </p>
        </div>

        <nav className="mt-12 flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() =>
  item.id === "stock"
    ? openForm("stock")
    : goToSection(item.id)
}
              className={`w-full rounded-lg px-4 py-3 text-left transition ${
                activeSection === item.id
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-700 px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
          >
            ↪ Logout
          </button>
          <p className="mt-5 text-xs text-slate-500">PharmaWise v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen p-4 md:ml-64 md:p-8">
        <header
          id="dashboard"
          className="mb-8 scroll-mt-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Dashboard
              </h2>
              <p className="mt-2 text-slate-500">
                Welcome to your pharmacy inventory overview.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 md:hidden"
            >
              Logout
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 md:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => goToSection(item.id)}
                className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => openForm("medicine")}
              className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
            >
              + Add Medicine
            </button>

            <button
              onClick={() => openForm("batch")}
              className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
            >
              + Add Batch
            </button>

            <button
              onClick={() => openForm("stock")}
              className="rounded-lg bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-700"
            >
              - Deduct Stock
            </button>

            <button
              onClick={() =>
                refreshData().catch((err) => setError(err.message))
              }
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-slate-700 hover:bg-slate-50"
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        {/* Dashboard Statistics */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              label: "Total Medicines",
              value: summary?.totalMedicines ?? 0,
              color: "text-slate-800",
            },
            {
              label: "Total Stock",
              value: summary?.totalStock ?? 0,
              color: "text-slate-800",
            },
            {
              label: "Low Stock",
              value: summary?.lowStockCount ?? 0,
              color: "text-amber-600",
            },
            {
              label: "Near Expiry",
              value: summary?.nearExpiryCount ?? 0,
              color: "text-orange-600",
            },
            {
              label: "Expired Batches",
              value: summary?.expiredBatchCount ?? 0,
              color: "text-red-600",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <h3 className={`mt-3 text-3xl font-bold ${item.color}`}>
                {item.value}
              </h3>
            </div>
          ))}
        </section>

        {/* Add Medicine Form */}
        {showAddMedicine && (
          <section
            id="medicines"
            className="mt-8 scroll-mt-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 text-xl font-semibold text-slate-800">
              Add New Medicine
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Medicine Name"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                className="rounded-lg border p-3"
              />
              <input
                type="number"
                min="0"
                placeholder="Price"
                value={medicinePrice}
                onChange={(e) => setMedicinePrice(e.target.value)}
                className="rounded-lg border p-3"
              />
              <input
                type="number"
                min="0"
                placeholder="Initial Quantity"
                value={medicineQuantity}
                onChange={(e) => setMedicineQuantity(e.target.value)}
                className="rounded-lg border p-3"
              />
              <div>
                <label className="mb-2 block text-sm text-slate-600">
                  Medicine Expiry Date
                </label>
                <input
                  type="date"
                  value={medicineExpiry}
                  onChange={(e) => setMedicineExpiry(e.target.value)}
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleAddMedicine}
                className="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
              >
                Save Medicine
              </button>
              <button
                onClick={() => setShowAddMedicine(false)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-slate-700"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* Edit Medicine Form */}
        {showEditMedicine && (
          <section
            id="medicines"
            className="mt-8 scroll-mt-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 text-xl font-semibold text-slate-800">
              Update Medicine
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Medicine Name"
                value={editMedicineName}
                onChange={(e) => setEditMedicineName(e.target.value)}
                className="rounded-lg border p-3"
              />
              <input
                type="number"
                min="0"
                placeholder="Price"
                value={editMedicinePrice}
                onChange={(e) => setEditMedicinePrice(e.target.value)}
                className="rounded-lg border p-3"
              />
              <div>
                <label className="mb-2 block text-sm text-slate-600">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editMedicineExpiry}
                  onChange={(e) => setEditMedicineExpiry(e.target.value)}
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleUpdateMedicine}
                className="rounded-lg bg-teal-600 px-5 py-2 text-white"
              >
                Update Medicine
              </button>
              <button
                onClick={() => setShowEditMedicine(false)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-slate-700"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* Add Batch Form */}
        {showAddBatch && (
          <section
            id="batches"
            className="mt-8 scroll-mt-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 text-xl font-semibold text-slate-800">
              Add New Batch
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <select
                value={selectedMedicineId}
                onChange={(e) => setSelectedMedicineId(e.target.value)}
                className="rounded-lg border p-3"
              >
                <option value="">Select Medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Batch Number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="rounded-lg border p-3"
              />

              <div>
                <label className="mb-2 block text-sm text-slate-600">
                  Manufacturing Date
                </label>
                <input
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-600">
                  Batch Expiry Date
                </label>
                <input
                  type="date"
                  value={batchExpiryDate}
                  onChange={(e) => setBatchExpiryDate(e.target.value)}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <input
                type="number"
                min="1"
                placeholder="Batch Quantity"
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(e.target.value)}
                className="rounded-lg border p-3"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleAddBatch}
                className="rounded-lg bg-teal-600 px-5 py-2 text-white"
              >
                Save Batch
              </button>
              <button
                onClick={() => setShowAddBatch(false)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-slate-700"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* Stock Deduction Form */}
        {showDeductStock && (
          <section
            id="stock"
            className="mt-8 scroll-mt-6 rounded-xl bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 text-xl font-semibold text-slate-800">
              Deduct Stock Using FEFO
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <select
                value={deductMedicineId}
                onChange={(e) => setDeductMedicineId(e.target.value)}
                className="rounded-lg border p-3"
              >
                <option value="">Select Medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name} — Stock: {medicine.quantity}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Quantity to Deduct"
                value={deductQuantity}
                onChange={(e) => setDeductQuantity(e.target.value)}
                className="rounded-lg border p-3"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleDeductStock}
                className="rounded-lg bg-orange-600 px-5 py-2 text-white hover:bg-orange-700"
              >
                Deduct Stock
              </button>
              <button
                onClick={() => setShowDeductStock(false)}
                className="rounded-lg bg-slate-200 px-5 py-2 text-slate-700"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* Inventory Overview */}
        <section
          id="medicines"
          className="mt-8 scroll-mt-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">
                Inventory Overview
              </h3>
              <p className="mt-2 text-slate-500">
                View, edit and manage your medicines.
              </p>
            </div>
            <button
              onClick={() => openForm("medicine")}
              className="rounded-lg bg-teal-600 px-4 py-2 text-white"
            >
              + Add Medicine
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-sm text-slate-500">
                  <th className="p-4">Medicine</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Total Stock</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No medicines added yet.
                    </td>
                  </tr>
                ) : (
                  medicines.map((medicine) => (
                    <tr key={medicine.id} className="border-b text-slate-700">
                      <td className="p-4 font-medium">{medicine.name}</td>
                      <td className="p-4">₹{medicine.price}</td>
                      <td className="p-4">{medicine.expiryDate}</td>
                      <td className="p-4 font-semibold">
                        {medicine.quantity}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(medicine)}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(medicine.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Batch Overview */}
        <section
          id="batches"
          className="mt-8 scroll-mt-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">
                Batch Management
              </h3>
              <p className="mt-2 text-slate-500">
                Review batch numbers, quantities and expiry dates.
              </p>
            </div>
            <button
              onClick={() => openForm("batch")}
              className="rounded-lg bg-teal-600 px-4 py-2 text-white"
            >
              + Add Batch
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-sm text-slate-500">
                  <th className="p-4">Medicine</th>
                  <th className="p-4">Batch Number</th>
                  <th className="p-4">Manufacturing</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No batches added yet.
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch.id} className="border-b text-slate-700">
                      <td className="p-4 font-medium">
                        {batch.medicine?.name || "Medicine"}
                      </td>
                      <td className="p-4">{batch.batchNumber}</td>
                      <td className="p-4">{batch.manufacturingDate}</td>
                      <td className="p-4">{batch.expiryDate}</td>
                      <td className="p-4 font-semibold">{batch.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Alerts */}
        <section
          id="alerts"
          className="mt-8 scroll-mt-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold text-slate-800">
            Inventory Alerts
          </h3>
          <p className="mt-2 text-slate-500">
            Monitor low stock, near-expiry and expired batches.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h4 className="font-semibold text-amber-800">Low Stock</h4>
              {lowStockAlerts.length === 0 ? (
                <p className="mt-3 text-sm text-amber-700">
                  No low-stock medicines.
                </p>
              ) : (
                lowStockAlerts.map((medicine) => (
                  <p key={medicine.id} className="mt-3 text-sm text-amber-800">
                    {medicine.name} — Only {medicine.quantity} left
                  </p>
                ))
              )}
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-5">
              <h4 className="font-semibold text-orange-800">Near Expiry</h4>
              {nearExpiryAlerts.length === 0 ? (
                <p className="mt-3 text-sm text-orange-700">
                  No near-expiry batches.
                </p>
              ) : (
                nearExpiryAlerts.map((batch) => (
                  <p key={batch.id} className="mt-3 text-sm text-orange-800">
                    {batch.medicine?.name} — {batch.batchNumber} — Qty:{" "}
                    {batch.quantity} — Expiry: {batch.expiryDate}
                  </p>
                ))
              )}
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <h4 className="font-semibold text-red-800">Expired Stock</h4>
              {expiredBatches.length === 0 ? (
                <p className="mt-3 text-sm text-red-700">
                  No expired batches.
                </p>
              ) : (
                expiredBatches.map((batch) => (
                  <p key={batch.id} className="mt-3 text-sm text-red-800">
                    {batch.medicine?.name} — {batch.batchNumber} — Qty:{" "}
                    {batch.quantity} — Expiry: {batch.expiryDate}
                  </p>
                ))
              )}
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-sm text-slate-500">
          PharmaWise — Smart Pharmacy Inventory Management
        </footer>
      </main>
    </div>
  );
}
