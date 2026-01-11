export const STATUS_COLORS: Record<string, string> = {
  DATA_BERKAS: 'bg-blue-100 text-blue-800',
  DATA_UKUR: 'bg-yellow-100 text-yellow-800',
  PEMETAAN: 'bg-purple-100 text-purple-800',
  KKS: 'bg-indigo-100 text-indigo-800',
  KASI: 'bg-pink-100 text-pink-800',
  SELESAI: 'bg-green-100 text-green-800',
  REVISI: 'bg-orange-100 text-orange-800',
  TUNGGAKAN: 'bg-red-100 text-red-800',
}

export const STATUS_LABELS: Record<string, string> = {
  DATA_BERKAS: 'Data Berkas',
  DATA_UKUR: 'Data Ukur',
  PEMETAAN: 'Pemetaan',
  KKS: 'KKS',
  KASI: 'KASI',
  SELESAI: 'Selesai',
  REVISI: 'Revisi',
  TUNGGAKAN: 'Tunggakan',
}

export const JENIS_PERMOHONAN = [
  'Ukur PB',
  'Pemecahan',
  'Penggabungan',
  'Pemisahan',
  'Penataan Batas',
  'Pengembalian Batas',
  'Ukur Ulang',
]

export const KECAMATAN_CILACAP = [
  'Kedungreja',
  'Kesugihan',
  'Adipala',
  'Binangun',
  'Nusawungu',
  'Kroya',
  'Maos',
  'Jeruklegi',
  'Kawunganten',
  'Gandrungmangu',
  'Sidareja',
  'Karangpucung',
  'Cimanggu',
  'Majenang',
  'Wanareja',
  'Dayeuhluhur',
  'Cipari',
  'Sampang',
  'Patimuan',
  'Bantarsari',
  'Cilacap Selatan',
  'Cilacap Tengah',
  'Cilacap Utara',
  'Kampung Laut',
]

export const DESA_CILACAP: Record<string, string[]> = {
  'Kedungreja': ['Bentar', 'Bentar Anyar', 'Blubur', 'Cikalong', 'Ciklapa', 'Curugbatu', 'Kadarkraton', 'Kalimanah', 'Karangpakis', 'Kemukus', 'Tembuku'],
  'Kesugihan': ['Argapura', 'Bandarkembar', 'Banjararum', 'Bodas', 'Ciparage', 'Doyang', 'Gabus', 'Gabuswetan', 'Gunungtelu', 'Kalikudi', 'Karangkurip', 'Karangreja', 'Karangsugihan', 'Kesugihan Kidul', 'Kesugihan Lor', 'Klidang'],
  'Adipala': ['Adipala', 'Adiwerna', 'Banjar', 'Bawang', 'Benda', 'Blambangan', 'Bonjol', 'Budangsari', 'Bunton', 'Cimucing', 'Cimucuk', 'Kaliwulu', 'Karangombo', 'Karangsurat', 'Purwoharjo', 'Supai'],
  'Binangun': ['Alangamba', 'Bangkal', 'Binangun', 'Jati', 'Jepara Kulon', 'Jepara Wetan', 'Karangnangka', 'Kemojing', 'Kepudang', 'Pagubugan', 'Pagubugan Kulon', 'Pasuruhan', 'Pesawahan', 'Sidaurip', 'Sidayu', 'Widarapayung Kulon', 'Widarapayung Wetan'],
  'Nusawungu': ['Banjareja', 'Banjarsari', 'Banjarwaru', 'Danasri', 'Danasri Kidul', 'Danasri Lor', 'Jetis', 'Karangpakis', 'Karangputat', 'Karangsembung', 'Karangtawang', 'Kedungbenda', 'Klumprit', 'Nusawangkal', 'Nusawungu', 'Purwadadi', 'Sikanco'],
  'Kroya': ['Ayamalas', 'Bajing', 'Bajing Kulon', 'Buntu', 'Gentasari', 'Karangmangu', 'Karangturi', 'Kedawung', 'Kroya', 'Mergawati', 'Mujur', 'Mujur Lor', 'Pekuncen', 'Pesanggrahan', 'Pucung Kidul', 'Pucung Lor', 'Sikampuh'],
  'Maos': ['Glempang', 'Kalijaran', 'Karangkemiri', 'Karangreja', 'Karangrena', 'Klapagada', 'Maos Kidul', 'Maos Lor', 'Mernek', 'Panisihan'],
  'Jeruklegi': ['Brebeg', 'Cilibang', 'Citepus', 'Jambusari', 'Jeruklegi Kulon', 'Jeruklegi Wetan', 'Karangkemiri', 'Mendala', 'Prapagan', 'Sawangan', 'Sumingkir', 'Tritih Wetan', 'Tritih Lor'],
  'Kawunganten': ['Babakan', 'Bojong', 'Bringkeng', 'Grugu', 'Kalijeruk', 'Kawunganten', 'Kawunganten Lor', 'Kubangkangkung', 'Mentasan', 'Sarwadadi', 'Sidaurip', 'Ujungmanik'],
  'Gandrungmangu': ['Bulusari', 'Cinangsi', 'Cisumur', 'Gandrungmangu', 'Gandrungmanis', 'Gintungreja', 'Karanganyar', 'Karanggintung', 'Kertajaya', 'Layansari', 'Muktisari', 'Rungkang', 'Sidaurip', 'Wringinharjo'],
  'Sidareja': ['Gunungreja', 'Karanggedang', 'Kunci', 'Margasari', 'Penyarang', 'Sidamulya', 'Sidareja', 'Sudagaran', 'Tegalsari', 'Tinggarjaya'],
  'Karangpucung': ['Babakan', 'Bengbulang', 'Cidadap', 'Ciporos', 'Ciruyung', 'Gunungtelu', 'Karangpucung', 'Pamulihan', 'Pengawaren', 'Sidamulya', 'Sindangbarang', 'Surusunda', 'Tayem', 'Tayem Timur'],
  'Cimanggu': ['Bantarmangu', 'Bantarpanjang', 'Cibalung', 'Cijati', 'Cilempuyang', 'Cimanggu', 'Cisalak', 'Karangreja', 'Karangsari', 'Kutabima', 'Mandala', 'Negarajati', 'Panimbang', 'Pesahangan', 'Rejodadi'],
  'Sampang': ['Brani', 'Karangasem', 'Karangjati', 'Karangtengah', 'Ketanggung', 'Nusajati', 'Paberasan', 'Paketingan', 'Sampang', 'Sidasari'],
  'Cilacap Selatan': ['Cilacap', 'Sidakaya', 'Tambakreja', 'Tegalkamulyan', 'Tegalrejo'],
  'Cilacap Tengah': ['Donan', 'Gunungsimping', 'Kutawaru', 'Lomanis', 'Sidanegara'],
  'Cilacap Utara': ['Gumilir', 'Karangtalun', 'Kebonmanis', 'Mertasinga', 'Tritih Kulon'],
  // Kecamatan dengan data lengkap masih dalam verifikasi
  'Majenang': [],
  'Wanareja': [],
  'Dayeuhluhur': [],
  'Cipari': [],
  'Patimuan': [],
  'Bantarsari': [],
  'Kampung Laut': [],
}

export const formatDate = (date: Date | string | null): string => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export const formatDatetime = (date: Date | string | null): string => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const calculateDaysOverdue = (tanggal: Date | string | null): number => {
  if (!tanggal) return 0
  const target = new Date(tanggal)
  const today = new Date()
  const diffTime = today.getTime() - target.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}
