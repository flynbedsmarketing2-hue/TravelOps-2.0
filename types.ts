
export interface GeneralInfo {
  productName: string;
  productCode: string;
  responsible: string;
  creationDate: string;
  imageUrl?: string;
  stock?: number;
}

export interface Flight {
  id: string;
  airline: string;
  departureDate: string;
  returnDate: string;
  duration: string;
  details: string;
}

export interface Accommodation {
  id: string;
  name: string;
  category: string;
  pension?: string;
  mapLink: string;
}

export interface PricingRow {
  id: string;
  label: string;
  subLabel?: string;
  unitPrice: string;
  commission: string;
  isHeader?: boolean;
}

export interface CommissionValues {
  t1: string;
  t2: string;
  t3: string;
}

export interface AgencyCommission {
  adulte: CommissionValues;
  enfant: string;
  bebe: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  description: string;
}

export interface PackageState {
  id?: string;
  status?: 'draft' | 'published';
  lastModified?: string;
  general: GeneralInfo;
  destination: string;
  cities: string[];
  flights: Flight[];
  visaStatus: 'inclus' | 'non-inclus' | 'client';
  transferStatus: 'inclus' | 'non-inclus';
  accommodations: Accommodation[];
  pricing: PricingRow[];
  agencyCommission?: AgencyCommission;
  content: {
    included: string;
    excluded: string;
  };
  excursions: {
    included: string;
    extra: string;
  };
  itinerary: {
    active: boolean;
    days: ItineraryDay[];
    partnerName: string;
    emergencyContact: string;
    internalNotes: string;
    clientInformation: string;
  };
}

export type UserRole = 'administrator' | 'travel_designer' | 'sales_agent' | 'viewer';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

// --- Booking Module ---

export type RoomType = 'TRIPLE' | 'DOUBLE' | 'SINGLE' | 'QUADRUPLE' | 'BILLET SEULEMENT' | 'TRANSPORT SEULEMENT' | 'DEMI DOUBLE FEMME' | 'DEMI DOUBLE HOMME' | 'TWIN';
export type BookingType = 'En option' | 'Confirmée';
export type DocumentCategory = 'photo_identite' | 'copie_visa' | 'attestation_travail' | 'autre';
export type PaxType = 'ADL' | 'CHD' | 'INF';

export interface PassportScan {
  id: string;
  base64Image: string;
  extractedInfo?: {
    fullName: string;
    passportNumber: string;
    dateOfBirth: string;
    nationality: string;
    expiryDate: string;
  };
  status: 'pending' | 'extracted' | 'error';
  extractionError?: string;
}

export interface DocumentUpload {
  id: string;
  fileName: string;
  base64File: string;
  documentType: DocumentCategory;
}

export interface RoomOccupant {
  id: string;
  fullName: string;
  type: PaxType;
  passportScanId?: string; // Link to a scan in passportScans array
}

export interface RoomConfiguration {
  id: string;
  roomType: RoomType;
  occupants: RoomOccupant[];
}

export interface Booking {
  id: string;
  packageId: string;
  packageName: string;
  clientName: string; // Lead passenger
  agencyName: string;
  numberOfRooms: number;
  roomType: RoomType; // Primary or summary room type
  rooms: RoomConfiguration[]; // NEW: Detailed rooming list
  invoiceBlackbird: string;
  invoicePlatform: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  phoneNumber: string;
  otherInfo: string;
  bookingType: BookingType;
  reservedUntil?: string;
  passportScans: PassportScan[];
  requiredDocuments: DocumentUpload[];
  bookingDate: string;
  salesAgentId: string;
  salesAgentName: string;
}

// --- OPS MODULE UPDATED ---

export type OpsStatus = 'pending_validation' | 'validated';
export type Currency = 'DZD' | 'EUR' | 'USD' | 'SAR';

export interface OpsPaymentStep {
    deadline: string; // YYYY-MM-DD
    totalAmount: number; // Total cost to pay
    percentage?: number; // e.g. 30%
    amountToPay: number; // Calculated or manual
    status: 'pending' | 'paid';
    receiptUrl?: string; // Mock file upload
}

export interface OpsDepartureGroup {
    id: string; // Linked to flight.id
    flightId: string;
    departureDate: string; // YYYY-MM-DD
    status: OpsStatus;
    validationDate?: string; // NEW: Date when the departure group was validated

    // Air Management
    isSubcontracted: boolean; // If true, simpler view. If false, manage supplier
    airSupplierName?: string;
    airCostTotal?: number;
    airDeposit: OpsPaymentStep;
    airBalance: OpsPaymentStep; // Solde
    namesDeadline: string; // Date Option Noms & Emission

    // Land Management
    isLandSubcontracted: boolean; // Added for land subcontracting
    landSupplierName?: string;
    landCurrency: Currency;
    landCostTotal?: number;
    landDeposit: OpsPaymentStep;
    landBalance: OpsPaymentStep;
    roomingListDeadline: string;

    // Team
    guideName?: string;
    guidePhone?: string;
    guideAssignmentDeadline: string; // NEW: Deadline for guide assignment
}

export interface OpsProject {
  id: string;
  packageId: string;
  // Replaced generic tasks with structured Departure Groups
  groups: OpsDepartureGroup[];
  notes: string;
}