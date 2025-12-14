import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PackageForm } from './components/PackageForm';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { SalesManagement } from './components/SalesManagement';
import { VoyageList } from './components/VoyageList';
import { OpsDashboard } from './components/OpsDashboard';
import { OpsManager } from './components/OpsManager';
import { PackageState, User, UserRole, Booking, OpsProject, OpsDepartureGroup } from './types';

// Enhanced Mock Data
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

const DEFAULT_USERS: User[] = [
    { id: '1', username: 'admin', password: 'password', fullName: 'Amine K. (Admin)', role: 'administrator', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200' },
    { id: '2', username: 'sarah', password: 'password', fullName: 'Sarah M. (Designer)', role: 'travel_designer', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' },
    { id: '3', username: 'omar', password: 'password', fullName: 'Omar D. (Commercial)', role: 'sales_agent', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200' },
    { id: '4', username: 'yasmine', password: 'password', fullName: 'Yasmine B. (Designer)', role: 'travel_designer', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200' },
    { id: '5', username: 'sofia', password: 'password', fullName: 'Sofia L. (Commercial)', role: 'sales_agent', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' },
    { id: '6', username: 'mehdi', password: 'password', fullName: 'Mehdi R. (Commercial)', role: 'sales_agent', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200' },
    { id: '7', username: 'karim', password: 'password', fullName: 'Karim T. (Designer)', role: 'travel_designer', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200' },
    { id: '8', username: 'viewer', password: 'password', fullName: 'Consultant (Viewer)', role: 'viewer', avatarUrl: '' }
];

// Ops Helper: Generate initial empty Ops records for a package
const generateInitialOps = (packages: PackageState[]): OpsProject[] => {
  return packages.map(pkg => ({
    id: `ops-${pkg.id}`,
    packageId: pkg.id!,
    notes: '',
    groups: pkg.flights.map(flight => ({
      id: flight.id, // Using flight ID as group ID for simplicity, assuming 1 group per flight
      flightId: flight.id,
      departureDate: flight.departureDate,
      status: 'pending_validation', // Default new groups to pending
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
  }));
};

export default function App() {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'users' | 'sales' | 'voyages' | 'ops'>('dashboard');
  const [packages, setPackages] = useState<PackageState[]>(MOCK_PACKAGES);
  const [bookings, setBookings] = useState<Booking[]>(DEFAULT_BOOKINGS);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [opsRecords, setOpsRecords] = useState<OpsProject[]>(() => generateInitialOps(MOCK_PACKAGES));
  
  const [editingPackage, setEditingPackage] = useState<PackageState | null>(null);
  
  // Ops View State
  const [selectedOpsGroup, setSelectedOpsGroup] = useState<{pkg: PackageState, group: OpsDepartureGroup} | null>(null);

  // Sync Ops records when packages change (simple sync for new packages)
  useEffect(() => {
      const existingIds = new Set(opsRecords.map(r => r.packageId));
      const newPackages = packages.filter(p => p.id && !existingIds.has(p.id));
      
      if (newPackages.length > 0) {
          const newOps = generateInitialOps(newPackages);
          setOpsRecords(prev => [...prev, ...newOps]);
      }
  }, [packages]);

  // --- Auth Handlers ---
  const handleLogin = async (u: string, p: string) => {
    const foundUser = users.find(user => user.username === u && user.password === p);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setEditingPackage(null);
    setSelectedOpsGroup(null);
  };

  // --- Package Handlers ---
  const handleCreatePackage = () => {
    setEditingPackage(null);
    setCurrentView('form');
  };

  const handleEditPackage = (pkg: PackageState) => {
    setEditingPackage(pkg);
    setCurrentView('form');
  };

  const handleDuplicatePackage = (pkg: PackageState) => {
    const newPkg = {
      ...pkg,
      id: undefined, // Will be generated
      general: {
        ...pkg.general,
        productName: `${pkg.general.productName} (Copie)`,
        productCode: `${pkg.general.productCode}-COPY`,
        creationDate: new Date().toLocaleDateString('fr-FR'),
      },
      status: 'draft' as const
    };
    setEditingPackage(newPkg);
    setCurrentView('form');
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce package ?")) {
      setPackages(prev => prev.filter(p => p.id !== id));
      // Also cleanup Ops? For now, we leave them or filter them out in display
    }
  };

  const handleSavePackage = (data: PackageState, isDraft: boolean) => {
    const newPackage = {
      ...data,
      id: data.id || `pkg-${Date.now()}`,
      status: isDraft ? 'draft' : 'published',
      lastModified: new Date().toISOString().split('T')[0]
    } as PackageState;

    if (data.id) {
      // Update
      setPackages(prev => prev.map(p => p.id === data.id ? newPackage : p));
    } else {
      // Create
      setPackages(prev => [newPackage, ...prev]);
    }
    setCurrentView('dashboard');
  };

  // --- User Handlers ---
  const handleAddUser = (newUser: Omit<User, 'id'>) => {
      const u = { ...newUser, id: Date.now().toString() };
      setUsers([...users, u]);
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (id: string) => {
      setUsers(users.filter(u => u.id !== id));
  };

  // --- Booking Handlers ---
  const handleAddBooking = (bookingData: Omit<Booking, 'id' | 'bookingDate' | 'salesAgentId' | 'salesAgentName'>) => {
      const newBooking: Booking = {
          ...bookingData,
          id: `bk-${Date.now()}`,
          bookingDate: new Date().toISOString(),
          salesAgentId: user?.id || 'unknown',
          salesAgentName: user?.fullName || 'Inconnu'
      };

      // Update Stock Logic
      const pkgIndex = packages.findIndex(p => p.id === bookingData.packageId);
      if (pkgIndex >= 0) {
          const pkg = packages[pkgIndex];
          const totalPax = (bookingData.adultCount || 0) + (bookingData.childCount || 0) + (bookingData.infantCount || 0);
          
          if ((pkg.general.stock || 0) < totalPax) {
              alert("Erreur: Stock insuffisant !");
              return false;
          }

          const updatedPkg = {
              ...pkg,
              general: { ...pkg.general, stock: (pkg.general.stock || 0) - totalPax }
          };
          
          setPackages(prev => {
              const newPkgs = [...prev];
              newPkgs[pkgIndex] = updatedPkg;
              return newPkgs;
          });
      }

      setBookings(prev => [newBooking, ...prev]);
      return true;
  };

  // --- Ops Handlers ---
  const handleUpdateOps = (updatedRecord: OpsProject) => {
      setOpsRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      
      // If we are currently viewing a group from this record, update the selected view too
      if (selectedOpsGroup && selectedOpsGroup.pkg.id === updatedRecord.packageId) {
          const updatedGroup = updatedRecord.groups.find(g => g.id === selectedOpsGroup.group.id);
          if (updatedGroup) {
              setSelectedOpsGroup({ pkg: selectedOpsGroup.pkg, group: updatedGroup });
          }
      }
  };

  // --- Access Control Helpers ---
  const role = user?.role;
  const canCreatePackage = role === 'administrator' || role === 'travel_designer';
  const canEditPackage = role === 'administrator' || role === 'travel_designer';
  const canDeletePackage = role === 'administrator';
  const canDuplicatePackage = role === 'administrator' || role === 'travel_designer';
  const canPublishPackage = role === 'administrator'; // Only admin publishes? Or designer too? Let's say Admin.
  const canSaveDraft = role === 'administrator' || role === 'travel_designer';
  const canViewUsers = role === 'administrator';
  const canViewSales = role === 'administrator' || role === 'sales_agent' || role === 'travel_designer';
  const canAddSales = role === 'administrator' || role === 'sales_agent';
  const canViewOps = role === 'administrator' || role === 'travel_designer'; // Ops for backend team
  const canGeneratePdf = true; // Everyone can generate PDF for now

  // --- Render ---
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col font-display">
      <Header 
        user={user} 
        currentView={currentView}
        onNavigateHome={() => setCurrentView('dashboard')}
        onNavigateUsers={canViewUsers ? () => setCurrentView('users') : undefined}
        onNavigateSales={canViewSales ? () => setCurrentView('sales') : undefined}
        onNavigateVoyages={() => setCurrentView('voyages')}
        onNavigateOps={canViewOps ? () => { setCurrentView('ops'); setSelectedOpsGroup(null); } : undefined}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {currentView === 'dashboard' && (
          <Dashboard 
            packages={packages}
            currentUser={user}
            onCreate={handleCreatePackage}
            onEdit={handleEditPackage}
            onDuplicate={handleDuplicatePackage}
            onDelete={handleDeletePackage}
            canCreatePackage={canCreatePackage}
            canEditPackage={canEditPackage}
            canDeletePackage={canDeletePackage}
            canDuplicatePackage={canDuplicatePackage}
            canGeneratePdf={canGeneratePdf}
          />
        )}

        {currentView === 'form' && (
          <PackageForm 
            initialData={editingPackage}
            onSave={handleSavePackage}
            onCancel={() => setCurrentView('dashboard')}
            isReadOnlyForm={!canEditPackage && !canCreatePackage} 
            canSaveDraft={canSaveDraft}
            canPublishPackage={canPublishPackage}
          />
        )}

        {currentView === 'users' && canViewUsers && (
            <UserManagement 
                users={users}
                currentUser={user}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
            />
        )}

        {currentView === 'sales' && canViewSales && (
            <SalesManagement 
                packages={packages}
                bookings={bookings}
                currentUser={user}
                onAddBooking={handleAddBooking}
                canAddSales={canAddSales}
            />
        )}

        {currentView === 'voyages' && (
            <VoyageList 
                packages={packages}
                bookings={bookings} // Passed down to display detailed table
                onBook={(pkg) => {
                    if (canAddSales) {
                        setCurrentView('sales');
                        alert("Veuillez créer une nouvelle réservation dans l'onglet Ventes pour " + pkg.general.productName);
                    } else {
                        alert("Contactez un agent commercial pour réserver : " + pkg.general.productName);
                    }
                }}
            />
        )}

        {currentView === 'ops' && canViewOps && (
            selectedOpsGroup ? (
                <OpsManager 
                    pkg={selectedOpsGroup.pkg}
                    opsGroup={selectedOpsGroup.group}
                    opsRecord={opsRecords.find(r => r.packageId === selectedOpsGroup.pkg.id)!}
                    bookings={bookings.filter(b => b.packageId === selectedOpsGroup.pkg.id)}
                    currentUser={user}
                    onUpdateOps={handleUpdateOps}
                    onBack={() => setSelectedOpsGroup(null)}
                />
            ) : (
                <OpsDashboard 
                    packages={packages}
                    opsRecords={opsRecords}
                    currentUser={user}
                    onSelectGroup={(pkg, group) => setSelectedOpsGroup({pkg, group})}
                />
            )
        )}

      </main>
    </div>
  );
}