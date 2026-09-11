import React, { useState } from 'react';
import { 
  Building, 
  CheckCircle2, 
  ArrowRight, 
  Bed, 
  Users, 
  Layers, 
  ShieldCheck, 
  UserCheck,
  Sparkles,
  Filter,
  Eye
} from 'lucide-react';

export default function SeatRadarSection({ onApplyForHall }) {
  const [selectedBlock, setSelectedBlock] = useState('padma');
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [activeRoom, setActiveRoom] = useState(null);
  const [filterVacantOnly, setFilterVacantOnly] = useState(false);

  // Building Configurations (Exactly 2 Halls: 1 Male, 1 Female; 2 Floors each)
  const hallConfigs = {
    padma: {
      name: 'Padma Residential Hall (Male)',
      gender: 'Male Students',
      totalFloors: 2,
      floors: ['1', '2'],
      tutors: {
        '1': 'Dr. Tariqul Islam (Floor 1 House Tutor)',
        '2': 'Prof. Anisur Rahman (Floor 2 House Tutor)',
      },
    },
  };

  const blocks = [
    { id: 'padma', name: 'Padma Residential Hall (Campus Male Residence • 2 Floors)' },
  ];

  const currentHall = hallConfigs[selectedBlock] || hallConfigs.padma;

  // Active Floor Rooms & Beds Matrix (Dynamic: Only registered students are occupied, rest are 100% available)
  const generateFloorRooms = (block, floor) => {
    const isPadmaF1 = block === 'padma' && floor === '1';

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
        occupiedBeds: 0, 
        status: '2 Vacant Beds', 
        beds: [
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
        status: isPadmaF1 ? 'Occupied' : '2 Vacant Beds', 
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

  const floorRooms = generateFloorRooms(selectedBlock, selectedFloor);

  const displayedRooms = filterVacantOnly
    ? floorRooms.filter((rm) => rm.occupiedBeds < rm.totalBeds)
    : floorRooms;

  const handleSelectBlock = (blockId) => {
    setSelectedBlock(blockId);
    setSelectedFloor('1');
    setActiveRoom(null);
  };

  const handleApplyDirect = (room, bedLabel = '') => {
    if (onApplyForHall) {
      onApplyForHall(
        currentHall.name,
        room.type,
        room.no,
        bedLabel || (room.beds.find(b => !b.isOccupied)?.label || 'Bed A'),
        `Floor ${selectedFloor}`
      );
    }
  };

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
              Interactive Room & Seat Availability Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select any vacant seat or bed below to directly submit your allocation application to the Provost Office.
            </p>
          </div>

          {/* Block Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full shadow-xs">
            {blocks.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBlock(b.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedBlock === b.id
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Floor Matrix Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800/90 shadow-xl">
          
          {/* Header of Floor Explorer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {currentHall.name}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {currentHall.gender}
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1.5">
                <UserCheck size={14} />
                <span>Assigned House Tutor: {currentHall.tutors[selectedFloor] || 'Designated Floor House Tutor'}</span>
              </p>
            </div>

            {/* Controls: Floor selector + Filter vacant seats */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#060911] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 px-2 font-medium">Floor:</span>
                {currentHall.floors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => {
                      setSelectedFloor(fl);
                      setActiveRoom(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedFloor === fl
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Floor {fl}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setFilterVacantOnly(!filterVacantOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  filterVacantOnly
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#060911] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
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
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-500 shadow-md'
                      : isFull
                      ? 'bg-slate-50/70 dark:bg-[#060911]/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
                      : 'bg-white dark:bg-[#0c1220] border-emerald-200 dark:border-emerald-900/60 shadow-xs hover:border-emerald-500'
                  }`}
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
                          <span className={`truncate max-w-[110px] ${b.isOccupied ? 'text-slate-500' : 'text-emerald-700 dark:text-emerald-400 font-medium'}`}>
                            {b.isOccupied ? 'Occupied' : 'Vacant'}
                          </span>
                        </div>

                        {/* Apply Trigger for Vacant Bed */}
                        {!b.isOccupied && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyDirect(rm, b.label);
                            }}
                            className="px-2 py-0.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[10px] shadow-xs transition-colors"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Full Room Apply Button if at least 1 seat is vacant */}
                  {hasVacant && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyDirect(rm);
                      }}
                      className="mt-3.5 w-full py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles size={12} />
                      <span>Select for Allocation</span>
                    </button>
                  )}
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
                <button
                  onClick={() => handleApplyDirect(activeRoom)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  <span>Apply for Available Seat in Room {activeRoom.no}</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <span className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800">
                  Fully Allocated (No Vacancies)
                </span>
              )}
            </div>
          )}

          {/* Matrix Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Available Bed (Instant Application Open)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Occupied / Verified Resident</span>
              </div>
            </div>
            <span>All applications undergo automated CGPA and merit quota evaluation</span>
          </div>

        </div>

      </div>
    </section>
  );
}
