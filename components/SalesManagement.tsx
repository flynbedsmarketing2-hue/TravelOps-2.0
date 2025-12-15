import React, { useState } from 'react';
import { Booking } from '../types';
import { SectionWrapper } from './SectionWrapper';
import { BookingModal } from './BookingModal';
import { usePackageStore } from '../store/usePackageStore';
import { useBookingStore } from '../store/useBookingStore';
import { useUserStore } from '../store/useUserStore';

interface SalesManagementProps {
  onAddBooking: (bookingData: Omit<Booking, 'id' | 'bookingDate' | 'salesAgentId' | 'salesAgentName'>) => boolean;
}

export const SalesManagement: React.FC<SalesManagementProps> = ({
  onAddBooking,
}) => {
  const { packages } = usePackageStore();
  const { bookings } = useBookingStore();
  const { currentUser } = useUserStore();
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const publishedPackages = packages.filter(pkg => pkg.status === 'published');
  const canAddSales = currentUser?.role === 'administrator' || currentUser?.role === 'sales_agent';

  const calculateTotalPax = (booking: Booking) => {
    return (booking.adultCount || 0) + (booking.childCount || 0) + (booking.infantCount || 0);
  };

  return (
    <div className="flex flex-1 justify-center py-8 px-4 sm:px-8 animate-fadeIn">
      <div className="flex flex-col max-w-[1200px] w-full gap-8">
        <div className="flex justify-between items-center border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gestion des Réservations</h1>
            <p className="text-slate-500 text-base">Enregistrez les réservations clients et suivez l'inventaire des packages.</p>
          </div>
          {canAddSales && (
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="flex items-center justify-center rounded-lg h-10 px-6 bg-green-600 text-white text-sm font-bold shadow-md shadow-green-600/20 hover:bg-green-700 transition-colors"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">add_task</span>
              Créer une Réservation
            </button>
          )}
        </div>

        <SectionWrapper title="Historique des Réservations" icon="history">
          {bookings.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-20">inventory_2</span>
              <p>Aucune réservation enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                    <th className="px-6 py-4">Agence & Package</th>
                    <th className="px-6 py-4">Pax</th>
                    <th className="px-6 py-4">Type Chambre</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Date Réservation</th>
                    <th className="px-6 py-4">Agent Commercial</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{booking.agencyName}</div>
                        <div className="text-xs text-slate-600">{booking.packageName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-bold">
                        {calculateTotalPax(booking)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {booking.roomType}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.bookingType === 'Confirmée'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                         }`}>
                           {booking.bookingType}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(booking.bookingDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {booking.salesAgentName}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all" title="Voir détails">
                           <span className="material-symbols-outlined text-[20px]">visibility</span>
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionWrapper>
      </div>

      {currentUser && (
        <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onSaveBooking={onAddBooking}
            availablePackages={publishedPackages}
            currentUser={currentUser}
        />
      )}
    </div>
  );
};