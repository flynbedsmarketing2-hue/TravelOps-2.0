import React, { useState, useEffect, useCallback } from 'react';
import { PackageState, User, Booking, PassportScan, DocumentUpload, RoomType, BookingType, RoomConfiguration, RoomOccupant, PaxType, PaymentMethod } from '../types';
import { extractPassportInfoFromImage } from '../utils/ai';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBooking: (bookingData: Omit<Booking, 'id' | 'bookingDate' | 'salesAgentId' | 'salesAgentName'>) => boolean;
  availablePackages: PackageState[]; // Only published packages
  currentUser: User;
  initialPackageId?: string; 
}

// Utility to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSaveBooking,
  availablePackages,
  currentUser,
  initialPackageId
}) => {
  const [packageId, setPackageId] = useState('');
  const [packageName, setPackageName] = useState('');
  const [clientName, setClientName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [invoiceBlackbird, setInvoiceBlackbird] = useState('');
  const [invoicePlatform, setInvoicePlatform] = useState('');
  const [bookingType, setBookingType] = useState<BookingType>('En option');
  const [reservedUntil, setReservedUntil] = useState('');
  
  // Detailed Rooming State
  const [rooms, setRooms] = useState<RoomConfiguration[]>([
      { id: 'room-1', roomType: 'DOUBLE', occupants: [{ id: 'occ-1', fullName: '', type: 'ADL' }, { id: 'occ-2', fullName: '', type: 'ADL' }] }
  ]);
  
  const [passportScans, setPassportScans] = useState<PassportScan[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<DocumentUpload[]>([]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ESPECES');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isFullyPaid, setIsFullyPaid] = useState<boolean>(false);
  const [paymentProof, setPaymentProof] = useState<string>('');

  const [selectedPackageStock, setSelectedPackageStock] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [isExtractionLoading, setIsExtractionLoading] = useState(false);

  // --- Effects ---

  useEffect(() => {
    if (isOpen && initialPackageId) {
        setPackageId(initialPackageId);
    }
  }, [isOpen, initialPackageId]);

  useEffect(() => {
    if (packageId) {
      const pkg = availablePackages.find(p => p.id === packageId);
      setSelectedPackageStock(pkg?.general.stock);
      setPackageName(pkg?.general.productName || '');
      
      // Calculate Option Date Logic
      if (bookingType === 'En option' && pkg) {
          const departureDate = pkg.flights[0]?.departureDate ? new Date(pkg.flights[0].departureDate) : null;
          if (departureDate) {
              const now = new Date();
              const diffTime = departureDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              let hoursToAdd = 72; // Default 3 days
              
              if (diffDays <= 3) hoursToAdd = 2; // Critical close departure
              else if (diffDays <= 7) hoursToAdd = 24;
              else if (diffDays <= 14) hoursToAdd = 48;
              
              // Low stock override
              if ((pkg.general.stock || 0) < 5) {
                  hoursToAdd = Math.min(hoursToAdd, 24);
              }

              const optionDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
              
              // Ensure option doesn't exceed departure
              if (optionDate > departureDate) {
                 setReservedUntil(departureDate.toISOString().slice(0, 16));
              } else {
                 setReservedUntil(optionDate.toISOString().slice(0, 16));
              }
          }
      }
    } else {
      setSelectedPackageStock(undefined);
      setPackageName('');
    }
  }, [packageId, availablePackages, bookingType]);

  useEffect(() => {
      if (isFullyPaid) {
          setPaidAmount(totalPrice);
      }
  }, [isFullyPaid, totalPrice]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      setPackageId('');
      setPackageName('');
      setClientName('');
      setAgencyName('');
      setPhoneNumber('');
      setOtherInfo('');
      setInvoiceBlackbird('');
      setInvoicePlatform('');
      setBookingType('En option');
      setReservedUntil('');
      setRooms([{ id: `room-${Date.now()}`, roomType: 'DOUBLE', occupants: [{ id: `occ-${Date.now()}-1`, fullName: '', type: 'ADL' }, { id: `occ-${Date.now()}-2`, fullName: '', type: 'ADL' }] }]);
      setPassportScans([]);
      setRequiredDocuments([]);
      setError('');
      // Payment Reset
      setPaymentMethod('ESPECES');
      setTotalPrice(0);
      setPaidAmount(0);
      setIsFullyPaid(false);
      setPaymentProof('');
    }
  }, [isOpen]);

  // --- Helpers ---

  const calculateStats = useCallback(() => {
    let adultCount = 0;
    let childCount = 0;
    let infantCount = 0;
    
    rooms.forEach(room => {
        room.occupants.forEach(occ => {
            if (occ.type === 'ADL') adultCount++;
            if (occ.type === 'CHD') childCount++;
            if (occ.type === 'INF') infantCount++;
        });
    });
    
    return { adultCount, childCount, infantCount, totalPax: adultCount + childCount + infantCount };
  }, [rooms]);

  const getStandardOccupancy = (type: RoomType): number => {
    switch (type) {
        case 'SINGLE': return 1;
        case 'DEMI DOUBLE HOMME': return 1;
        case 'DEMI DOUBLE FEMME': return 1;
        case 'DOUBLE': return 2;
        case 'TWIN': return 2;
        case 'TRIPLE': return 3;
        case 'QUADRUPLE': return 4;
        default: return 1;
    }
  };

  const getPassportPreview = (scanId: string | undefined) => {
      if (!scanId) return null;
      const scan = passportScans.find(s => s.id === scanId);
      return scan ? `data:image/jpeg;base64,${scan.base64Image}` : null;
  }

  // --- Handlers ---

  const addRoom = () => {
      // Default new room to DOUBLE with 2 slots
      const newRoomId = `room-${Date.now()}`;
      setRooms([...rooms, { 
          id: newRoomId, 
          roomType: 'DOUBLE', 
          occupants: [
              { id: `occ-${Date.now()}-1`, fullName: '', type: 'ADL' },
              { id: `occ-${Date.now()}-2`, fullName: '', type: 'ADL' }
          ] 
      }]);
  };

  const removeRoom = (roomId: string) => {
      if (rooms.length > 1) {
          setRooms(rooms.filter(r => r.id !== roomId));
      }
  };

  const updateRoomType = (roomId: string, type: RoomType) => {
      setRooms(rooms.map(r => {
          if (r.id === roomId) {
              const targetCount = getStandardOccupancy(type);
              let newOccupants = [...r.occupants];
              
              // Add slots if needed
              if (newOccupants.length < targetCount) {
                  const needed = targetCount - newOccupants.length;
                  for(let i=0; i<needed; i++) {
                      newOccupants.push({ id: `occ-${Date.now()}-${Math.random()}`, fullName: '', type: 'ADL' });
                  }
              }
              // Remove slots if excessive AND empty
              else if (newOccupants.length > targetCount) {
                  const extras = newOccupants.slice(targetCount);
                  const isSafeToRemove = extras.every(o => !o.fullName.trim() && !o.passportScanId);
                  if (isSafeToRemove) {
                      newOccupants = newOccupants.slice(0, targetCount);
                  }
              }
              
              return { ...r, roomType: type, occupants: newOccupants };
          }
          return r;
      }));
  };

  const addOccupant = (roomId: string) => {
      setRooms(rooms.map(r => {
          if (r.id === roomId) {
              return {
                  ...r,
                  occupants: [...r.occupants, { id: `occ-${Date.now()}-${Math.random()}`, fullName: '', type: 'ADL' }]
              };
          }
          return r;
      }));
  };

  const removeOccupant = (roomId: string, occupantId: string) => {
      setRooms(rooms.map(r => {
          if (r.id === roomId) {
              return {
                  ...r,
                  occupants: r.occupants.filter(o => o.id !== occupantId)
              };
          }
          return r;
      }));
  };

  const updateOccupant = (roomId: string, occupantId: string, field: keyof RoomOccupant, value: any) => {
      setRooms(rooms.map(r => {
          if (r.id === roomId) {
              return {
                  ...r,
                  occupants: r.occupants.map(o => o.id === occupantId ? { ...o, [field]: value } : o)
              };
          }
          return r;
      }));
  };

  const handlePassportUploadForOccupant = async (e: React.ChangeEvent<HTMLInputElement>, roomId: string, occupantId: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsExtractionLoading(true);
      setError(''); // Clear previous errors
      try {
          const base64Image = await fileToBase64(file);
          const extractedInfo = await extractPassportInfoFromImage(base64Image);
          
          const newPassport: PassportScan = {
              id: `scan-${Date.now()}`,
              base64Image,
              extractedInfo,
              status: 'extracted'
          };

          setPassportScans(prev => [...prev, newPassport]);

          setRooms(prevRooms => prevRooms.map(r => {
              if (r.id === roomId) {
                  return {
                      ...r,
                      occupants: r.occupants.map(o => {
                          if (o.id === occupantId) {
                              return {
                                  ...o,
                                  passportScanId: newPassport.id,
                                  fullName: extractedInfo.fullName || o.fullName,
                                  passportNumber: extractedInfo.passportNumber || '',
                                  nationality: extractedInfo.nationality || '',
                                  birthDate: extractedInfo.dateOfBirth || '',
                                  expiryDate: extractedInfo.expiryDate || ''
                              };
                          }
                          return o;
                      })
                  };
              }
              return r;
          }));

          // If lead name is empty, fill it
          if (extractedInfo.fullName && !clientName) {
              setClientName(extractedInfo.fullName);
          }

      } catch (err: any) {
          console.error("Passport upload error:", err);
          setError("Erreur extraction passeport: " + err.message);
      } finally {
          setIsExtractionLoading(false);
          e.target.value = ''; // Reset input
      }
  };

  const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const base64 = await fileToBase64(file);
          setPaymentProof(base64);
      } catch (err) {
          console.error(err);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      const stats = calculateStats();

      if (!packageId) { setError('Veuillez sélectionner un package.'); return; }
      if (!clientName.trim()) { setError('Nom du client requis.'); return; }
      if (!agencyName.trim()) { setError("Nom de l'agence requis."); return; }
      if (stats.totalPax === 0) { setError('Aucun passager ajouté.'); return; }
      if (selectedPackageStock !== undefined && stats.totalPax > selectedPackageStock) {
          setError(`Stock insuffisant. (Dispo: ${selectedPackageStock})`); return;
      }
      if (bookingType === 'En option' && !reservedUntil) { setError('Date limite option requise.'); return; }

      // Validate Occupants Names
      let missingNames = false;
      rooms.forEach(r => r.occupants.forEach(o => { if (!o.fullName.trim()) missingNames = true; }));
      if (missingNames) { setError("Le nom de tous les occupants doit être renseigné."); return; }

      const success = onSaveBooking({
          packageId,
          packageName,
          clientName,
          agencyName,
          numberOfRooms: rooms.length,
          roomType: rooms.length > 0 ? rooms[0].roomType : 'DOUBLE',
          rooms, 
          invoiceBlackbird,
          invoicePlatform,
          adultCount: stats.adultCount,
          childCount: stats.childCount,
          infantCount: stats.infantCount,
          phoneNumber,
          otherInfo,
          bookingType,
          reservedUntil,
          passportScans,
          requiredDocuments,
          // Payment Info
          paymentMethod,
          totalPrice,
          paidAmount,
          isFullyPaid,
          paymentProofUrl: paymentProof
      });

      if (success) onClose();
  };

  if (!isOpen) return null;
  const stats = calculateStats();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-900 text-white">
          <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined">add_task</span>
                  Nouvelle Réservation
              </h2>
              {packageName && <p className="text-xs text-slate-400 mt-1">{packageName}</p>}
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
            <form id="bookingForm" onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                
                {/* 1. Global Info */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span className="material-symbols-outlined text-primary">info</span> Informations Générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-slate-500 uppercase">Package</span>
                                <select
                                    className="form-select w-full rounded-lg border-slate-300 py-2 text-sm font-medium"
                                    value={packageId}
                                    onChange={e => setPackageId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Sélectionner un package --</option>
                                    {availablePackages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>
                                        {pkg.general.productName} (Stock: {pkg.general.stock})
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-500 uppercase">Nom de l'Agence</span>
                            <input 
                                className="form-input w-full rounded-lg border-slate-300 py-2 text-sm"
                                placeholder="Nom de l'agence..."
                                value={agencyName}
                                onChange={e => setAgencyName(e.target.value)}
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-500 uppercase">Client Principal (Lead)</span>
                            <input 
                                className="form-input w-full rounded-lg border-slate-300 py-2 text-sm"
                                placeholder="Nom du client..."
                                value={clientName}
                                onChange={e => setClientName(e.target.value)}
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-500 uppercase">Téléphone</span>
                            <input 
                                className="form-input w-full rounded-lg border-slate-300 py-2 text-sm"
                                placeholder="+213..."
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                            />
                        </label>
                        <div className="flex gap-4">
                            <label className="flex flex-col gap-1.5 flex-1">
                                <span className="text-xs font-bold text-slate-500 uppercase">Type Résa</span>
                                <select 
                                    className="form-select w-full rounded-lg border-slate-300 py-2 text-sm"
                                    value={bookingType}
                                    onChange={e => setBookingType(e.target.value as BookingType)}
                                >
                                    <option value="En option">En option</option>
                                    <option value="Confirmée">Confirmée</option>
                                </select>
                            </label>
                            {bookingType === 'En option' && (
                                <label className="flex flex-col gap-1.5 flex-1 animate-fadeIn">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Option jusqu'au</span>
                                    <input 
                                        type="datetime-local" 
                                        className="form-input w-full rounded-lg border-slate-300 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                                        value={reservedUntil}
                                        readOnly
                                    />
                                    <span className="text-[10px] text-primary italic">Calculé automatiquement selon stock & départ</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Rooming List */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="material-symbols-outlined text-primary">bed</span> Rooming List
                        </h3>
                        <button 
                            type="button"
                            onClick={addRoom}
                            className="text-primary text-xs font-bold hover:bg-primary/5 px-2 py-1 rounded transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[16px]">add</span> Ajouter Chambre
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {rooms.map((room, index) => (
                            <div key={room.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border-2 border-blue-400 dark:border-blue-700 relative group animate-fadeIn shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold px-2 py-1 rounded">Chambre {index + 1}</span>
                                        <select 
                                            className="form-select bg-transparent border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-0 p-0 cursor-pointer uppercase"
                                            value={room.roomType}
                                            onChange={(e) => updateRoomType(room.id, e.target.value as RoomType)}
                                        >
                                            <option value="SINGLE">SINGLE (1 Pax)</option>
                                            <option value="DOUBLE">DOUBLE (2 Pax)</option>
                                            <option value="TWIN">TWIN (2 Pax)</option>
                                            <option value="TRIPLE">TRIPLE (3 Pax)</option>
                                            <option value="QUADRUPLE">QUADRUPLE (4 Pax)</option>
                                            <option value="DEMI DOUBLE HOMME">DEMI DOUBLE HOMME (Partage)</option>
                                            <option value="DEMI DOUBLE FEMME">DEMI DOUBLE FEMME (Partage)</option>
                                        </select>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeRoom(room.id)}
                                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Supprimer la chambre"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {room.occupants.map((occupant, idx) => {
                                        const previewUrl = getPassportPreview(occupant.passportScanId);
                                        return (
                                            <div key={occupant.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex flex-wrap md:flex-nowrap gap-3 items-center mb-3">
                                                    <div className="flex items-center justify-center size-6 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-bold shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-[200px]">
                                                        <input 
                                                            className="form-input w-full rounded-md border-slate-300 py-1.5 text-sm"
                                                            placeholder="Nom Prénom du passager"
                                                            value={occupant.fullName}
                                                            onChange={e => updateOccupant(room.id, occupant.id, 'fullName', e.target.value)}
                                                        />
                                                    </div>
                                                    
                                                    <div className="w-28 shrink-0">
                                                        <select 
                                                            className="form-select w-full rounded-md border-slate-300 py-1.5 text-sm"
                                                            value={occupant.type}
                                                            onChange={e => updateOccupant(room.id, occupant.id, 'type', e.target.value)}
                                                        >
                                                            <option value="ADL">Adulte</option>
                                                            <option value="CHD">Enfant</option>
                                                            <option value="INF">Bébé</option>
                                                        </select>
                                                    </div>

                                                    <label className="flex items-center gap-1 cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-md transition-colors shadow-sm shrink-0" title="Scanner Passeport">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            onChange={(e) => handlePassportUploadForOccupant(e, room.id, occupant.id)}
                                                        />
                                                        <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                                                        <span className="text-xs font-bold">Scan</span>
                                                    </label>

                                                    {previewUrl && (
                                                        <div className="relative size-9 rounded overflow-hidden border border-slate-300 group/preview cursor-pointer">
                                                            <img src={previewUrl} alt="Passport" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 hidden group-hover/preview:flex items-center justify-center text-white">
                                                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {room.occupants.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeOccupant(room.id, occupant.id)}
                                                            className="text-slate-300 hover:text-red-500 shrink-0"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Detailed Passport Fields */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                                    <label className="flex flex-col gap-1">
                                                        <span className="font-bold text-slate-500">N° Passeport</span>
                                                        <input 
                                                            className="form-input rounded border-slate-200 py-1 px-2 text-xs"
                                                            placeholder="ex: 123456789"
                                                            value={occupant.passportNumber || ''}
                                                            onChange={e => updateOccupant(room.id, occupant.id, 'passportNumber', e.target.value)}
                                                        />
                                                    </label>
                                                    <label className="flex flex-col gap-1">
                                                        <span className="font-bold text-slate-500">Nationalité</span>
                                                        <input 
                                                            className="form-input rounded border-slate-200 py-1 px-2 text-xs uppercase"
                                                            placeholder="ex: ALG"
                                                            value={occupant.nationality || ''}
                                                            onChange={e => updateOccupant(room.id, occupant.id, 'nationality', e.target.value)}
                                                        />
                                                    </label>
                                                    <label className="flex flex-col gap-1">
                                                        <span className="font-bold text-slate-500">Date Naissance</span>
                                                        <input 
                                                            type="date"
                                                            className="form-input rounded border-slate-200 py-1 px-2 text-xs"
                                                            value={occupant.birthDate || ''}
                                                            onChange={e => updateOccupant(room.id, occupant.id, 'birthDate', e.target.value)}
                                                        />
                                                    </label>
                                                    <label className="flex flex-col gap-1">
                                                        <span className="font-bold text-slate-500">Date Expiration</span>
                                                        <input 
                                                            type="date"
                                                            className="form-input rounded border-slate-200 py-1 px-2 text-xs"
                                                            value={occupant.expiryDate || ''}
                                                            onChange={e => updateOccupant(room.id, occupant.id, 'expiryDate', e.target.value)}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <button 
                                        type="button" 
                                        onClick={() => addOccupant(room.id)}
                                        className="text-primary text-xs font-bold flex items-center hover:underline ml-1"
                                    >
                                        <span className="material-symbols-outlined text-[14px] mr-1">person_add</span>
                                        Ajouter Occupant
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* 3. Payment Method Section */}
                 <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <span className="material-symbols-outlined text-primary">payments</span> Paiement
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Method & Proof */}
                        <div className="flex flex-col gap-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-slate-500 uppercase">Mode de Paiement</span>
                                <select 
                                    className="form-select w-full rounded-lg border-slate-300 py-2 text-sm"
                                    value={paymentMethod}
                                    onChange={(e) => {
                                        setPaymentMethod(e.target.value as PaymentMethod);
                                        setPaymentProof(''); // Reset proof on change
                                    }}
                                >
                                    <option value="ESPECES">Espèces (Deposit)</option>
                                    <option value="VIREMENT">Virement / Versement</option>
                                    <option value="CHEQUE">Chèque</option>
                                </select>
                            </label>

                            {/* Conditional Upload */}
                            {paymentMethod !== 'ESPECES' && (
                                <div className="animate-fadeIn">
                                    <span className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Preuve de Paiement</span>
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                            {paymentProof ? (
                                                <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                    Fichier Reçu
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-slate-400 mb-1">cloud_upload</span>
                                                    <p className="text-xs text-slate-500">Cliquez pour uploader</p>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handlePaymentProofUpload} />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Right: Amounts */}
                        <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                             <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-slate-500 uppercase">Total à Payer (DZD)</span>
                                <input 
                                    type="number"
                                    className="form-input w-full rounded-lg border-slate-300 py-2 text-sm font-bold text-slate-800"
                                    placeholder="0.00"
                                    value={totalPrice || ''}
                                    onChange={e => setTotalPrice(parseFloat(e.target.value))}
                                />
                            </label>
                            
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-slate-500 uppercase">Montant Versé (DZD)</span>
                                <input 
                                    type="number"
                                    className="form-input w-full rounded-lg border-slate-300 py-2 text-sm"
                                    placeholder="0.00"
                                    value={paidAmount || ''}
                                    onChange={e => {
                                        setPaidAmount(parseFloat(e.target.value));
                                        if (parseFloat(e.target.value) !== totalPrice) setIsFullyPaid(false);
                                    }}
                                    disabled={isFullyPaid}
                                />
                            </label>

                             <label className="flex items-center gap-2 mt-1 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                                    checked={isFullyPaid}
                                    onChange={(e) => setIsFullyPaid(e.target.checked)}
                                />
                                <span className="text-sm font-bold text-slate-700">Totalité payée</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 4. Notes & Footer */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-500 uppercase">Notes Internes / Divers</span>
                        <textarea 
                            className="form-input w-full rounded-lg border-slate-300 p-3 text-sm h-24 resize-none"
                            placeholder="Informations supplémentaires (ex: régime alimentaire, demandes spéciales)..."
                            value={otherInfo}
                            onChange={e => setOtherInfo(e.target.value)}
                        />
                    </label>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-pulse">
                        <span className="material-symbols-outlined text-red-600">error</span>
                        <p className="text-sm font-bold text-red-700">{error}</p>
                    </div>
                )}

            </form>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 flex justify-between items-center shrink-0">
            <div className="text-xs font-mono text-slate-500">
                <span className="font-bold text-slate-900 dark:text-white">{stats.totalPax} Pax</span> ({stats.adultCount} Adl, {stats.childCount} Chd, {stats.infantCount} Inf) • {rooms.length} Chambre(s)
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
                >
                    Annuler
                </button>
                <button 
                    type="submit"
                    form="bookingForm"
                    disabled={isExtractionLoading}
                    className="px-6 py-2 rounded-lg bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold text-sm shadow-md shadow-green-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isExtractionLoading && <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>}
                    Confirmer
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};