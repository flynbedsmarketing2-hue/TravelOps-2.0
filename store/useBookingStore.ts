import { create } from 'zustand';
import { Booking } from '../types';

const DEFAULT_BOOKINGS: Booking[] = [
    // Bookings for pkg-1: Réveillon Istanbul
    {
        id: 'bk-1',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'HEDIDANE NADIA (ADL)',
        agencyName: 'TALINE TASSILI SAFARI',
        numberOfRooms: 1,
        roomType: 'SINGLE',
        rooms: [
            { id: 'r1', roomType: 'SINGLE', occupants: [{ id: 'p1', fullName: 'HEDIDANE NADIA', type: 'ADL' }] }
        ],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 1,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '+213 555 58 59 05',
        otherInfo: 'Hôtel : Gloria Hotel & Suites Doha La cliente dispose déjà d\'un visa le numéro de la cliente : +213542581014',
        bookingType: 'Confirmée',
        bookingDate: '2025-11-27T10:48:01',
        salesAgentId: '3',
        salesAgentName: 'BOUCHIBA OUANASSA',
        passportScans: [],
        requiredDocuments: []
    },
    {
        id: 'bk-2',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'KAABECHE MOHAMED (ADL)',
        agencyName: 'OUAIS VOYAGE',
        numberOfRooms: 1,
        roomType: 'DEMI DOUBLE HOMME',
        rooms: [
            { id: 'r1', roomType: 'DEMI DOUBLE HOMME', occupants: [{ id: 'p1', fullName: 'KAABECHE MOHAMED', type: 'ADL' }] }
        ],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 1,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '+213 774 85 51 96',
        otherInfo: 'Il dispose déjà du visa / GLORIA HTL',
        bookingType: 'Confirmée',
        bookingDate: '2025-12-07T06:37:44',
        salesAgentId: '5',
        salesAgentName: 'CHEBBAH MALAK LYDIA',
        passportScans: [],
        requiredDocuments: []
    },
    {
        id: 'bk-3',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'khalef issam (ADL)',
        agencyName: 'plaisance',
        numberOfRooms: 1,
        roomType: 'DOUBLE',
        rooms: [
             { id: 'r1', roomType: 'DOUBLE', occupants: [{ id: 'p1', fullName: 'khalef issam', type: 'ADL' }, { id: 'p2', fullName: 'marouf rayen', type: 'ADL' }] }
        ],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 2,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '',
        otherInfo: 'numéro de l\'agence 657 67 81 99',
        bookingType: 'Confirmée',
        bookingDate: '2025-12-04T13:12:12',
        salesAgentId: '6',
        salesAgentName: 'MERHOUM SOUHA',
        passportScans: [],
        requiredDocuments: []
    },
     {
        id: 'bk-4',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'marouf rayen (ADL)',
        agencyName: 'plaisance',
        numberOfRooms: 1,
        roomType: 'DOUBLE',
        rooms: [], // Legacy data support
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 2,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '',
        otherInfo: 'numéro de l\'agence 657 67 81 99',
        bookingType: 'Confirmée',
        bookingDate: '2025-12-04T13:12:12',
        salesAgentId: '6',
        salesAgentName: 'MERHOUM SOUHA',
        passportScans: [],
        requiredDocuments: []
    },
    {
        id: 'bk-5',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'BENAMAR SOFIANE (ADL)',
        agencyName: 'SOLEIL VOYAGES',
        numberOfRooms: 1,
        roomType: 'TRIPLE',
        rooms: [
             { id: 'r1', roomType: 'TRIPLE', occupants: [
                 { id: 'p1', fullName: 'BENAMAR SOFIANE', type: 'ADL' },
                 { id: 'p2', fullName: 'BENAMAR AMINE', type: 'ADL' },
                 { id: 'p3', fullName: 'BENAMAR SARAH', type: 'ADL' }
             ]}
        ],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 3,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '+213 661 22 33 44',
        otherInfo: 'Lit bébé demandé pour un infant non compté',
        bookingType: 'Confirmée',
        bookingDate: '2025-12-01T09:15:00',
        salesAgentId: '3',
        salesAgentName: 'OMAR DJELLAB',
        passportScans: [],
        requiredDocuments: []
    },
    {
        id: 'bk-6',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'ZERGANE AMEL (ADL)',
        agencyName: 'NOMADE TRAVEL',
        numberOfRooms: 1,
        roomType: 'DEMI DOUBLE FEMME',
        rooms: [{id: 'r1', roomType: 'DEMI DOUBLE FEMME', occupants: [{id: 'p1', fullName: 'ZERGANE AMEL', type: 'ADL'}]}],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 1,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '+213 550 99 88 77',
        otherInfo: 'Régime végétarien strict',
        bookingType: 'Confirmée',
        bookingDate: '2025-12-05T14:20:30',
        salesAgentId: '5',
        salesAgentName: 'SOFIA LAABIDI',
        passportScans: [],
        requiredDocuments: []
    },
    {
        id: 'bk-7',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'HAMDI KARIM (ADL)',
        agencyName: 'TASSILI AIR',
        numberOfRooms: 1,
        roomType: 'SINGLE',
        rooms: [{id: 'r1', roomType: 'SINGLE', occupants: [{id: 'p1', fullName: 'HAMDI KARIM', type: 'ADL'}]}],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 1,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '+213 771 11 22 33',
        otherInfo: 'Client VIP - Vue Bosphore si possible',
        bookingType: 'Confirmée',
        bookingDate: '2025-11-30T11:05:10',
        salesAgentId: '6',
        salesAgentName: 'MEHDI RAHMANI',
        passportScans: [],
        requiredDocuments: []
    },
    {
        id: 'bk-8',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'SAADI LEILA (ADL)',
        agencyName: 'OUAIS VOYAGE',
        numberOfRooms: 1,
        roomType: 'DEMI DOUBLE FEMME',
        rooms: [{id: 'r1', roomType: 'DEMI DOUBLE FEMME', occupants: [{id: 'p1', fullName: 'SAADI LEILA', type: 'ADL'}]}],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 1,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '+213 662 44 55 66',
        otherInfo: 'Partage avec Mme Zergane si possible',
        bookingType: 'Confirmée',
        bookingDate: '2025-12-06T10:00:00',
        salesAgentId: '5',
        salesAgentName: 'CHEBBAH MALAK LYDIA',
        passportScans: [],
        requiredDocuments: []
    },
    {
        id: 'bk-9',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'FAMILLE BOURAS (3 ADL + 1 CHD)',
        agencyName: 'ALGERIE TOURS',
        numberOfRooms: 2,
        roomType: 'DOUBLE',
        rooms: [
            { id: 'r1', roomType: 'DOUBLE', occupants: [{id: 'p1', fullName: 'BOURAS ALI', type: 'ADL'}, {id: 'p2', fullName: 'BOURAS MINA', type: 'ADL'}] },
            { id: 'r2', roomType: 'TWIN', occupants: [{id: 'p3', fullName: 'BOURAS SAMY', type: 'ADL'}, {id: 'p4', fullName: 'BOURAS LINA', type: 'CHD'}] }
        ],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 3,
        childCount: 1,
        infantCount: 0,
        phoneNumber: '+213 558 77 66 55',
        otherInfo: '1 Double + 1 Twin (Enfants)',
        bookingType: 'En option',
        reservedUntil: '2025-12-15T18:00',
        bookingDate: '2025-12-10T16:45:00',
        salesAgentId: '3',
        salesAgentName: 'OMAR DJELLAB',
        passportScans: [],
        requiredDocuments: []
    },
    {
        id: 'bk-10',
        packageId: 'pkg-1',
        packageName: 'Réveillon à Istanbul - Bosphore & Lumières',
        clientName: 'KACI MOULOUD (ADL)',
        agencyName: 'PLAISANCE',
        numberOfRooms: 1,
        roomType: 'QUADRUPLE',
        rooms: [{id: 'r1', roomType: 'QUADRUPLE', occupants: [
            {id: 'p1', fullName: 'KACI MOULOUD', type: 'ADL'},
            {id: 'p2', fullName: 'KACI AMINE', type: 'ADL'},
            {id: 'p3', fullName: 'KACI KARIM', type: 'ADL'},
            {id: 'p4', fullName: 'KACI OMAR', type: 'ADL'}
        ]}],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 4,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '+213 779 88 55 22',
        otherInfo: 'Groupe d\'amis',
        bookingType: 'Confirmée',
        bookingDate: '2025-12-02T09:30:00',
        salesAgentId: '6',
        salesAgentName: 'MERHOUM SOUHA',
        passportScans: [],
        requiredDocuments: []
    },
    // Bookings for pkg-2: Omra
    {
        id: 'bk-11',
        packageId: 'pkg-2',
        packageName: 'Omra Chaâbane & Ramadan 2026',
        clientName: 'HAJJA FATIMA',
        agencyName: 'ELQODS VOYAGES',
        numberOfRooms: 1,
        roomType: 'QUADRUPLE',
        rooms: [{id: 'r1', roomType: 'QUADRUPLE', occupants: [
            {id: 'p1', fullName: 'HAJJA FATIMA', type: 'ADL'},
            {id: 'p2', fullName: 'SAID ALI', type: 'ADL'},
            {id: 'p3', fullName: 'SAID OMAR', type: 'ADL'},
            {id: 'p4', fullName: 'SAID YOUSSEF', type: 'ADL'}
        ]}],
        invoiceBlackbird: '',
        invoicePlatform: '',
        adultCount: 4,
        childCount: 0,
        infantCount: 0,
        phoneNumber: '+213 555 00 11 22',
        otherInfo: 'Besoin de chaise roulante à l\'aéroport',
        bookingType: 'Confirmée',
        bookingDate: '2025-12-08T11:20:00',
        salesAgentId: '5',
        salesAgentName: 'SOFIA LAABIDI',
        passportScans: [],
        requiredDocuments: []
    }
];

interface BookingStore {
  bookings: Booking[];
  fetchBookings: () => Promise<void>;
  addBooking: (booking: Booking) => void;
  // TODO: updateBooking, deleteBooking
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: DEFAULT_BOOKINGS,
  
  fetchBookings: async () => {
    // TODO: Connect to Supabase
  },

  addBooking: (booking) => set((state) => ({
    bookings: [booking, ...state.bookings]
  })),
}));
