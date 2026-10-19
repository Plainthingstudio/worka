# Task Productivity Controls Design

## Intent

Mempercepat pekerjaan berulang pada halaman Tasks tanpa membuat task list menjadi ramai. Perubahan ini menambahkan duplikasi task/subtask yang terkontrol, kontrol massal untuk tampilan subtask per stage, pewarisan assignee saat membuat subtask, shortcut pembuatan subtask dari list, dan navigasi notifikasi yang selalu dapat menampilkan task tujuan.

## Goals

- User dapat menduplikasi task atau subtask melalui dialog konfirmasi yang menjelaskan data apa saja yang akan disalin.
- User dapat menutup atau membuka seluruh kumpulan subtask dalam satu stage dengan satu aksi.
- User dapat mengisi assignee subtask dari assignee parent tanpa mencari anggota satu per satu.
- User dapat membuka form Create Subtask langsung dari row task.
- Task yang dibuka dari notifikasi tidak tersembunyi oleh filter `My task`.

## Non-goals

- Menambah sistem label baru. Istilah “label” pada requirement dipetakan ke field `task_type` yang sudah ada (`Primary`, `Secondary`, `Tertiary`).
- Menyalin comments, activity history, atau completion timestamp.
- Mendukung subtask bertingkat lebih dari satu level.
- Menyimpan state collapse/expand lintas reload atau lintas perangkat.
- Mengubah perilaku default `My task` untuk kunjungan biasa ke halaman Tasks.

## Constraints and Existing Structure

- Frontend memakai React, TypeScript, shadcn/Radix, dan Appwrite.
- Parent task dan subtask disimpan pada collection `tasks`; subtask dibedakan oleh `parent_task_id`.
- Attachments disimpan pada collection `task_attachments` dan file binary berada pada bucket `task-attachments`.
- `ClickUpTaskList` sudah memiliki state `collapsedSubtasks` per parent task dan collapse seluruh stage melalui header stage.
- `Tasks` saat ini membuka detail berdasarkan query parameter `taskId` dan menginisialisasi `myTasksOnly` ke `true`.
- Tidak ada field `labels`; `task_type` adalah padanan requirement.

## 1. Duplicate Task and Subtask

### Entry point

- Tambahkan aksi `Duplicate` pada menu “More actions” di detail sidebar.
- Aksi tersedia untuk parent task maupun subtask.
- Memilih aksi membuka `DuplicateTaskDialog`; tidak ada duplikasi langsung tanpa konfirmasi.

### Dialog

- Dialog menampilkan judul sumber dan preview judul hasil: `<source title> (Copy)`.
- Judul, project, dan parent relationship merupakan data wajib/struktural, bukan checkbox.
- Status tidak menjadi pilihan copy; setiap hasil duplikasi selalu mulai di `Planning`.
- Jika subtask diduplikasi sendiri, hasilnya tetap berada di parent task yang sama.
- Checkbox tersedia untuk:
  - Description
  - Assignees
  - Due date
  - Task type
  - Attachments
  - All subtasks (hanya untuk parent task yang memiliki subtask)
- Semua checkbox yang relevan aktif secara default.
- Dialog menyatakan bahwa comments tidak disalin.
- Priority tidak disalin karena tidak termasuk pilihan yang diminta; hasil duplikasi menggunakan default `Normal`.
- Bila `Task type` tidak dipilih, hasil menggunakan default `Primary` karena field tersebut wajib.

### Copy behavior

- Parent task baru dibuat lebih dulu dengan ID baru.
- Field pilihan diterapkan ke task hasil; field yang tidak dipilih menggunakan nilai kosong/default.
- `completed_at`, comments, dan activities tidak pernah disalin.
- Jika `All subtasks` dipilih, setiap direct child dibuat ulang di bawah parent baru.
- Field checkbox yang sama juga mengatur data yang disalin pada child copies.
- Judul child yang ikut bersama parent dipertahankan agar struktur checklist tetap terbaca; subtask yang diduplikasi secara individual mendapat suffix `(Copy)`.
- Status setiap child copy juga selalu dimulai di `Planning`.
- Attachment harus menjadi salinan file dan metadata yang independen, bukan dua record yang menunjuk file storage yang sama, agar menghapus attachment pada satu task tidak merusak task lain.
- Setelah selesai, refresh task data dan buka detail task hasil duplikasi.
- Jika task berhasil dibuat tetapi ada attachment atau subtask yang gagal disalin, pertahankan hasil yang sudah dibuat dan tampilkan toast ringkasan partial failure yang menyebut jumlah kegagalan; jangan mengklaim duplikasi sepenuhnya berhasil.
- Gunakan guard `isDuplicating` untuk mencegah double submit.

## 2. Collapse/Expand All Subtasks per Stage

- Di header tiap stage, tambahkan secondary action `Collapse subtasks` bila stage memiliki setidaknya satu parent dengan subtask.
- Aksi hanya memengaruhi parent task yang sedang ditampilkan dalam stage tersebut; stage lain tidak berubah.
- Jika belum semua parent dalam stage collapsed, klik akan memasukkan semua ID parent yang memiliki subtask ke `collapsedSubtasks`.
- Jika semuanya sudah collapsed, label berubah menjadi `Expand subtasks`; klik berikutnya membuka semuanya.
- Chevron stage yang sudah ada tetap berfungsi untuk menyembunyikan seluruh isi stage dan tidak diganti oleh aksi baru.
- State hanya bersifat lokal selama komponen ter-mount.

## 3. Reuse Parent Assignees in Create Subtask

- `SubtaskDialog` menerima daftar assignee parent.
- Di baris label field `Assignees`, tampilkan secondary action `Use parent team · N` beserta avatar ringkas.
- Tombol tidak ditampilkan bila parent tidak memiliki assignee.
- Klik tombol menggabungkan assignee parent dengan pilihan yang sudah ada dan menghapus duplikat; pilihan manual user tidak hilang.
- Setelah diterapkan, teks aksi berubah menjadi state konfirmasi ringkas seperti `Parent team added`.
- User tetap dapat menghapus atau menambah assignee melalui multi-select yang sama sebelum submit.

## 4. Quick Create Subtask from Task List

- `ClickUpTaskList` menerima callback `onAddSubtask(taskId)`.
- Pada row parent task, tampilkan secondary button berikon plus dengan label/tooltip `Create subtask` tepat di samping judul/count.
- Di desktop, button transparan secara default dan terlihat pada `group-hover` atau `group-focus-within` untuk menjaga list tetap ringkas.
- Button tidak muncul pada row subtask.
- Pada perangkat tanpa hover, button tetap dapat diakses agar fitur tidak hilang.
- Klik menghentikan propagasi agar detail task tidak ikut terbuka, lalu membuka `SubtaskDialog` dengan parent yang benar.
- Dialog mendapat parent assignees sehingga fitur “Use parent team” langsung relevan.

## 5. Notification Navigation Must Show the Target Task

- Destination notifikasi task menambahkan penanda eksplisit, misalnya `source=notification`, bersama `taskId` dan parameter existing lainnya.
- Saat `Tasks` menerima `taskId` dengan `source=notification`, set `myTasksOnly` ke `false` sebelum/bersamaan dengan memilih task.
- Navigasi biasa ke `/tasks`, deep link task tanpa penanda notifikasi, dan preferensi user setelah halaman terbuka tetap mempertahankan perilaku existing.
- Penanda tidak perlu disimpan; tujuan hanya memastikan task dari notifikasi tidak tersembunyi pada initial navigation.
- Task detail tetap auto-open seperti sekarang dan project filter tetap diarahkan ke project task tersebut.

## Component and Data Flow

- `Tasks` menjadi orchestrator untuk dialog duplicate dan create subtask, serta menyediakan callbacks ke list/detail.
- `ClickUpTaskList` hanya mengelola state visual collapse dan memanggil callback untuk operasi data.
- `SubtaskDialog` mengelola pengisian assignee parent sebagai interaksi form lokal.
- Helper/service duplikasi mengelola urutan pembuatan task, child copies, dan physical attachment copies sehingga logika data dapat diuji terpisah dari UI.
- `notificationService.getNotificationDestination` memberi marker sumber; `Tasks` mengonsumsi marker tersebut.

## Error Handling and Feedback

- Dialog duplicate menampilkan loading state dan menonaktifkan submit saat operasi berjalan.
- Kegagalan membuat root copy menghentikan operasi dan menampilkan destructive toast.
- Kegagalan child/attachment setelah root berhasil menghasilkan warning/partial-success toast.
- Create Subtask dari list memakai error handling existing.
- Aksi collapse/expand dan pemakaian parent assignees bersifat lokal dan tidak membutuhkan toast.

## Accessibility and Responsive Behavior

- Semua icon button memiliki accessible name/tooltip.
- Hover-only action juga terlihat pada keyboard focus (`focus-within`).
- Dialog dapat dioperasikan dengan keyboard dan mempertahankan pola Radix yang sudah digunakan.
- Pada viewport sentuh, quick-create action tetap tersedia tanpa bergantung pada hover.

## Verification

- Test helper duplicate payload untuk pilihan aktif/nonaktif, suffix judul, default priority/type, status `Planning`, dan parent mapping.
- Test duplikasi parent dengan subtasks dan pastikan comments/activity tidak pernah ikut.
- Test physical attachment copy memakai file ID/URL baru dan task ID baru.
- Test stage toggle: collapse hanya stage target dan klik kedua expand kembali.
- Test `Use parent team` melakukan union tanpa duplikat dan tidak menghapus pilihan manual.
- Test quick-create button hanya pada parent, muncul via hover/focus, menghentikan row click, dan membuka dialog dengan parent ID benar.
- Test destination notifikasi task memiliki marker dan `Tasks` mematikan `My task` hanya untuk marker tersebut.
- Jalankan lint, build, targeted tests, dan seluruh test suite sebelum menyatakan selesai.

## Builder Calls

- Nama helper/component internal dan pembagian file dapat mengikuti pola repository.
- Copy file attachment dapat memakai API Appwrite Storage yang paling sesuai selama hasilnya independen dan deletion-safe.
- Warning copy yang partial dapat memakai toast existing; tidak perlu menambah sistem retry baru.
