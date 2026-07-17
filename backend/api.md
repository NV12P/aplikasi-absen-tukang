Url = `http://localhost:8000/api/`

POST `/api/login` :
  {
      "email": "admin@absen.com",
      "password": "password"
  }

| Method | Endpoint                            | Fungsi                            |
| ------ | ----------------------------------- | --------------------------------- |
| POST   | `/api/login`                        | Login Admin                       |
| POST   | `/api/logout`                       | Logout                            |
| GET    | `/api/profile`                      | Data profil admin                 |
| GET    | `/api/dashboard`                    | Ringkasan dashboard               |
| GET    | `/api/positions`                    | Daftar jabatan                    |
| POST   | `/api/positions`                    | Tambah jabatan                    |
| GET    | `/api/positions/{id}`               | Detail jabatan                    |
| PUT    | `/api/positions/{id}`               | Edit jabatan                      |
| DELETE | `/api/positions/{id}`               | Hapus jabatan                     |
| GET    | `/api/projects`                     | Daftar proyek                     |
| POST   | `/api/projects`                     | Tambah proyek                     |
| GET    | `/api/projects/{id}`                | Detail proyek                     |
| PUT    | `/api/projects/{id}`                | Edit proyek                       |
| DELETE | `/api/projects/{id}`                | Hapus proyek                      |
| GET    | `/api/workers`                      | Daftar pekerja                    |
| POST   | `/api/workers`                      | Tambah pekerja                    |
| GET    | `/api/workers/{id}`                 | Detail pekerja                    |
| PUT    | `/api/workers/{id}`                 | Edit pekerja                      |
| DELETE | `/api/workers/{id}`                 | Hapus pekerja                     |
| GET    | `/api/attendance/project/{project}` | Daftar pekerja berdasarkan proyek |
| POST   | `/api/attendance/store`             | Simpan absensi harian             |
| GET    | `/api/attendance/today`             | Data absensi hari ini             |
| GET    | `/api/attendance/report`            | Rekap absensi mingguan            |
| GET    | `/api/attendance/export`            | Export rekap absensi ke Excel     |