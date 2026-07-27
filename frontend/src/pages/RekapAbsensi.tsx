import { useState, useEffect } from 'react';
import { Download, Search, Wallet, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
}

interface AttendanceDetail {
  id: number;
  date: string;
  worker_id: number;
  worker_name: string;
  position: string;
  project: string;
  status: 'hadir' | 'lembur' | 'cor' | 'alpha';
  wage: number;
}

interface WorkerRow {
  worker_id: number;
  worker_name: string;
  position: string;
  days: { [date: string]: 'hadir' | 'lembur' | 'cor' | 'alpha' };
  total_wage: number;
}

// Minggu=0, Senin=1, ..., Sabtu=6
const HARI_PENDEK = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

const getMondayOfWeek = (dateStr: string): Date => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekDates = (dateStr: string): Date[] => {
  const monday = getMondayOfWeek(dateStr);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const toDateStr = (d: Date): string => d.toISOString().split('T')[0];

// ─── Komponen sel hari ───────────────────────────────────────────────────────
const DayCell = ({ status }: { status?: 'hadir' | 'lembur' | 'cor' | 'alpha' }) => {
  let bg = 'transparent';
  let color = 'var(--text-main)';
  let content: React.ReactNode = '';

  if (status === 'hadir' || status === 'lembur') {
    content = '✓';
  } else if (status === 'alpha') {
    bg = '#ef4444';
    color = 'white';
  } else if (status === 'cor') {
    bg = '#9ca3af';
    color = 'white';
  }

  return (
    <td
      style={{
        backgroundColor: bg,
        color,
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '15px',
        padding: '0',
        width: '44px',
        minWidth: '44px',
        height: '52px',
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
  const today = new Date().toISOString().split('T')[0];
  const [selectedWeek, setSelectedWeek]     = useState<string>(today);
  const [workerRows, setWorkerRows]         = useState<WorkerRow[]>([]);
  const [loading, setLoading]               = useState(false);
  const [search, setSearch]                 = useState('');

  const weekDates = getWeekDates(selectedWeek);
  const dateFrom  = toDateStr(weekDates[0]);
  const dateTo    = toDateStr(weekDates[6]);

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
          `/attendance/report?project_id=${selectedProject}&date_from=${dateFrom}&date_to=${dateTo}`,
          { token }
        );
        const details: AttendanceDetail[] = res.data?.detail ?? [];
        const map = new Map<number, WorkerRow>();

        details.forEach((item) => {
          if (!map.has(item.worker_id)) {
            map.set(item.worker_id, {
              worker_id:   item.worker_id,
              worker_name: item.worker_name,
              position:    item.position,
              days:        {},
              total_wage:  0,
            });
          }
          const row = map.get(item.worker_id)!;
          row.days[item.date] = item.status;
          row.total_wage     += item.wage;
        });

        setWorkerRows(Array.from(map.values()));
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [selectedProject, selectedWeek, token, dateFrom, dateTo]);

  const filteredRows = workerRows.filter(r =>
    r.worker_name.toLowerCase().includes(search.toLowerCase())
  );

  const grandTotal   = filteredRows.reduce((s, r) => s + r.total_wage, 0);
  const totalPekerja = filteredRows.length;
  // NO + NAMA + JABATAN + 7 hari + JML HARI + TOTAL UPAH
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
          <button className="btn-outline">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── Card Ringkasan ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
            backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={20} color="#d97706" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Total Upah Minggu Ini
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px', whiteSpace: 'nowrap' }}>
              Rp {new Intl.NumberFormat('id-ID').format(grandTotal)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
            backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={20} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Total Pekerja
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>
              {totalPekerja}{' '}
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>orang</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabel Rekap ─────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table
            className="table"
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              minWidth: '812px',
            }}
          >
            <colgroup>
              <col style={{ width: '44px' }} />  {/* NO */}
              <col style={{ width: '180px' }} /> {/* NAMA */}
              <col style={{ width: '90px' }} />  {/* JABATAN */}
              <col style={{ width: '44px' }} />  {/* S */}
              <col style={{ width: '44px' }} />  {/* S */}
              <col style={{ width: '44px' }} />  {/* R */}
              <col style={{ width: '44px' }} />  {/* K */}
              <col style={{ width: '44px' }} />  {/* J */}
              <col style={{ width: '44px' }} />  {/* S */}
              <col style={{ width: '44px' }} />  {/* M */}
              <col style={{ width: '70px' }} />  {/* JML HARI */}
              <col style={{ width: '120px' }} /> {/* TOTAL UPAH */}
            </colgroup>

            <thead>
              {/* Baris 1 */}
              <tr>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>NO</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle' }}>NAMA PEKERJA</th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>JABATAN</th>
                <th
                  colSpan={7}
                  style={{
                    textAlign: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    letterSpacing: '0.5px',
                  }}
                >
                  HARI KERJA
                </th>
                <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', lineHeight: 1.3 }}>
                  JML<br />HARI
                </th>
                <th rowSpan={2} style={{ textAlign: 'right', verticalAlign: 'middle' }}>TOTAL UPAH</th>
              </tr>
              {/* Baris 2: nama hari + tanggal */}
              <tr>
                {weekDates.map((d, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: 'center',
                      padding: '6px 2px',
                      lineHeight: 1.4,
                      borderRight: i < 6 ? '1px solid var(--border-color)' : undefined,
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
                    Tidak ada rekap absensi untuk minggu ini.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const jmlHari = weekDates.reduce((n, d) => {
                    const s = row.days[toDateStr(d)];
                    return n + (s && s !== 'alpha' ? 1 : 0);
                  }, 0);

                  return (
                    <tr key={row.worker_id}>
                      {/* NO */}
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {idx + 1}
                      </td>

                      {/* NAMA */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                          {row.worker_name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {row.position}
                        </div>
                      </td>

                      {/* JABATAN */}
                      <td style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {row.position}
                      </td>

                      {/* Sel hari — pakai komponen DayCell */}
                      {weekDates.map((d) => (
                        <DayCell key={toDateStr(d)} status={row.days[toDateStr(d)]} />
                      ))}

                      {/* JML HARI */}
                      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
                        {jmlHari}
                      </td>

                      {/* TOTAL UPAH */}
                      <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '13px' }}>
                        {new Intl.NumberFormat('id-ID').format(row.total_wage)}
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Baris TOTAL */}
              {filteredRows.length > 0 && !loading && (
                <tr style={{ backgroundColor: '#fafaf8', borderTop: '2px solid var(--border-color)' }}>
                  <td
                    colSpan={totalCols - 1}
                    style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', padding: '14px 16px' }}
                  >
                    TOTAL:
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {new Intl.NumberFormat('id-ID').format(grandTotal)}
                  </td>
                </tr>
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
