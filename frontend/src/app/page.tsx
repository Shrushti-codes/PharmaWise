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
    const [showAddMedicine, setShowAddMedicine] = useState(false);
    const [medicineName, setMedicineName] = useState("");
    const [medicinePrice, setMedicinePrice] = useState("");
    const [medicineQuantity, setMedicineQuantity] = useState("");
    const [medicineExpiry, setMedicineExpiry] = useState("");
    const [showAddBatch, setShowAddBatch] = useState(false);
    const [selectedMedicineId, setSelectedMedicineId] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    const [manufacturingDate, setManufacturingDate] = useState("");
    const [batchExpiryDate, setBatchExpiryDate] = useState("");
    const [batchQuantity, setBatchQuantity] = useState(""); 
    const [showDeductStock, setShowDeductStock] = useState(false);
    const [deductMedicineId, setDeductMedicineId] = useState("");
    const [deductQuantity, setDeductQuantity] = useState(""); 

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
     fetch("http://localhost:8080/api/alerts/near-expiry")
     .then((response) => {
      if(!response.ok){
        throw new Error("Failed to fetch near expiry details");
      }
      return response.json();
     })
     .then((data: NearExpiryAlert[]) => {
      setNearExpiryAlerts(data);
     })
     .catch((error)=>{
      console.error("Near Expiry API error:",error);
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

const handleAddMedicine = async () => {
  if (
    !medicineName.trim() ||
    !medicinePrice ||
    !medicineQuantity ||
    !medicineExpiry
  ) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8080/api/medicines",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: medicineName,
          price: Number(medicinePrice),
          quantity: Number(medicineQuantity),
          expiryDate: medicineExpiry,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add medicine");
    }

    const newMedicine: Medicine = await response.json();

    setMedicines((previousMedicines) => [
      ...previousMedicines,
      newMedicine,
    ]);

    const summaryResponse = await fetch(
      "http://localhost:8080/api/dashboard/summary"
    );

    if (summaryResponse.ok) {
      const updatedSummary: DashboardSummary =
        await summaryResponse.json();
      setSummary(updatedSummary);
    }

    setMedicineName("");
    setMedicinePrice("");
    setMedicineQuantity("");
    setMedicineExpiry("");
    setShowAddMedicine(false);

    alert("Medicine added successfully!");

  } catch (error) {
    console.error("Error adding medicine:", error);
    alert("Could not add medicine. Please try again.");
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

  try {
    const response = await fetch(
      `http://localhost:8080/api/batches/medicine/${selectedMedicineId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchNumber: batchNumber,
          manufacturingDate: manufacturingDate,
          expiryDate: batchExpiryDate,
          quantity: Number(batchQuantity),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add batch");
    }

    const updatedBatches = await fetch(
      "http://localhost:8080/api/batches"
    );

    if (!updatedBatches.ok) {
      throw new Error("Batch saved, but could not refresh batches");
    }

    const batchData: Batch[] = await updatedBatches.json();
    setBatches(batchData);

    const updatedSummaryResponse = await fetch(
      "http://localhost:8080/api/dashboard/summary"
    );

    if (updatedSummaryResponse.ok) {
      const updatedSummary: DashboardSummary =
        await updatedSummaryResponse.json();
      setSummary(updatedSummary);
    }

    setSelectedMedicineId("");
    setBatchNumber("");
    setManufacturingDate("");
    setBatchExpiryDate("");
    setBatchQuantity("");
    setShowAddBatch(false);

    alert("Batch added successfully!");
  } catch (error) {
    console.error("Error adding batch:", error);
    alert("Could not add batch. Please check the backend.");
  }
};
  
const handleDeductStock = async () => {
  if (!deductMedicineId || !deductQuantity) {
    alert("Please select a medicine and enter quantity.");
    return;
  }

  if (Number(deductQuantity) <= 0) {
    alert("Quantity must be greater than zero.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/stock/deduct/${deductMedicineId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: Number(deductQuantity),
        }),
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Stock deduction failed");
    }

    alert("Stock deducted successfully using FEFO!");

    setDeductMedicineId("");
    setDeductQuantity("");
    setShowDeductStock(false);

  } catch (error) {
    console.error("Error deducting stock:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Could not deduct stock."
    );
  }
};


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
  <div>
    <h2 className="text-3xl font-bold text-slate-800">
      Dashboard
    </h2>
    <p className="mt-2 text-slate-500">
      Welcome to your pharmacy inventory overview.
    </p>
  </div>

  <div className="mt-3 flex items-center gap-3">
    <button
      onClick={() => setShowAddMedicine(true)}
      className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
    >
      + Add Medicine
    </button>

    <button
      onClick={() => setShowAddBatch(true)}
      className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
    >
      + Add Batch
    </button>
  
  <button
  onClick={() => setShowDeductStock(true)}
  className="rounded-lg bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-700"
  >
  - Deduct Stock
  </button>
  </div>
 </header>
        
    
        {/* Statistics */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Medicines</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-800">
              { summary ? summary.totalMedicines : "Loading..."}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Stock</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-800">
              { summary? summary.totalStock : "Loading..."}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Low Stock</p>
            <h3 className="mt-3 text-3xl font-bold text-amber-500">
              {summary ? summary.lowStockCount : "Loading..."}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Near Expiry</p>
            <h3 className="mt-3 text-3xl font-bold text-red-500">
              {summary ? summary.nearExpiryCount :"Loading..."}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Expired Batches</p>
            <h3 className="mt-3 text-3xl font-bold text-red-600">
              {summary ? summary.expiredBatchCount : "Loading..."}
            </h3>
            </div>

        </section>
        {showAddMedicine && (
  <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
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
        placeholder="Price"
        value={medicinePrice}
        onChange={(e) => setMedicinePrice(e.target.value)}
        className="rounded-lg border p-3"
      />

      <input
        type="number"
        placeholder="Quantity"
        value={medicineQuantity}
        onChange={(e) => setMedicineQuantity(e.target.value)}
        className="rounded-lg border p-3"
      />

      <input
        type="date"
        value={medicineExpiry}
        onChange={(e) => setMedicineExpiry(e.target.value)}
        className="rounded-lg border p-3"
      />

    </div>

    <div className="mt-5 flex gap-3">
      <button
       type ="button"
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
{showAddBatch && (
  <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
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
        placeholder="Batch Number (e.g. PAR003)"
        value={batchNumber}
        onChange={(e) => setBatchNumber(e.target.value)}
        className="rounded-lg border p-3"
      />

      <div>
       <label className="mb-2 block text-sm font-medium text-slate-700">
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
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Expiry Date
        </label>
      <input
        type="date"
        placeholder="Batch Expiry Date"
        value={batchExpiryDate}
        onChange={(e) => setBatchExpiryDate(e.target.value)}
        className="rounded-lg border p-3"
      />
      </div>
      <input
        type="number"
        placeholder="Quantity"
        value={batchQuantity}
        onChange={(e) => setBatchQuantity(e.target.value)}
        className="rounded-lg border p-3"
      />
    </div>

    <div className="mt-5 flex flex-wrap items-centre gap-4">
      <button
        type="button"
        onClick={handleAddBatch}
        className="rounded-lg bg-teal-600 px-5 py-2 text-white"
      >
        Save Batch
      </button>

      <button
        type="button"
        onClick={() => setShowAddBatch(false)}
        className="rounded-lg bg-slate-200 px-5 py-2 text-slate-700"
      >
        Cancel
      </button>
    </div>
  </section>
)}
{/* Deduct Stock Form */}
{showDeductStock && (
  <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
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
            {medicine.name}
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

    <div className="mt-5 flex items-center gap-4">
      <button
        type="button"
        onClick= {handleDeductStock}
        className="rounded-lg bg-orange-600 px-5 py-2 text-white hover:bg-orange-700"
      >
        Deduct Stock
      </button>

      <button
        type="button"
        onClick={() => setShowDeductStock(false)}
        className="rounded-lg bg-slate-200 px-5 py-2 text-slate-700"
      >
        Cancel
      </button>
    </div>
  </section>
)}

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

const handleDeductStock = async () => {
  if (!deductMedicineId || !deductQuantity) {
    alert("Please select a medicine and enter quantity.");
    return;
  }

  if (Number(deductQuantity) <= 0) {
    alert("Quantity must be greater than zero.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/stock/deduct/${deductMedicineId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: Number(deductQuantity),
        }),
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Stock deduction failed");
    }

    alert("Stock deducted successfully using FEFO!");

    setDeductMedicineId("");
    setDeductQuantity("");
    setShowDeductStock(false);

  } catch (error) {
    console.error("Error deducting stock:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Could not deduct stock."
    );
  }
};


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
                  nearExpiryAlerts.map((batch) => (
                    <p key={batch.id} className="mt-2">
                      {batch.medicine.name} - Batch: {batch.batchNumber} -
                      Quantity: {batch.quantity} - Expiry:{batch.expiryDate}
                    </p>
                  ))
                )}
              </div>
            
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <h4 className="font-semibold text-red-800">
                Expired Stock
              </h4>
              <div className= "mt-2 text-sm text-red -700">
                {expiredBatch.length === 0 ? (
                <p> No Expired Batches.</p>
                ) : (
                  expiredBatch.map((batch) => (
                    <p key={batch.id} className ="mt-2">
                      {batch.medicine.name}- Batch: {batch.batchNumber}-
                      Quantity: {batch.quantity} - Expiry: {batch.expiryDate}
                    </p>
                  ))
                )}
              </div>
                
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
