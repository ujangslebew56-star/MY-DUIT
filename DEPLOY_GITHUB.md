# Panduan Deploy MY DUIT ke GitHub Pages (100% Gratis & Otomatis)

Aplikasi **MY DUIT** telah dilengkapi dengan alur kerja otomatis **GitHub Actions** (`.github/workflows/deploy.yml`), konfigurasi `base: './'`, file `.nojekyll`, dan dukungan PWA penuh.

---

## Langkah 1: Buat Repositori Baru di Web GitHub
1. Buka browser dan kunjungi [https://github.com/new](https://github.com/new).
2. Beri nama repositori, contoh: `my-duit`.
3. Pilih visibilitas **Public** (agar GitHub Pages gratis).
4. Klik tombol hijau **Create repository**.

---

## Langkah 2: Unggah File Proyek ke GitHub

### Opsi A: Menggunakan Menu AI Studio (Paling Cepat Tanpa Terminal)
1. Di layar Google AI Studio saat ini, klik menu **Settings** / titik tiga di sudut kanan atas.
2. Pilih **Export to GitHub** (atau hubungkan akun GitHub Anda).
3. Kode akan otomatis dibuatkan repositori dan di-push ke akun GitHub Anda.

### Opsi B: Upload Manual via Web GitHub
1. Di AI Studio, download file proyek via menu **Download ZIP** lalu ekstrak di komputer Anda.
2. Di halaman repositori GitHub Anda yang baru dibuat, klik tautan **uploading an existing file** (*atau klik tombol **Add file** -> **Upload files**)*.
3. Seret (*drag and drop*) seluruh isi folder proyek ke browser.
4. Klik tombol hijau **Commit changes**.

---

## Langkah 3: Mengaktifkan GitHub Pages di Web GitHub
Setelah file berada di repositori GitHub Anda:

1. Di halaman repositori GitHub Anda, klik tab menu **Settings** (ikon gerigi di atas).
2. Di menu sebelah kiri, klik **Pages**.
3. Di bagian **Build and deployment**:
   - Di bawah label **Source**, ubah pilihan dari *"Deploy from a branch"* menjadi **"GitHub Actions"**.
4. Selesai!

---

## Langkah 4: Cek Proses Deploy Otomatis
1. Klik tab **Actions** di bagian atas repositori GitHub Anda.
2. Anda akan melihat proses kerja bernama **"Deploy MY DUIT to GitHub Pages"** sedang berjalan.
3. Tunggu sekitar 1-2 menit hingga muncul tanda centang hijau **✓**.
4. Klik workflow tersebut atau kembali ke tab **Settings -> Pages**. Di sana akan tampil tautan website resmi Anda, misalnya:
   `https://<username-anda>.github.io/my-duit/`

Website Anda kini online secara publik, gratis selamanya, dan dapat dipasang (*install*) di HP Android, iPhone, maupun PC!
