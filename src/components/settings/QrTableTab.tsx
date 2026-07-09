import { useState, useEffect } from "react";
import { QrCode, Plus, Trash2, Printer } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

type DiningTable = {
  id: string;
  number: number;
  capacity: number;
};

export function QrTableTab() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNum, setNewTableNum] = useState("");
  const [newTableCap, setNewTableCap] = useState("4");
  
  const fetchTables = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("dining_tables").select("*").order("number");
    if (!error && data) {
      setTables(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    void Promise.resolve().then(fetchTables);
  }, []);

  const handleAddTable = async () => {
    if (!newTableNum) return;
    const num = parseInt(newTableNum);
    const cap = parseInt(newTableCap);
    
    if (tables.some(t => t.number === num)) {
      toast.error(`Meja nomor ${num} sudah ada`);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("dining_tables").insert({
      number: num,
      capacity: cap,
      status: "AVAILABLE"
    });

    if (error) {
      toast.error("Gagal menambah meja");
    } else {
      toast.success("Meja berhasil ditambahkan");
      setNewTableNum("");
      fetchTables();
    }
  };

  const handleDeleteTable = async (id: string, num: number) => {
    if (!confirm(`Hapus meja nomor ${num}?`)) return;
    
    const supabase = createClient();
    const { error } = await supabase.from("dining_tables").delete().eq("id", id);
    
    if (error) {
      toast.error("Gagal menghapus meja");
    } else {
      toast.success("Meja dihapus");
      fetchTables();
    }
  };

  const printQrCode = (tableNum: number) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Meja ${tableNum}</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              background: #f8f8f8;
            }
            .container {
              text-align: center;
              border: 2px dashed #ccc;
              padding: 32px 24px;
              border-radius: 16px;
              max-width: 360px;
              width: 100%;
              background: #fff;
              box-sizing: border-box;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              word-break: break-word;
            }
            p {
              color: #666;
              margin-bottom: 30px;
              white-space: normal;
              word-break: break-word;
              overflow-wrap: anywhere;
              font-size: 14px;
              line-height: 1.5;
            }
            .qr {
              margin: 0 auto;
              display: flex;
              justify-content: center;
              width: 100%;
            }
            .qr svg {
              width: 100%;
              max-width: 240px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>MEJA ${tableNum}</h1>
            <p>Scan QR untuk memesan menu</p>
            <div class="qr" id="qr-container"></div>
          </div>
        </body>
      </html>
    `);

    // Let React render the QR SVG to string in parent, then write to child
    const svgEl = document.getElementById(`qr-svg-${tableNum}`);
    if (svgEl) {
      printWindow.document.getElementById('qr-container')!.innerHTML = svgEl.outerHTML;
    }

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5" /> Kelola Meja & QR
          </h2>
          <p className="text-sm text-neutral-500">Tambah meja baru dan cetak QR code untuk pemesanan pelanggan.</p>
        </div>

        <div className="flex items-end gap-3 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500">Nomor Meja</label>
            <input type="number" value={newTableNum} onChange={e => setNewTableNum(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-sm" placeholder="Misal: 11" />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500">Kapasitas</label>
            <input type="number" value={newTableCap} onChange={e => setNewTableCap(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-sm" />
          </div>
          <button onClick={handleAddTable} className="bg-[#2D5016] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2D5016]/90 transition-all flex items-center gap-1 text-sm h-[38px]">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tables.map(table => (
              <div key={table.id} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeleteTable(table.id, table.number)} className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold mb-1">Meja {table.number}</h3>
                <p className="text-xs text-neutral-500 mb-4">{table.capacity} Kursi</p>
                
                <div className="bg-white p-2 rounded-lg border border-neutral-200 shadow-sm mb-3">
                  <QRCodeSVG 
                    id={`qr-svg-${table.number}`}
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/table/${table.number}`} 
                    size={100} 
                  />
                </div>
                
                <button onClick={() => printQrCode(table.number)} className="w-full flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 py-2 rounded-lg text-sm font-semibold transition-colors">
                  <Printer className="w-4 h-4" /> Cetak QR
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
