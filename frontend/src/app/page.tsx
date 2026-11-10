"use client";

import { useEffect, useState } from "react";
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
type NearExpiryAlert = {
  id: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;

  medicine:{
    id: number;
    name: string;
  };
};
type ExpiredBatch = {
  id: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;

  medicine:{
    id: number;
    name: string;
  };
};

export default function Home() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
    const [nearExpiryAlerts, setNearExpiryAlerts] = useState<NearExpiryAlert[]>([]);
    const [expiredBatch, setExpiredBatches] = useState<ExpiredBatch[]>([]);
    const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/dashboard/summary")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        return response.json();
      })
      .then((data: DashboardSummary) => {
        setSummary(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  
      fetch("http://localhost:8080/api/medicines")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }
        return response.json();
      })
      .then((data: Medicine[]) => {
        setMedicines(data);
      })
      .catch((error) => {
        console.error("Medicine API error:", error);
      });
      fetch("http://localhost:8080/api/batches")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch batches");
    }
    return response.json();
    })
  .then((data: Batch[]) => {
    setBatches(data);
    })
  .catch((error) => {
    console.error("Batch API error:", error);
    });
     fetch("http://localhost:8080/api/alerts/low-stock")
     .then((response) => {
      if (!response.ok){
        throw new Error("Failed to fetch low stock details");
      }
      return response.json();
     })
     .then((data: LowStockAlert[]) =>{
      setLowStockAlerts(data);
     })
     .catch((error) => {
      console.error("LowStock API error:",error);
     });
     fetch("http://localhost:8080/api/alerts/expired")
     .then((response) => {
      if(!response.ok){
        throw new Error("Failed to fetch expired batch details");
      }
      return response.json();
     })
     .then((data: ExpiredBatch[]) =>{
      setExpiredBatches(data);
     })
     .catch((error)=> {
      console.error("Expired Batch Api error:",error);
    }) ;
    
  },[]);
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 p-6 text-white">
        <h1 className="text-2xl font-bold text-teal-400">
          PharmaWise
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Smart Pharmacy Management
        </p>

        <nav className="mt-12 space-y-4">
          <div className="rounded-lg bg-teal-600 px-4 py-3">
            Dashboard
          </div>

          <div className="px-4 py-3 text-slate-300">
            Medicines
          </div>

          <div className="px-4 py-3 text-slate-300">
            Batches
          </div>

          <div className="px-4 py-3 text-slate-300">
            Stock Management
          </div>

          <div className="px-4 py-3 text-slate-300">
            Alerts
          </div>
        </nav>

        <div className="absolute bottom-8 text-sm text-slate-400">
          PharmaWise v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">

        <header className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h2>
          <p className="mt-2 text-slate-500">
            Welcome to your pharmacy inventory overview.
          </p>
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-4 gap-6">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Medicines</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-800">1</h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Stock</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-800">48</h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Low Stock</p>
            <h3 className="mt-3 text-3xl font-bold text-amber-500">0</h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Near Expiry</p>
            <h3 className="mt-3 text-3xl font-bold text-red-500">0</h3>
          </div>

        </section>

        {/* Inventory Overview */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-800">
            Inventory Overview
          </h3>

          <p className="mt-2 text-slate-500">
            Monitor your medicine stock and batch information.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-slate-500">
                  <th className="p-4">Medicine</th>
                  <th className="p-4">Batch 1</th>
                  <th className="p-4">Batch 2</th>
                  <th className="p-4">Total Stock</th>
                </tr>
              </thead>

               <tbody>
  {medicines.map((medicine) => {
    const medicineBatches = batches.filter(
      (batch) => batch.medicine.id === medicine.id
    );

    return (
      <tr key={medicine.id} className="border-b text-slate-700">
        <td className="p-4 font-medium">{medicine.name}</td>

        <td className="p-4">
          {medicineBatches[0]
            ? `${medicineBatches[0].batchNumber} (${medicineBatches[0].quantity})`
            : "—"}
        </td>

        <td className="p-4">
          {medicineBatches[1]
            ? `${medicineBatches[1].batchNumber} (${medicineBatches[1].quantity})`
            : "—"}
        </td>

        <td className="p-4 font-semibold">{medicine.quantity}</td>
      </tr>
    );
  })}
</tbody>
              
            </table>
          </div>
        </section>

        {/* Alerts */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-800">
            Inventory Alerts
          </h3>

          <div className="mt-5 grid grid-cols-3 gap-5">

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h4 className="font-semibold text-amber-800">
                Low Stock
              </h4>
            <div className="mt-2 text-sm text-amber-700">
             {lowStockAlerts.length === 0 ? (
             <p>No low-stock medicines.</p>
              ) : (
             lowStockAlerts.map((medicine) => (
             <p key={medicine.id} className="mt-2">
             {medicine.name} — Only {medicine.quantity} left!
             </p>
              ))
             )}
      </div>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-5">
              <h4 className="font-semibold text-orange-800">
                Near Expiry
              </h4>
              <div className="mt-2 text-sm text-amber-700 ">
                {nearExpiryAlerts.length === 0 ?(
                <p>no-near expiry medicines</p>
                ) : (
                  nearExpiryAlerts.map((medicine) => (
                    <p key={medicine.id} className="mt-2">
                      {medicine.name} - Near Expiry {medicine.quantity}!
                    </p>
                  ))
                )}
              </div>
            
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <h4 className="font-semibold text-red-800">
                Expired Stock
              </h4>
              <p className="mt-2 text-sm text-red-700">
                No expired batches.
              </p>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
