import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PackageState, OpsProject, OpsDepartureGroup } from '../types';

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

export const usePackageStore = create<PackageStore>()(
  persist(
    (set, get) => ({
      packages: [],
      opsRecords: [],

      fetchPackages: async () => {
        // With persist, initial fetch is handled by rehydration from local storage
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
        // If flights changed significantly, we might need logic here to sync Ops, 
        // but for now we keep existing ops to prevent data loss.
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
    }),
    {
      name: 'travelops-packages', // unique name for local storage
    }
  )
);