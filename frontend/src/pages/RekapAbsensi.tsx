import { useState, useEffect } from 'react';
import { Download, Search, Wallet, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi, downloadFileApi } from '../utils/api';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
}

interface WorkerRow {
  worker_id: number;
  worker_name: string;
  position: string;
  daily_wage: number;
  days: { [date: string]: 'hadir' | 'lembur' | 'cor' | 'alpha' };
  total_wage: number;
}

// Minggu=0, Senin=1, ..., Sabtu=6
const HARI_PENDEK = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

// Helper format YYYY-MM-DD tanpa masalah timezone offset UTC
const toDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};




const getTodayStr = (): string => toDateStr(new Date());

const getMondayOfWeek = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getWeekDates = (dateStr: string): Date[] => {
  const monday = getMondayOfWeek(dateStr);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

// ─── Komponen sel hari ───────────────────────────────────────────────────────
const DayCell = ({ status }: { status?: string }) => {
  let bg = 'transparent';
  let color = 'var(--text-main)';
  let content: React.ReactNode = '';

  const norm = status ? status.toLowerCase().trim() : '';

  if (norm === 'hadir' || norm === 'lembur') {
    content = '✓';
    color = '#15803d';
  } else if (norm === 'alpha') {
    bg = '#ef4444';
    color = 'white';
  } else if (norm === 'cor') {
    bg = '#9ca3af';
    color = 'white';
  }

  return (
    <td
      style={{
        backgroundColor: bg,
        color,
        textAlign: 'center',
        fontWeight: 800,
        fontSize: '16px',
        padding: '0',
        width: '44px',
        minWidth: '44px',
        height: '44px',
        verticalAlign: 'middle',
        borderBottom: '1px solid var(--border-color)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {content}
    </td>
  );
};



const RekapAbsensi = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects]             = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const today = getTodayStr();
  const [selectedWeek, setSelectedWeek]     = useState<string>(today);
  const [workerRows, setWorkerRows]         = useState<WorkerRow[]>([]);
  const [loading, setLoading]               = useState(false);
  const [exporting, setExporting]           = useState(false);
  const [search, setSearch]                 = useState('');

  const weekDates = getWeekDates(selectedWeek);
  const dateFrom  = toDateStr(weekDates[0]);

  // ── Load daftar proyek ────────────────────────────────────────────────────
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetchApi('/projects', { token });
        setProjects(res.data);
      } catch (err: any) {
        if (err.message === 'Unauthorized') { logout(); navigate('/login'); }
      }
    };
    if (token) loadProjects();
  }, [token, logout, navigate]);

  // ── Load rekap absensi ────────────────────────────────────────────────────
  useEffect(() => {
    const loadReport = async () => {
      if (!selectedProject) { setWorkerRows([]); return; }
      setLoading(true);
      try {
        const res = await fetchApi(
          `/attendance/report?project_id=${selectedProject}&week=${dateFrom}`,
          { token }
        );
        const rawWorkers = res.data?.workers ?? [];
        setWorkerRows(rawWorkers.map((item: any) => ({
          worker_id:   item.worker_id ?? item.id,
          worker_name: item.worker_name ?? item.name,
          position:    item.position,
          daily_wage:  item.daily_wage ?? 0,
          days:        item.days ?? {},
          total_wage:  item.total_wage ?? 0,
        })));
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [selectedProject, selectedWeek, token, dateFrom]);

  // ── Handler Export ────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!selectedProject) return;
    setExporting(true);
    try {
      await downloadFileApi(
  `/reports/export?project_id=${selectedProject}&date=${selectedWeek}`,
  token,
  `rekap-absensi-${selectedWeek}.xlsx`
);
    } catch (err) {
      console.error('Error exporting report:', err);
    } finally {
      setExporting(false);
    }
  };

  const filteredRows = workerRows.filter(r =>
    r.worker_name.toLowerCase().includes(search.toLowerCase())
  );

  const grandTotal   = filteredRows.reduce((s, r) => s + r.total_wage, 0);
  const totalPekerja = filteredRows.length;
  // NO + NAMA + JABATAN + UPAH/HARI + 7 hari + JML HARI + JUMLAH UPAH
  const totalCols = 13;

  return (
    <div className="page-container">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <CustomSelect
            value={selectedProject}
            onChange={(val) => setSelectedProject(val)}
            placeholder="Pilih Proyek..."
            style={{ minWidth: '200px' }}
            options={[
              { value: '', label: 'Pilih Proyek...' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
          <input
            type="date"
            className="select-field"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{ minWidth: '150px' }}
          />
        </div> 

        <div
    style={{
        marginTop:16,
        background:"#f8fafc",
        border:"1px solid #e5e7eb",
        borderRadius:10,
        padding:"14px"
    }}
>

    <div
        style={{
            fontSize:13,
            color:"#64748b",
            marginBottom:4
        }}
    >
        Periode Minggu
    </div>

    <div
        style={{
            fontWeight:600,
            fontSize:15
        }}
    >
        {weekDates[0].toLocaleDateString("id-ID")}
        {" - "}
        {weekDates[6].toLocaleDateString("id-ID")}
    </div>

</div>

        <div className="page-toolbar-right">
          <div className="input-group" style={{ width: '220px' }}>
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder="Cari pekerja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button
            className="btn-outline"
            onClick={handleExport}
            disabled={!selectedProject || exporting}
            style={{ opacity: !selectedProject || exporting ? 0.6 : 1, cursor: !selectedProject || exporting ? 'not-allowed' : 'pointer' }}
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>{exporting ? 'Mengunduh...' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* ── Card Ringkasan Compact ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={20} color="#d97706" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Total Upah Minggu Ini
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px', whiteSpace: 'nowrap' }}>
              Rp {new Intl.NumberFormat('id-ID').format(grandTotal)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={20} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Total Pekerja
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>
              {totalPekerja}{' '}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabel Rekap Presisi ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table
            className="table"
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              minWidth: '920px',
            }}
          >
            <colgroup>
              <col style={{ width: '44px' }} />  {/* NO */}
              <col style={{ width: '180px' }} /> {/* NAMA PEKERJA */}
              <col style={{ width: '100px' }} /> {/* JABATAN */}
              <col style={{ width: '110px' }} /> {/* UPAH/HARI */}
              <col style={{ width: '44px' }} />  {/* S */}
              <col style={{ width: '44px' }} />  {/* S */}
              <col style={{ width: '44px' }} />  {/* R */}
              <col style={{ width: '44px' }} />  {/* K */}
              <col style={{ width: '44px' }} />  {/* J */}
              <col style={{ width: '44px' }} />  {/* S */}
              <col style={{ width: '44px' }} />  {/* M */}
              <col style={{ width: '70px' }} />  {/* JML HARI */}
              <col style={{ width: '130px' }} /> {/* JUMLAH UPAH */}
            </colgroup>

            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 4px' }}>NO</th>
                <th rowSpan={2} style={{ textAlign: 'left', verticalAlign: 'middle', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 12px' }}>NAMA PEKERJA</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 8px' }}>JABATAN</th>
                <th rowSpan={2} style={{ textAlign: 'right', verticalAlign: 'middle', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 12px' }}>UPAH/HARI</th>
                <th
                  colSpan={7}
                  style={{
                    textAlign: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    borderRight: '1px solid var(--border-color)',
                    letterSpacing: '0.5px',
                    padding: '8px 4px',
                  }}
                >
                  HARI KERJA
                </th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', lineHeight: 1.2, borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 4px' }}>
                  JML<br />HARI
                </th>
                <th rowSpan={2} style={{ textAlign: 'right', verticalAlign: 'middle', borderBottom: '1px solid var(--border-color)', padding: '10px 12px' }}>JUMLAH UPAH</th>
              </tr>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                {weekDates.map((d, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: 'center',
                      padding: '6px 2px',
                      lineHeight: 1.3,
                      borderRight: '1px solid var(--border-color)',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>
                      {HARI_PENDEK[d.getDay()]}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>
                      {d.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={totalCols} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    Memuat data rekap...
                  </td>
                </tr>
              ) : !selectedProject ? (
                <tr>
                  <td colSpan={totalCols} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    Pilih proyek untuk melihat rekap absensi.
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    Tidak ada data pekerja / rekap absensi untuk minggu ini.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const jmlHari = weekDates.reduce((n, d) => {
                    const s = row.days[toDateStr(d)];
                    return n + (s && s !== 'alpha' ? 1 : 0);
                  }, 0);

                  return (
                    <tr key={row.worker_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {/* NO */}
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', borderRight: '1px solid var(--border-color)', padding: '8px 4px' }}>
                        {idx + 1}
                      </td>

                      {/* NAMA */}
                      <td style={{ borderRight: '1px solid var(--border-color)', padding: '8px 12px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                          {row.worker_name}
                        </div>
                      </td>

                      {/* JABATAN */}
                      <td style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)', padding: '8px 8px' }}>
                        {row.position}
                      </td>

                      {/* UPAH/HARI */}
                      <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '13px', borderRight: '1px solid var(--border-color)', padding: '8px 12px' }}>
                        {row.daily_wage ? new Intl.NumberFormat('id-ID').format(row.daily_wage) : '-'}
                      </td>

                      {/* Sel hari — pakai komponen DayCell */}
                      {weekDates.map((d) => (
                        <DayCell key={toDateStr(d)} status={row.days[toDateStr(d)]} />
                      ))}

                      {/* JML HARI */}
                      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '15px', borderRight: '1px solid var(--border-color)', padding: '8px 4px' }}>
                        {jmlHari}
                      </td>

                      {/* TOTAL UPAH */}
                      <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '14px', padding: '8px 12px' }}>
                        {new Intl.NumberFormat('id-ID').format(row.total_wage)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legenda ─────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: '14px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        fontSize: '13px',
        color: 'var(--text-muted)',
      }}>
        {[
          { color: 'transparent', border: '1px solid var(--border-color)', label: 'Hadir / Lembur', symbol: '✓' },
          { color: '#ef4444', label: 'Alpha (Tidak Hadir)' },
          { color: '#9ca3af', label: 'Cor' },
          { color: 'transparent', border: '1px solid var(--border-color)', label: 'Tidak Ada Data' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '22px',
              backgroundColor: item.color,
              border: item.border,
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 700,
              color: item.color === 'transparent' ? 'var(--text-main)' : 'white',
              flexShrink: 0,
            }}>
              {item.symbol ?? ''}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RekapAbsensi;
