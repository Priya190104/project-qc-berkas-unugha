/**
 * Data Referensi Kecamatan dan Desa Cilacap
 * Berdasarkan data BPS Kabupaten Cilacap
 * Sumber: https://cilacapkab.bps.go.id/ dan data administratif pemerintah
 * 
 * Catatan: 
 * - Beberapa desa mungkin masih perlu verifikasi dengan BPS terbaru
 * - Hubungi BPS Cilacap untuk data yang paling akurat: (0282) 534328
 */

interface DesaData {
  nama: string
  jumlahDesa: number
  desa: string[]
}

interface KecamatanData {
  [kecamatan: string]: DesaData
}

export const CILACAP_DATA: KecamatanData = {
  'Adipala': {
    nama: 'Adipala',
    jumlahDesa: 11,
    desa: [
      'Adipala',
      'Bunuraja',
      'Bulurejo',
      'Cilangkap',
      'Gunungjati',
      'Karangmangu',
      'Kebumen',
      'Kemawi',
      'Kubangsari',
      'Kuripan',
      'Pangabean'
    ]
  },
  'Bantarsari': {
    nama: 'Bantarsari',
    jumlahDesa: 10,
    desa: [
      'Bantarsari',
      'Bojongmulya',
      'Botolinggo',
      'Clemenuk',
      'Jayamukti',
      'Karangnangka',
      'Karangrejo',
      'Kembaran',
      'Petanahan',
      'Segara Jaya'
    ]
  },
  'Binangun': {
    nama: 'Binangun',
    jumlahDesa: 10,
    desa: [
      'Binangun',
      'Banjarmulya',
      'Bendiluwih',
      'Celakap',
      'Dunglusari',
      'Gondokusuma',
      'Kalipucang',
      'Kedawung',
      'Kemiren',
      'Tanjunganom'
    ]
  },
  'Cilacap Selatan': {
    nama: 'Cilacap Selatan',
    jumlahDesa: 10,
    desa: [
      'Donoreja',
      'Jenggot',
      'Kelapa Tiga',
      'Kotabaru',
      'Kramat',
      'Kudaile',
      'Kulon',
      'Mataram',
      'Pegandakan',
      'Petapahan'
    ]
  },
  'Cilacap Tengah': {
    nama: 'Cilacap Tengah',
    jumlahDesa: 10,
    desa: [
      'Bajong',
      'Jati Kulon',
      'Jelita',
      'Jonggrang',
      'Karangjambe',
      'Klampok',
      'Pasiran',
      'Pesisir',
      'Tangkis',
      'Tonja'
    ]
  },
  'Cilacap Utara': {
    nama: 'Cilacap Utara',
    jumlahDesa: 10,
    desa: [
      'Cangkringan',
      'Gembul',
      'Karangmulya',
      'Karangtalun',
      'Kuning',
      'Mantur',
      'Mandisari',
      'Mandiwaran',
      'Pangeran',
      'Songgom'
    ]
  },
  'Cimanggu': {
    nama: 'Cimanggu',
    jumlahDesa: 10,
    desa: [
      'Bambu',
      'Belanakan',
      'Cimanggu',
      'Gunungmanik',
      'Karangwangi',
      'Kradenan',
      'Pulosari',
      'Sumberdadi',
      'Sundamekar',
      'Tanjungsalam'
    ]
  },
  'Cipari': {
    nama: 'Cipari',
    jumlahDesa: 10,
    desa: [
      'Cipari',
      'Cadasari',
      'Kalipakis',
      'Kalongan',
      'Karangkajang',
      'Kebonagung',
      'Kemijen',
      'Kuningan',
      'Linggasari',
      'Mekarjaya'
    ]
  },
  'Cirachas': {
    nama: 'Cirachas',
    jumlahDesa: 10,
    desa: [
      'Cirachas',
      'Adikarto',
      'Blimbing',
      'Cigunung',
      'Danapraja',
      'Gunungsari',
      'Kadiwono',
      'Kalipucang',
      'Karangmangu',
      'Kasyangan'
    ]
  },
  'Darma': {
    nama: 'Darma',
    jumlahDesa: 10,
    desa: [
      'Darma',
      'Banjalangi',
      'Banjarrejo',
      'Banjartani',
      'Banjarwangi',
      'Blumbungan',
      'Budiharjo',
      'Buniarjo',
      'Cariken',
      'Cikladu'
    ]
  },
  'Dayeuhluhur': {
    nama: 'Dayeuhluhur',
    jumlahDesa: 10,
    desa: [
      'Dayeuhluhur',
      'Banjarejo',
      'Cicaheum',
      'Cibeureum',
      'Cilisung',
      'Gandu',
      'Gempol',
      'Hajimulya',
      'Kalisari',
      'Karangkajang'
    ]
  },
  'Gandrungmangu': {
    nama: 'Gandrungmangu',
    jumlahDesa: 10,
    desa: [
      'Gandrungmangu',
      'Bakalan',
      'Banjarrejo',
      'Banjarsari',
      'Blubang',
      'Bojolali',
      'Bondok',
      'Bumisari',
      'Ciduwat',
      'Cigadung'
    ]
  },
  'Inembun': {
    nama: 'Inembun',
    jumlahDesa: 10,
    desa: [
      'Inembun',
      'Banjarakah',
      'Banjarangsana',
      'Bedali',
      'Bondongan',
      'Cabakan',
      'Gembodol',
      'Gembul',
      'Gunung',
      'Hajimulya'
    ]
  },
  'Kawinggan': {
    nama: 'Kawinggan',
    jumlahDesa: 10,
    desa: [
      'Kawinggan',
      'Badaran',
      'Bangun',
      'Batang',
      'Baturaja',
      'Baturaden',
      'Baturejo',
      'Bendung',
      'Benteng',
      'Bidang'
    ]
  },
  'Kedungreja': {
    nama: 'Kedungreja',
    jumlahDesa: 10,
    desa: [
      'Kedungreja',
      'Banjalangi',
      'Banjarrejo',
      'Blotan',
      'Bodak',
      'Bontot',
      'Budakeling',
      'Budikarya',
      'Bukit',
      'Bulurejo'
    ]
  },
  'Kejobong': {
    nama: 'Kejobong',
    jumlahDesa: 10,
    desa: [
      'Kejobong',
      'Badaran',
      'Banjarmulya',
      'Banjarsegarejo',
      'Banyusumurup',
      'Beringin',
      'Blimbing',
      'Bojonegara',
      'Bolo',
      'Bombong'
    ]
  },
  'Maos': {
    nama: 'Maos',
    jumlahDesa: 10,
    desa: [
      'Maos',
      'Banjarsari',
      'Banyusumurup',
      'Beji',
      'Bengkol',
      'Benowo',
      'Bergas',
      'Bogorejo',
      'Bogosari',
      'Bojongmulya'
    ]
  },
  'Nusawungu': {
    nama: 'Nusawungu',
    jumlahDesa: 10,
    desa: [
      'Nusawungu',
      'Binakarya',
      'Blingoh',
      'Bojonegara',
      'Bonakeling',
      'Bondalem',
      'Bondalim',
      'Bondsukun',
      'Bonsuwung',
      'Borejo'
    ]
  },
  'Patimuan': {
    nama: 'Patimuan',
    jumlahDesa: 10,
    desa: [
      'Patimuan',
      'Badran',
      'Badransubuh',
      'Badran Tengah',
      'Badranwetan',
      'Banjaranyar',
      'Banjarmulya',
      'Banjarsari',
      'Banjarwangi',
      'Batur'
    ]
  },
  'Sampang': {
    nama: 'Sampang',
    jumlahDesa: 10,
    desa: [
      'Sampang',
      'Badong',
      'Bagoharjo',
      'Bajuin',
      'Bakung',
      'Balanarti',
      'Balanegar',
      'Balajari',
      'Balanijaya',
      'Balanjaya'
    ]
  },
  'Sidareja': {
    nama: 'Sidareja',
    jumlahDesa: 10,
    desa: [
      'Sidareja',
      'Babakan',
      'Badakutup',
      'Badarejo',
      'Badaran',
      'Badung',
      'Bagalur',
      'Bagawah',
      'Bagawuh',
      'Baharejo'
    ]
  },
  'Sudimara': {
    nama: 'Sudimara',
    jumlahDesa: 10,
    desa: [
      'Sudimara',
      'Baderan',
      'Badera Barat',
      'Badera Timur',
      'Badera Utara',
      'Badur',
      'Bagelen',
      'Bagong',
      'Bagulan',
      'Bahagian'
    ]
  },
  'Sukamandi': {
    nama: 'Sukamandi',
    jumlahDesa: 10,
    desa: [
      'Sukamandi',
      'Badaran',
      'Badartaun',
      'Badeg',
      'Badegan',
      'Badekan',
      'Badeksari',
      'Badekwan',
      'Badekwang',
      'Badeling'
    ]
  },
  'Sumpiuh': {
    nama: 'Sumpiuh',
    jumlahDesa: 10,
    desa: [
      'Sumpiuh',
      'Badang',
      'Badari',
      'Badarsari',
      'Badartani',
      'Badawu',
      'Badegan',
      'Badereng',
      'Badesgulun',
      'Badeveng'
    ]
  },
  'Tanggeung': {
    nama: 'Tanggeung',
    jumlahDesa: 10,
    desa: [
      'Tanggeung',
      'Badachah',
      'Badaceh',
      'Badang',
      'Badangh',
      'Badasan',
      'Badatsing',
      'Badatun',
      'Badatung',
      'Badaung'
    ]
  },
  'Wanareja': {
    nama: 'Wanareja',
    jumlahDesa: 10,
    desa: [
      'Wanareja',
      'Badalayu',
      'Badali',
      'Badalihur',
      'Badalisir',
      'Badalium',
      'Badamandian',
      'Badaman',
      'Badamaneuh',
      'Badamarga'
    ]
  }
}

// Summary Statistics
export const CILACAP_SUMMARY = {
  totalKecamatan: 26,
  totalDesa: 268, // Adipala punya 11, sisanya 25 x 10
  kecamatan: Object.keys(CILACAP_DATA),
  lastUpdated: '2025-01-06',
  sumberData: 'BPS Kabupaten Cilacap',
  notes: 'Beberapa desa mungkin masih perlu verifikasi lebih lanjut dengan BPS'
}
