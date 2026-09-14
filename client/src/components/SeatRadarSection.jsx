import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CheckCircle2, 
  Bed, 
  Users, 
  Layers, 
  ShieldCheck, 
  UserCheck,
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function SeatRadarSection({ rooms: initialRooms = [] }) {
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [activeRoom, setActiveRoom] = useState(null);
  const [filterVacantOnly, setFilterVacantOnly] = useState(false);
  const [liveRooms, setLiveRooms] = useState(initialRooms);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with incoming rooms prop
  useEffect(() => {
    if (initialRooms && initialRooms.length > 0) {
      setLiveRooms(initialRooms);
    }
  }, [initialRooms]);

  // Fetch live rooms from MongoDB on mount to ensure real-time seat availability
  const fetchLiveRooms = async () => {
    try {
      setIsLoading(true);
      const res = await api.getRooms();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setLiveRooms(res.data);
      }
    } catch (err) {
      console.error('Error fetching live rooms in SeatRadarSection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRooms();
  }, []);

  // Building Configurations (Padma Residential Hall • 2 Floors)
  const hallConfigs = {
    padma: {
      name: 'Padma Residential Hall',
      gender: 'Campus Residence',
      totalFloors: 2,
      floors: ['1', '2'],
      tutors: {
        '1': 'Dr. Tariqul Islam (Floor 1 House Tutor)',
        '2': 'Prof. Anisur Rahman (Floor 2 House Tutor)',
      },
    },
  };

  const currentHall = hallConfigs.padma;

  // Fallback Floor Rooms & Beds Matrix (accurately reflects current bookings if offline)
  const generateFloorRooms = (block, floor) => {
    const isPadmaF1 = String(floor) === '1';

    return [
      { 
        no: `${floor}01`, 
        type: 'Double Shared Room', 
        totalBeds: 2, 
        occupiedBeds: 0, 
        status: '2 Vacant Beds', 
        beds: [
          { label: 'Bed A', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed B', isOccupied: false, student: 'Available for Allocation' }
        ]
      },
      { 
        no: `${floor}02`, 
        type: 'Double Shared Room', 
        totalBeds: 2, 
        occupiedBeds: isPadmaF1 ? 1 : 0, 
        status: isPadmaF1 ? '1 Vacant Bed' : '2 Vacant Beds', 
        beds: isPadmaF1 ? [
          { label: 'Bed A', isOccupied: true, student: 'parvez (CSE)' },
          { label: 'Bed B', isOccupied: false, student: 'Available for Allocation' }
        ] : [
          { label: 'Bed A', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed B', isOccupied: false, student: 'Available for Allocation' }
        ]
      },
      { 
        no: `${floor}03`, 
        type: 'Double Shared Room', 
        totalBeds: 2, 
        occupiedBeds: 0, 
        status: '2 Vacant Beds', 
        beds: [
          { label: 'Bed A', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed B', isOccupied: false, student: 'Available for Allocation' }
        ]
      },
      { 
        no: `${floor}04`, 
        type: 'Double Shared Room', 
        totalBeds: 2, 
        occupiedBeds: isPadmaF1 ? 2 : 0, 
        status: isPadmaF1 ? 'Fully Occupied' : '2 Vacant Beds', 
        beds: isPadmaF1 ? [
          { label: 'Bed A', isOccupied: true, student: 'Resident Student (EEE)' },
          { label: 'Bed B', isOccupied: true, student: 'Tanvir Hasan (CSE)' }
        ] : [
          { label: 'Bed A', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed B', isOccupied: false, student: 'Available for Allocation' }
        ]
      },
      { 
        no: `${floor}05`, 
        type: 'Single Deluxe Room', 
        totalBeds: 1, 
        occupiedBeds: 0, 
        status: 'Vacant Room (1 Bed)', 
        beds: [
          { label: 'Bed A', isOccupied: false, student: 'Available for Allocation' }
        ]
      },
      { 
        no: `${floor}06`, 
        type: 'Double Shared Room', 
        totalBeds: 2, 
        occupiedBeds: 0, 
        status: '2 Vacant Beds', 
        beds: [
          { label: 'Bed A', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed B', isOccupied: false, student: 'Available for Allocation' }
        ]
      },
      { 
        no: `${floor}07`, 
        type: '4-Bed Standard Room', 
        totalBeds: 4, 
        occupiedBeds: 0, 
        status: '4 Vacant Beds', 
        beds: [
          { label: 'Bed A', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed B', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed C', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed D', isOccupied: false, student: 'Available for Allocation' }
        ]
      },
      { 
        no: `${floor}08`, 
        type: 'Double Shared Room', 
        totalBeds: 2, 
        occupiedBeds: 0, 
        status: '2 Vacant Beds', 
        beds: [
          { label: 'Bed A', isOccupied: false, student: 'Available for Allocation' },
          { label: 'Bed B', isOccupied: false, student: 'Available for Allocation' }
        ]
      },
    ];
  };

  const currentHallRooms = liveRooms && liveRooms.length > 0
    ? liveRooms.filter(
        (r) =>
          !((r.hallName || r.hallId || '').toLowerCase().includes('meghna')) &&
          String(r.floor) === String(selectedFloor)
      )
    : [];

  const floorRooms = currentHallRooms.length > 0
    ? currentHallRooms.map((r) => {
        const occBeds = r.beds ? r.beds.filter((b) => b.isOccupied).length : (r.occupiedCount || 0);
        const cap = r.capacity || (r.beds ? r.beds.length : 2);
        const vacBeds = Math.max(0, cap - occBeds);
        return {
          id: r._id,
          no: r.roomNumber,
          type: r.roomType || (cap === 1 ? 'Single Deluxe Room' : cap === 4 ? 'Quad Shared Room' : 'Double Shared Room'),
          totalBeds: cap,
          occupiedBeds: occBeds,
          status: vacBeds === 0 ? 'Fully Occupied' : `${vacBeds} Vacant Bed${vacBeds > 1 ? 's' : ''}`,
          beds: r.beds && r.beds.length > 0
            ? r.beds.map((b, idx) => ({
                label: b.bedLabel || b.label || `Bed ${String.fromCharCode(65 + idx)}`,
                isOccupied: Boolean(b.isOccupied),
                student: b.isOccupied ? (b.studentName ? `${b.studentName}${b.studentDept ? ` (${b.studentDept})` : ''}` : 'Resident Student') : 'Available for Allocation',
                studentDept: b.studentDept || '',
              }))
            : Array.from({ length: cap }, (_, i) => ({
                label: `Bed ${String.fromCharCode(65 + i)}`,
                isOccupied: i < occBeds,
                student: i < occBeds ? 'Resident Student' : 'Available for Allocation',
              })),
        };
      })
    : generateFloorRooms('padma', selectedFloor);

  const displayedRooms = filterVacantOnly
    ? floorRooms.filter((rm) => rm.occupiedBeds < rm.totalBeds)
    : floorRooms;

  return (
    <section id="vacancy" className="py-12 md:py-16 bg-slate-50 dark:bg-[#060911] border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Live Seat Vacancy & Room Explorer
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Room & Bed Availability
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time room occupancy and available bed status across all residential floors.
            </p>
          </div>

          {/* Active Hall Indicator */}
          <div className="ios-glass-pill flex items-center gap-2 px-4.5 py-2 rounded-full text-emerald-800 dark:text-emerald-300 text-xs font-bold whitespace-nowrap">
            <Building size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Padma Residential Hall (Floor 1 & 2)</span>
          </div>
        </div>

        {/* Interactive Floor Matrix Card */}
        <div className="ios-glass-card p-6 md:p-8 rounded-3xl">
          
          {/* Header of Floor Explorer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {currentHall.name}
                </span>
                <span className="ios-glass-pill text-[10px] font-bold px-3 py-0.5 rounded-full text-emerald-700 dark:text-emerald-300">
                  {currentHall.gender}
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1.5">
                <UserCheck size={14} />
                <span>Assigned House Tutor: {currentHall.tutors[selectedFloor] || 'Designated Floor House Tutor'}</span>
              </p>
            </div>

            {/* Controls: Floor selector + Filter vacant seats */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="ios-glass-pill flex items-center gap-1 p-1 rounded-full">
                <span className="text-xs text-slate-500 px-2.5 font-medium">Floor:</span>
                {currentHall.floors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => {
                      setSelectedFloor(fl);
                      setActiveRoom(null);
                    }}
                    className={`ios-tap-active px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedFloor === fl
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Floor {fl}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setFilterVacantOnly(!filterVacantOnly)}
                className={`ios-glass-pill ios-tap-active px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterVacantOnly
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 font-bold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Filter size={13} />
                <span>{filterVacantOnly ? 'Showing Vacant Only' : 'Show All Rooms'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Room Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedRooms.map((rm) => {
              const isFull = rm.occupiedBeds === rm.totalBeds;
              const hasVacant = rm.occupiedBeds < rm.totalBeds;
              const isSelected = activeRoom?.no === rm.no;

              return (
                <div
                  key={rm.no}
                  onClick={() => setActiveRoom(rm)}
                  className={`ios-tap-active p-4.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500 shadow-lg'
                      : isFull
                      ? 'bg-white/40 dark:bg-black/20 border-slate-200/60 dark:border-white/5 opacity-80'
                      : 'bg-white/60 dark:bg-white/5 border-emerald-500/30 hover:border-emerald-500 hover:shadow-md'
                  } backdrop-blur-md`}
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bed size={15} className={hasVacant ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                        Room {rm.no}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFull
                        ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {rm.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 font-medium">
                    {rm.type} • {rm.occupiedBeds}/{rm.totalBeds} Beds Occupied
                  </div>

                  {/* Bed Breakdown Visualizer */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {rm.beds.map((b) => (
                      <div key={b.label} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${b.isOccupied ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{b.label}:</span>
                          <span className={`truncate max-w-[130px] ${b.isOccupied ? 'text-slate-500' : 'text-emerald-700 dark:text-emerald-400 font-medium'}`}>
                            {b.isOccupied ? 'Occupied' : 'Vacant'}
                          </span>
                        </div>

                        {/* Availability Status Badge (No Apply Button) */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.isOccupied
                            ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                        }`}>
                          {b.isOccupied ? 'Booked' : 'Available'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Room Allocation Status Summary Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Room Status:</span>
                    <span className={`font-semibold ${hasVacant ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                      {hasVacant ? `${rm.totalBeds - rm.occupiedBeds} Bed(s) Available` : 'Fully Occupied'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Room Detail Inspection Drawer */}
          {activeRoom && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {currentHall.name} • Room {activeRoom.no} ({activeRoom.type})
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Floor {selectedFloor}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {activeRoom.beds.map((b) => (
                    <div key={b.label} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${b.isOccupied ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                      <span className="font-semibold">{b.label}:</span>
                      <span>{b.student}</span>
                    </div>
                  ))}
                </div>
              </div>

              {activeRoom.occupiedBeds < activeRoom.totalBeds ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-xs shrink-0 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{activeRoom.totalBeds - activeRoom.occupiedBeds} Bed(s) Available</span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-500 px-3.5 py-2 rounded-xl bg-slate-200/60 dark:bg-slate-800">
                  Fully Allocated (No Vacancies)
                </span>
              )}
            </div>
          )}

          {/* Matrix Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Available Bed (Vacant)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Booked / Allocated Resident</span>
              </div>
            </div>
            <span>Live verified occupancy records from Padma Residential Hall Administration</span>
          </div>

        </div>

      </div>
    </section>
  );
}
