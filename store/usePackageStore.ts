import { create } from 'zustand';
import { PackageState, OpsProject, OpsDepartureGroup } from '../types';

// --- MOCK DATA MIGRATED FROM APP.TS ---
const MOCK_PACKAGES: PackageState[] = [
  {
    id: 'pkg-1',
    status: 'published',
    lastModified: '2025-12-10',
    general: { 
        productName: 'Réveillon à Istanbul - Bosphore & Lumières', 
        productCode: 'TUR-25-REV', 
        responsible: 'Amine K. (Admin)', 
        creationDate: '2025-11-20',
        imageUrl: 'https://images.unsplash.com/photo-1545464522-e42152862c95?q=80&w=2000',
        stock: 30
    },
    destination: 'Turquie',
    cities: ['Istanbul'],
    flights: [
        {
            id: 'f1',
            airline: 'Turkish Airlines (TK)',
            departureDate: '2025-12-29',
            returnDate: '2026-01-04',
            duration: '6 Nuits / 7 Jours',
            details: 'Vol TK652 ALG 10:45 - IST 16:30 / Retour TK653 IST 22:15 - ALG 00:10'
        }
    ],
    visaStatus: 'client',
    transferStatus: 'inclus',
    accommodations: [
        { id: 'h1', name: 'Dosso Dossi Downtown', category: '5 Étoiles', pension: 'BB', mapLink: 'https://maps.app.goo.gl/example' }
    ],
    pricing: [
        { id: 'p1', label: 'Adulte (Double)', unitPrice: '195000', commission: '15000' },
        { id: 'p2', label: 'Adulte (Single)', unitPrice: '265000', commission: '15000' },
        { id: 'p3', label: 'Enfant (2-11)', subLabel: 'Avec Lit', unitPrice: '155000', commission: '10000' }
    ],
    agencyCommission: {
        adulte: { t1: '15000', t2: '15000', t3: '15000' },
        enfant: '10000',
        bebe: '0'
    },
    content: {
        included: '• Billet d\'avion A/R avec Turkish Airlines\n• Transferts Aéroport / Hôtel / Aéroport\n• 06 Nuits en Petit Déjeuner\n• Dîner de Gala du Réveillon sur le Bosphore',
        excluded: '• Assurance voyage\n• Visa (E-Visa)\n• Dépenses personnelles'
    },
    excursions: {
        included: '• Croisière Bosphore\n• Visite Panoramique',
        extra: '• Journée Bursa (Téléphérique inclus) - 60€\n• Sapanca & Masukiye - 45€'
    },
    itinerary: {
        active: true,
        days: [
            { id: 'd1', dayNumber: 1, description: 'Arrivée à Istanbul. Accueil par notre correspondant et transfert à l\'hôtel. Installation et temps libre.' },
            { id: 'd2', dayNumber: 2, description: 'Petit déjeuner. Départ pour une croisière sur le Bosphore pour admirer les yalis ottomans. Après-midi libre à Taksim.' },
            { id: 'd3', dayNumber: 3, description: 'Journée libre ou excursion optionnelle à Bursa (Première capitale ottomane).' },
            { id: 'd4', dayNumber: 4, description: '31 Décembre : Journée libre pour le shopping. Soirée Dîner Gala incluse sur un bateau privé.' },
            { id: 'd5', dayNumber: 5, description: 'Matinée libre. Visite du quartier historique Sultanahmet (Mosquée Bleue, Hippodrome).' },
            { id: 'd6', dayNumber: 6, description: 'Journée libre pour les derniers achats au Grand Bazar.' },
            { id: 'd7', dayNumber: 7, description: 'Transfert vers l\'aéroport pour le vol retour.' }
        ],
        partnerName: 'Bosphorus Tours',
        emergencyContact: '+90 555 987 6543',
        internalNotes: 'Bloquer 10 chambres twin supplémentaires si demande forte.',
        clientInformation: 'Le passeport doit être valide au moins 6 mois après la date de retour. E-visa obligatoire.'
    }
  },
  {
      id: 'pkg-2',
      status: 'published',
      lastModified: '2025-12-10',
      general: { 
          productName: 'Omra Chaâbane & Ramadan 2026', 
          productCode: 'SAU-26-RAM', 
          responsible: 'Karim T. (Designer)', 
          creationDate: '2025-11-01',
          imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2000',
          stock: 70
      },
      destination: 'Arabie Saoudite',
      cities: ['Médine', 'La Mecque'],
      flights: [
          {
            id: 'f1',
            airline: 'Saudi Airlines (SV)',
            departureDate: '2026-02-20',
            returnDate: '2026-03-20',
            duration: '1 Mois',
            details: 'Vol Direct SV ALG-MED / JED-ALG'
          }
      ],
      visaStatus: 'inclus',
      transferStatus: 'inclus',
      accommodations: [
          { id: 'h1', name: 'Rua Al Hijrah (Médine)', category: '4 Étoiles', pension: 'BB', mapLink: '' },
          { id: 'h2', name: 'Voco Makkah', category: '5 Étoiles', pension: 'RO', mapLink: '' }
      ],
      pricing: [
          { id: 'p1', label: 'Quadruple', unitPrice: '380000', commission: '20000' },
          { id: 'p2', label: 'Triple', unitPrice: '450000', commission: '20000' },
          { id: 'p3', label: 'Double', unitPrice: '580000', commission: '20000' }
      ],
      agencyCommission: {
        adulte: { t1: '20000', t2: '20000', t3: '20000' },
        enfant: '15000',
        bebe: '0'
      },
      content: { included: '• Visa Omra\n• Billet d\'avion SV\n• Hébergement\n• Transferts Bus VIP\n• Ziarates', excluded: '• Repas non mentionnés' },
      excursions: { included: '• Ziarates Makkah & Madinah', extra: '' },
      itinerary: { active: true, days: [{ id: 'd1', dayNumber: 1, description: 'Arrivée à Médine, transfert hôtel.'}], partnerName: 'Rawafed', emergencyContact: '+966 50 000 0000', internalNotes: '', clientInformation: 'Vaccin méningite obligatoire. Prévoir Ihram dans le bagage à main pour le retour si escale.' }
  },
  {
    id: 'pkg-3',
    status: 'published',
    lastModified: '2025-12-12',
    general: { 
        productName: 'Dubai Shopping Festival - Février 2026', 
        productCode: 'UAE-26-DSF', 
        responsible: 'Sarah M. (Designer)', 
        creationDate: '2025-12-01',
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=2000',
        stock: 20
    },
    destination: 'Émirats Arabes Unis',
    cities: ['Dubai'],
    flights: [
        {
          id: 'f1',
          airline: 'Air Algérie (AH)',
          departureDate: '2026-02-01',
          returnDate: '2026-02-08',
          duration: '7 Nuits / 8 Jours',
          details: 'Vol AH4060 ALG-DXB 15:30'
        }
    ],
    visaStatus: 'inclus',
    transferStatus: 'inclus',
    accommodations: [{id: 'h1', name: 'Millennium Place Marina', category: '4 Étoiles', pension: 'BB', mapLink: ''}],
    pricing: [{id: 'p1', label: 'Adulte Double', unitPrice: '225000', commission: '12000'}],
    agencyCommission: {
        adulte: { t1: '12000', t2: '12000', t3: '12000' },
        enfant: '8000',
        bebe: '0'
    },
    content: { included: '• Visa UAE\n• Vol Direct\n• Hôtel 4* avec Petit Déjeuner', excluded: '• Tourism Dirham Fee (à payer sur place)' },
    excursions: { included: '• Desert Safari avec Dîner BBQ', extra: '• Burj Khalifa (At the Top) - 55€\n• Museum of the Future - 45€' },
    itinerary: { active: false, days: [], partnerName: 'Arabian Adventures', emergencyContact: '', internalNotes: 'Vérifier validité passeport > 6 mois.', clientInformation: '' }
  },
  {
    id: 'pkg-4',
    status: 'draft',
    lastModified: '2025-12-13',
    general: { 
        productName: 'Evasion Sud - Taghit Février 2026', 
        productCode: 'ALG-26-TAG', 
        responsible: 'Yasmine B. (Designer)', 
        creationDate: '2025-12-05',
        imageUrl: 'https://images.unsplash.com/photo-1506456259021-995f51722df1?q=80&w=2000',
        stock: 15
    },
    destination: 'Algérie',
    cities: ['Taghit', 'Beni Abbes'],
    flights: [
        {
          id: 'f1',
          airline: 'Air Algérie',
          departureDate: '2026-02-10',
          returnDate: '2026-02-15',
          duration: '5 Nuits',
          details: 'Vol ALG-BJR'
        }
    ],
    visaStatus: 'inclus',
    transferStatus: 'inclus',
    accommodations: [{id: 'h1', name: 'Résidence Saoura', category: 'Maison d\'hôte', pension: 'FB', mapLink: ''}],
    pricing: [{id: 'p1', label: 'Adulte', unitPrice: '68000', commission: '5000'}],
    agencyCommission: {
        adulte: { t1: '5000', t2: '5000', t3: '5000' },
        enfant: '3000',
        bebe: '0'
    },
    content: { included: '• Billet Avion\n• Pension Complète\n• Soirée Réveillon Traditionnelle', excluded: '' },
    excursions: { included: '• 4x4 Désert\n• Gravures Rupestres\n• Ksar de Taghit', extra: '' },
    itinerary: { active: true, days: [], partnerName: '', emergencyContact: '', internalNotes: '', clientInformation: '' }
  },
  {
    id: 'pkg-5',
    status: 'published',
    lastModified: '2025-12-14',
    general: { 
        productName: 'Thaïlande : Bangkok & Phuket 2026', 
        productCode: 'THA-26-MAR', 
        responsible: 'Karim T. (Designer)', 
        creationDate: '2025-11-25',
        imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2000',
        stock: 25
    },
    destination: 'Thaïlande',
    cities: ['Bangkok', 'Phuket'],
    flights: [
        {
          id: 'f1',
          airline: 'Qatar Airways (QR)',
          departureDate: '2026-03-05',
          returnDate: '2026-03-17',
          duration: '10 Nuits / 12 Jours',
          details: 'Vol via Doha. Escale courte.'
        }
    ],
    visaStatus: 'client',
    transferStatus: 'inclus',
    accommodations: [
        {id: 'h1', name: 'Novotel Bangkok Platinum', category: '4 Étoiles', pension: 'BB', mapLink: ''},
        {id: 'h2', name: 'Amari Phuket', category: '5 Étoiles', pension: 'BB', mapLink: ''}
    ],
    pricing: [{id: 'p1', label: 'Adulte', unitPrice: '285000', commission: '18000'}],
    agencyCommission: {
        adulte: { t1: '18000', t2: '18000', t3: '18000' },
        enfant: '12000',
        bebe: '0'
    },
    content: { included: '• Vol International\n• Vol Interne BKK-HKT\n• Hôtels 4* et 5*', excluded: '• Visa à l\'arrivée (2000 THB)' },
    excursions: { included: '• Temples de Bangkok', extra: '• Phi Phi Island Speedboat\n• James Bond Island' },
    itinerary: { active: true, days: [], partnerName: 'Asian Trails', emergencyContact: '', internalNotes: '', clientInformation: '' }
  },
  {
    id: 'pkg-6',
    status: 'published',
    lastModified: '2025-12-14',
    general: { 
        productName: 'Maldives - Luxe & Détente Mai 2026', 
        productCode: 'MDV-26-MAY', 
        responsible: 'Yasmine B. (Designer)', 
        creationDate: '2025-12-10',
        imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2000',
        stock: 5
    },
    destination: 'Maldives',
    cities: ['Male', 'Atoll Nord'],
    flights: [
        {
          id: 'f1',
          airline: 'Emirates (EK)',
          departureDate: '2026-05-01',
          returnDate: '2026-05-08',
          duration: '7 Nuits',
          details: 'Vol via Dubai'
        }
    ],
    visaStatus: 'inclus',
    transferStatus: 'inclus',
    accommodations: [{id: 'h1', name: 'Kurumba Maldives', category: '5 Étoiles', pension: 'AI', mapLink: ''}],
    pricing: [{id: 'p1', label: 'Bungalow Plage', unitPrice: '480000', commission: '25000'}],
    agencyCommission: {
        adulte: { t1: '25000', t2: '25000', t3: '25000' },
        enfant: '15000',
        bebe: '0'
    },
    content: { included: '• Vols\n• Transfert Speedboat\n• All Inclusive', excluded: '• Taxe Green Tax (si applicable)' },
    excursions: { included: '', extra: '• Plongée\n• Spa' },
    itinerary: { active: false, days: [], partnerName: '', emergencyContact: '', internalNotes: '', clientInformation: '' }
  }
];

// Helper to generate Ops from Package
const createOpsFromPackage = (pkg: PackageState): OpsProject => ({
    id: `ops-${pkg.id}`,
    packageId: pkg.id!,
    notes: '',
    groups: pkg.flights.map(flight => ({
      id: flight.id, // Using flight ID as group ID for simplicity
      flightId: flight.id,
      departureDate: flight.departureDate,
      status: 'pending_validation',
      isSubcontracted: false,
      airDeposit: { deadline: '', totalAmount: 0, amountToPay: 0, status: 'pending' },
      airBalance: { deadline: '', totalAmount: 0, amountToPay: 0, status: 'pending' },
      namesDeadline: '',
      isLandSubcontracted: false,
      landCurrency: 'DZD',
      landDeposit: { deadline: '', totalAmount: 0, amountToPay: 0, status: 'pending' },
      landBalance: { deadline: '', totalAmount: 0, amountToPay: 0, status: 'pending' },
      roomingListDeadline: '',
      guideAssignmentDeadline: ''
    }))
});

// Generate initial Ops for MOCK_PACKAGES
const INITIAL_OPS = MOCK_PACKAGES.map(createOpsFromPackage);

interface PackageStore {
  packages: PackageState[];
  opsRecords: OpsProject[];
  
  // Actions
  fetchPackages: () => Promise<void>; // Prepared for API
  addPackage: (pkg: PackageState) => void;
  updatePackage: (pkg: PackageState) => void;
  deletePackage: (id: string) => void;
  
  updateOpsRecord: (record: OpsProject) => void;
  updatePackageStock: (packageId: string, amountToSubtract: number) => void;
}

export const usePackageStore = create<PackageStore>((set, get) => ({
  packages: MOCK_PACKAGES,
  opsRecords: INITIAL_OPS,

  fetchPackages: async () => {
    // TODO: Connect to Supabase here
    // const { data } = await supabase.from('packages').select('*');
    // set({ packages: data });
  },

  addPackage: (pkg) => set((state) => {
    // When adding a package, also create the Ops Record
    const newOps = createOpsFromPackage(pkg);
    return { 
        packages: [pkg, ...state.packages],
        opsRecords: [...state.opsRecords, newOps]
    };
  }),

  updatePackage: (pkg) => set((state) => ({
    packages: state.packages.map((p) => (p.id === pkg.id ? pkg : p)),
  })),

  deletePackage: (id) => set((state) => ({
    packages: state.packages.filter((p) => p.id !== id),
    // Also remove associated ops record
    opsRecords: state.opsRecords.filter((o) => o.packageId !== id),
  })),

  updateOpsRecord: (updatedRecord) => set((state) => ({
    opsRecords: state.opsRecords.map((r) => r.id === updatedRecord.id ? updatedRecord : r)
  })),

  updatePackageStock: (packageId, amountToSubtract) => set((state) => {
      const pkgIndex = state.packages.findIndex(p => p.id === packageId);
      if (pkgIndex === -1) return {};

      const pkg = state.packages[pkgIndex];
      const updatedPkg = {
          ...pkg,
          general: { ...pkg.general, stock: (pkg.general.stock || 0) - amountToSubtract }
      };
      
      const newPackages = [...state.packages];
      newPackages[pkgIndex] = updatedPkg;
      
      return { packages: newPackages };
  })
}));
