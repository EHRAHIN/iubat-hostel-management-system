import React, { useState, useEffect } from 'react';
import {
  Building2,
  Layers,
  Bed,
  Plus,
  Trash2,
  ArrowRightLeft,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wind,
  Sun,
  DollarSign,
  User,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import AddRoomModal from './AddRoomModal';
import RoomTransferModal from './RoomTransferModal';

export default function RoomManagerSection({
  currentUser,
  onShowToast,
  onAllocateStudent, // optional handler if parent wants to trigger allocation modal
}) {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [floorFilter, setFloorFilter] = useState('all'); // 'all', 1, 2
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Available', 'Under Maintenance', 'Fully Occupied'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState(null);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const res = await api.getRooms();
      if (res?.data) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
      if (onShowToast) onShowToast('Failed to fetch rooms', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Room Status / Availability Toggle
  const handleToggleStatus = async (roomId, currentStatus) => {
    const nextStatus = currentStatus === 'Under Maintenance' ? 'Available' : 'Under Maintenance';
    try {
      const res = await api.updateRoom(roomId, { status: nextStatus });
      if (onShowToast) {
        onShowToast(res?.message || `Room status set to ${nextStatus}`, 'success');
      }
      fetchRooms();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Add Bed to Room
  const handleAddBed = async (roomId, roomNumber) => {
    try {
      const res = await api.addBed(roomId);
      if (onShowToast) {
        onShowToast(res?.message || `Added bed to Room ${roomNumber}`, 'success');
      }
      fetchRooms();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to add bed', 'error');
    }
  };

  // Remove Bed from Room
  const handleRemoveBed = async (roomId, roomNumber, bedLabel) => {
    if (!window.confirm(`Are you sure you want to remove ${bedLabel} from Room ${roomNumber}? Capacity will decrease by 1.`)) {
      return;
    }
    try {
      const res = await api.removeBed(roomId, bedLabel);
      if (onShowToast) {
        onShowToast(res?.message || `Removed ${bedLabel} from Room ${roomNumber}`, 'success');
      }
      fetchRooms();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to remove bed', 'error');
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete Room ${roomNumber}? Any current residents will be unassigned and marked pending.`)) {
      return;
    }
    try {
      const res = await api.deleteRoom(roomId);
      if (onShowToast) {
        onShowToast(res?.message || `Room ${roomNumber} deleted.`, 'info');
      }
      fetchRooms();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to delete room', 'error');
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (floorFilter !== 'all' && r.floor !== Number(floorFilter)) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = r.roomNumber?.toLowerCase().includes(q);
      const matchType = r.roomType?.toLowerCase().includes(q);
      const matchStudent = r.beds?.some(b => b.studentName?.toLowerCase().includes(q) || b.studentId?.toLowerCase().includes(q));
      if (!matchNum && !matchType && !matchStudent) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupied = rooms.reduce((acc, r) => acc + (r.occupiedCount || 0), 0);
  const totalVacant = totalBeds - totalOccupied;
  const maintenanceCount = rooms.filter((r) => r.status === 'Under Maintenance').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Building2 size={20} className="text-emerald-600" />
                <span>Padma Residential Hall • Room & Bed Management</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Live Inventory
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage room availability, add/remove rooms, adjust bed capacities, and transfer student assignments.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchRooms}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Rooms"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all"
            >
              <Plus size={15} />
              <span>Add New Room</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Rooms</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{totalRooms}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Capacity</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{totalBeds} Beds</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Occupied</span>
            <span className="text-lg font-black text-blue-700 dark:text-blue-300 font-mono">{totalOccupied}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Vacant Beds</span>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">{totalVacant}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Under Mnt</span>
            <span className="text-lg font-black text-amber-700 dark:text-amber-300 font-mono">{maintenanceCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-bold text-slate-400 text-[11px] uppercase mr-1">Floor:</span>
          {['all', 1, 2].map((fl) => (
            <button
              key={fl}
              onClick={() => setFloorFilter(fl)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                floorFilter === fl
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              {fl === 'all' ? 'All Floors' : `Floor ${fl}`}
            </button>
          ))}

          <span className="font-bold text-slate-400 text-[11px] uppercase ml-2 mr-1">Status:</span>
          {['all', 'Available', 'Under Maintenance', 'Fully Occupied'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search room, resident or ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
        </div>
      </div>

      {/* 3. Rooms Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          Loading rooms matrix...
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <Building2 size={32} className="mx-auto text-slate-400" />
          <div className="font-bold text-slate-700 dark:text-slate-300">No rooms match your filter.</div>
          <button
            onClick={() => { setFloorFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}
            className="text-xs text-emerald-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const isSingle = room.roomType?.includes('Single');
            const isDouble = room.roomType?.includes('Double');
            const isUnderMaintenance = room.status === 'Under Maintenance';
            const vacantBeds = (room.capacity || 0) - (room.occupiedCount || 0);

            return (
              <div
                key={room._id || room.roomNumber}
                className={`p-5 rounded-3xl bg-white dark:bg-[#0d121f] border transition-all flex flex-col justify-between space-y-4 hover:shadow-lg ${
                  isUnderMaintenance
                    ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200/90 dark:border-slate-800/90'
                }`}
              >
                {/* Room Header */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                          Room {room.roomNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Floor {room.floor}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                        <span className={`font-semibold ${
                          isSingle ? 'text-purple-600' : isDouble ? 'text-blue-600' : 'text-emerald-600'
                        }`}>
                          {room.roomType}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-500">৳{room.monthlyRent}/mo</span>
                      </div>
                    </div>

                    {/* Availability Status Badge / Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(room._id, room.status)}
                      title="Click to toggle availability status"
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                        isUnderMaintenance
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                          : vacantBeds > 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 hover:bg-amber-50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                      }`}
                    >
                      {room.status}
                    </button>
                  </div>

                  {/* Amenities & Capacity Row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      {room.hasAC && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold" title="Air Conditioned">
                          <Wind size={12} /> AC
                        </span>
                      )}
                      {room.hasBalcony && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold" title="Balcony Attached">
                          <Sun size={12} /> Balcony
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {room.occupiedCount}/{room.capacity} Beds
                      </span>
                      {/* Add Bed Button */}
                      <button
                        type="button"
                        onClick={() => handleAddBed(room._id, room.roomNumber)}
                        className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-0.5 transition-colors"
                        title="Add extra bed to this room (increase capacity)"
                      >
                        <Plus size={11} /> Bed
                      </button>
                    </div>
                  </div>

                  {/* Beds Breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Bed Allocation Slots
                    </span>
                    <div className="space-y-1.5">
                      {room.beds?.map((b) => {
                        const isOccupied = b.isOccupied;

                        return (
                          <div
                            key={b.bedLabel}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                              isOccupied
                                ? 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800'
                                : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px] w-12">
                                {b.bedLabel}
                              </span>
                              {isOccupied ? (
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[150px]">
                                    {b.studentName || 'Student Resident'}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-500">
                                    ID: {b.studentId} • {b.studentDept || 'Student'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={11} /> Vacant Slot
                                </span>
                              )}
                            </div>

                            {/* Bed Actions */}
                            <div className="flex items-center gap-1">
                              {isOccupied ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudentForTransfer({
                                      name: b.studentName,
                                      studentName: b.studentName,
                                      userId: b.studentId,
                                      studentId: b.studentId,
                                      department: b.studentDept,
                                      room: `Room ${room.roomNumber}`,
                                      floor: `Floor ${room.floor}`,
                                      seatNo: b.bedLabel,
                                    });
                                    setIsTransferOpen(true);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-colors"
                                  title="Change room / transfer this student"
                                >
                                  <ArrowRightLeft size={10} />
                                  <span>Transfer</span>
                                </button>
                              ) : (
                                <>
                                  {room.capacity > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveBed(room._id, room.roomNumber, b.bedLabel)}
                                      className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                      title="Remove this vacant bed (decrease capacity)"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer of Card: House Tutor & Delete */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate max-w-[180px]">
                    Tutor: <strong className="text-slate-700 dark:text-slate-300">{room.assignedHouseTutor?.split('(')[0]}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(room._id, room.roomNumber)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    title="Delete this entire room"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onSuccess={(msg) => {
          if (onShowToast) onShowToast(msg, 'success');
          fetchRooms();
        }}
      />

      {/* Transfer Student Room Modal */}
      <RoomTransferModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setSelectedStudentForTransfer(null);
        }}
        studentData={selectedStudentForTransfer}
        roomsList={rooms}
        onSuccess={(msg) => {
          if (onShowToast) onShowToast(msg, 'success');
          fetchRooms();
        }}
      />

    </div>
  );
}
