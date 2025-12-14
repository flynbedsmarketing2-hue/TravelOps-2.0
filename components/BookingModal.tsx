import React, { useState, useEffect, useCallback } from 'react';
import { PackageState, User, Booking, PassportScan, DocumentUpload, RoomType, BookingType, DocumentCategory, RoomConfiguration, RoomOccupant, PaxType } from '../types';
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
    } else {
      setSelectedPackageStock(undefined);
      setPackageName('');
    }
  }, [packageId, availablePackages]);

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
              // Remove slots if excessive AND empty (to preserve data if user accidentally switches)
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
              // Don't remove if it's the last one? Maybe allow but show empty state
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
      try {
          const base64Image = await fileToBase64(file);
          const extractedInfo = await extractPassportInfoFromImage(base64Image);
          
          const newPassport: PassportScan = {
              id: `scan-${Date.now()}`,
              base64Image,
              extractedInfo,
              status: 'extracted'
          };

          // Update global passports state
          setPassportScans(prev => [...prev, newPassport]);

          // Link to occupant and auto-fill name
          updateOccupant(roomId, occupantId, 'passportScanId', newPassport.id);
          if (extractedInfo.fullName) {
              updateOccupant(roomId, occupantId, 'fullName', extractedInfo.fullName);
              
              // If this is the very first passenger and clientName is empty, fill clientName too
              if (!clientName) {
                  setClientName(extractedInfo.fullName);
              }
          }

      } catch (err: any) {
          setError("Erreur extraction passeport: " + err.message);
      } finally {
          setIsExtractionLoading(false);
          e.target.value = ''; // Reset input
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
          roomType: rooms.length > 0 ? rooms[0].roomType : 'DOUBLE', // Simplified logic for main type
          rooms, // Detail
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
          requiredDocuments
      });

      if (success) onClose();
  };

  if (!isOpen) return null;
  const stats = calculateStats();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        
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
                                placeholder="ex: Tassili Travel"
                                value={agencyName}
                                onChange={e => setAgencyName(e.target.value)}
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-500 uppercase">Client Principal (Lead)</span>
                            <input 
                                className="form-input w-full rounded-lg border-slate-300 py-2 text-sm"
                                placeholder="Nom du responsable"
                                value={clientName}
                                onChange={e => setClientName(e.target.value)}
                                required
                            />
                        </label>
                         <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-slate-500 uppercase">Téléphone</span>
                            <input 
                                type="tel"
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
                                    <option value="En option">Option</option>
                                    <option value="Confirmée">Confirmée</option>
                                </select>
                            </label>
                            {bookingType === 'En option' && (
                                <label className="flex flex-col gap-1.5 flex-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Valide jusqu'au</span>
                                    <input 
                                        type="datetime-local"
                                        className="form-input w-full rounded-lg border-slate-300 py-2 text-sm"
                                        value={reservedUntil}
                                        onChange={e => setReservedUntil(e.target.value)}
                                        required
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Rooming List */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="material-symbols-outlined text-primary">bed</span> Rooming List
                        </h3>
                        <button 
                            type="button"
                            onClick={addRoom}
                            className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">add</span> Ajouter Chambre
                        </button>
                    </div>

                    {rooms.map((room, rIndex) => (
                        <div key={room.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fadeIn">
                             <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-xs">Chambre {rIndex + 1}</span>
                                    <select
                                        className="form-select border-none bg-transparent font-bold text-slate-800 text-sm focus:ring-0 cursor-pointer hover:bg-slate-50 rounded"
                                        value={room.roomType}
                                        onChange={e => updateRoomType(room.id, e.target.value as RoomType)}
                                    >
                                        <option value="SINGLE">SINGLE (1 Pax)</option>
                                        <option value="DOUBLE">DOUBLE (2 Pax)</option>
                                        <option value="TWIN">TWIN (2 Pax)</option>
                                        <option value="TRIPLE">TRIPLE (3 Pax)</option>
                                        <option value="QUADRUPLE">QUADRUPLE (4 Pax)</option>
                                        <option value="DEMI DOUBLE HOMME">DEMI DOUBLE HOMME (1 Pax)</option>
                                        <option value="DEMI DOUBLE FEMME">DEMI DOUBLE FEMME (1 Pax)</option>
                                    </select>
                                </div>
                                {rooms.length > 1 && (
                                    <button type="button" onClick={() => removeRoom(room.id)} className="text-slate-400 hover:text-red-500">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                )}
                             </div>

                             <div className="space-y-3">
                                 {room.occupants.map((occupant, oIndex) => {
                                     const hasPassport = !!occupant.passportScanId;
                                     return (
                                        <div key={occupant.id} className="flex flex-wrap md:flex-nowrap gap-3 items-center">
                                            <div className="flex items-center justify-center bg-slate-100 text-slate-400 rounded-full w-6 h-6 text-[10px] font-bold shrink-0">
                                                {oIndex + 1}
                                            </div>
                                            <div className="flex-1 min-w-[200px]">
                                                <input 
                                                    className="form-input w-full rounded border-slate-300 py-1.5 px-3 text-sm focus:outline-none placeholder:text-slate-300"
                                                    placeholder="Nom Complet (ex: HEDIDANE NADIA)"
                                                    value={occupant.fullName}
                                                    onChange={e => updateOccupant(room.id, occupant.id, 'fullName', e.target.value)}
                                                />
                                            </div>
                                            <div className="w-28">
                                                <select
                                                    className="form-select w-full rounded border-slate-300 py-1.5 text-sm"
                                                    value={occupant.type}
                                                    onChange={e => updateOccupant(room.id, occupant.id, 'type', e.target.value)}
                                                >
                                                    <option value="ADL">Adulte</option>
                                                    <option value="CHD">Enfant</option>
                                                    <option value="INF">Bébé</option>
                                                </select>
                                            </div>
                                            
                                            {/* Passport Action */}
                                            <label className={`cursor-pointer flex items-center justify-center gap-1 px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                                                hasPassport 
                                                ? 'bg-green-50 border-green-200 text-green-700' 
                                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                            }`}>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    onChange={(e) => handlePassportUploadForOccupant(e, room.id, occupant.id)}
                                                    disabled={isExtractionLoading}
                                                />
                                                {isExtractionLoading && !hasPassport ? (
                                                    <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[16px]">{hasPassport ? 'check_circle' : 'upload_file'}</span>
                                                )}
                                                {hasPassport ? 'Scan OK' : 'Scan'}
                                            </label>

                                            <button 
                                                type="button" 
                                                onClick={() => removeOccupant(room.id, occupant.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                                title="Retirer occupant"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                                            </button>
                                        </div>
                                     );
                                 })}
                                 
                                 <button 
                                    type="button"
                                    onClick={() => addOccupant(room.id)}
                                    className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                 >
                                     <span className="material-symbols-outlined text-[14px]">person_add</span>
                                     Ajouter Occupant
                                 </button>
                             </div>
                        </div>
                    ))}
                </div>

                {/* 3. Footer / Additional */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-2">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-500 uppercase">Notes Internes / Divers</span>
                        <textarea 
                            className="form-input w-full rounded-lg border-slate-300 py-2 text-sm min-h-[60px]"
                            placeholder="Informations supplémentaires..."
                            value={otherInfo}
                            onChange={e => setOtherInfo(e.target.value)}
                        />
                    </label>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-200 flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}
            </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="text-xs font-mono text-slate-500">
                <span className="font-bold text-slate-800">{stats.totalPax} Pax</span> ({stats.adultCount} Adl, {stats.childCount} Chd, {stats.infantCount} Inf) • {rooms.length} Chambre(s)
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-6 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors">
                    Annuler
                </button>
                <button 
                    type="submit" 
                    form="bookingForm"
                    className="px-6 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 shadow-lg shadow-green-600/20 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Confirmer
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};