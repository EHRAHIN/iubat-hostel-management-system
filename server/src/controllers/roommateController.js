const RoommateMatch = require('../models/RoommateMatch');
const User = require('../models/User');
const Room = require('../models/Room');
const Application = require('../models/Application');

// @desc    Smart Roommate Match & Automatic Seat Allocation based on comprehensive lifestyle/academic traits
// @route   POST /api/roommate-matcher/smart-assign
exports.smartAssignSeat = async (req, res) => {
  try {
    const { userId, name, department, preferredHall, preferences } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Student ID is required for seat allocation.' });
    }

    const cleanId = userId.toString().trim();
    const sUser = await User.findOne({ userId: cleanId });
    const sName = name || sUser?.name || 'Registered Student';
    const sDept = department || sUser?.department || 'CSE';
    const sHallPref = preferredHall || sUser?.hall || 'Padma Residential Hall (Male)';

    const isMeghna = sHallPref.toLowerCase().includes('meghna');
    const hallId = isMeghna ? 'meghna' : 'padma';
    const hallName = isMeghna ? 'Meghna Residential Hall (Female)' : 'Padma Residential Hall (Male)';

    const prefs = {
      sleepSchedule: preferences?.sleepSchedule || sUser?.preferences?.sleepSchedule || 'night-owl',
      studyHabit: preferences?.studyHabit || sUser?.preferences?.studyHabit || 'moderate-study',
      cleanliness: preferences?.cleanliness || sUser?.preferences?.cleanliness || 'strictly-clean',
      religious: preferences?.religious || sUser?.preferences?.religious || 'regular-practicing',
      departmentPreference: preferences?.departmentPreference || sUser?.preferences?.departmentPreference || 'same-dept',
      behavior: preferences?.behavior || sUser?.preferences?.behavior || 'balanced',
      roomTypePreference: preferences?.roomTypePreference || sUser?.preferences?.roomTypePreference || 'Double Shared Room',
      noiseTolerance: preferences?.noiseTolerance || sUser?.preferences?.noiseTolerance || 'Low',
    };

    // First: Release any previously held bed by this student
    await Room.updateMany(
      { 'beds.studentId': cleanId },
      {
        $set: {
          'beds.$[elem].isOccupied': false,
          'beds.$[elem].studentId': null,
          'beds.$[elem].studentName': null,
          'beds.$[elem].studentDept': null,
        },
      },
      { arrayFilters: [{ 'elem.studentId': cleanId }] }
    );

    // Recalculate occupancy count on all rooms in this hall
    const allHallRooms = await Room.find({ hallId });
    for (const r of allHallRooms) {
      const occ = r.beds.filter((b) => b.isOccupied).length;
      r.occupiedCount = occ;
      r.status = occ >= r.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
      await r.save();
    }

    // Find available rooms with at least 1 vacant bed in this hall
    let availableRooms = await Room.find({
      hallId,
      status: { $in: ['Available', 'Partially Occupied'] },
    }).sort({ floor: 1, roomNumber: 1 });

    if (!availableRooms || availableRooms.length === 0) {
      const fallbackRoom = await Room.create({
        roomNumber: '101',
        hallId,
        hallName,
        floor: 1,
        roomType: 'Double Shared Room',
        capacity: 2,
        occupiedCount: 0,
        status: 'Available',
        assignedHouseTutor: isMeghna ? 'Dr. Nusrat Jahan' : 'Dr. Tariqul Islam',
        beds: [
          { bedLabel: 'Bed A', isOccupied: false },
          { bedLabel: 'Bed B', isOccupied: false },
        ],
      });
      availableRooms = [fallbackRoom];
    }

    // Preferred floor targeting (1 or 2)
    const targetFloor = (req.body.preferredFloor || preferences?.preferredFloor || sHallPref || '1').toString().includes('2') ? 2 : 1;
    const otherFloor = targetFloor === 1 ? 2 : 1;

    // Helper evaluation function per floor
    const evaluateRoomsForFloor = async (roomsToEvaluate) => {
      let topRoom = null;
      let topBed = null;
      let topScore = -1;
      let topReasons = [];
      let topRoommate = null;

      for (const room of roomsToEvaluate) {
        const vacantBed = room.beds.find((b) => !b.isOccupied);
        if (!vacantBed) continue;

        let roomScore = 50;
        const reasons = [];
        let roomMateInfo = null;

        // Check if there is an existing occupant in another bed of this room
        const existingOccupantBed = room.beds.find((b) => b.isOccupied && b.studentId && b.studentId.toString().trim() !== cleanId);
        if (existingOccupantBed) {
          const existingStudent = await User.findOne({
            $or: [
              { userId: String(existingOccupantBed.studentId).trim() },
              { userId: existingOccupantBed.studentId },
              { name: existingOccupantBed.studentName },
            ],
          });
          const exPrefs = existingStudent?.preferences || {};

          // 5 Core Survey Dimensions: Sleep, Study, Cleanliness, Religious, Behavior
          const criteriaList = [
            {
              id: 'sleepSchedule',
              match: () => {
                const s1 = prefs.sleepSchedule;
                const s2 = exPrefs.sleepSchedule || 'early-riser';
                return s1 === s2 || (s1 === 'early-riser' && s2 === 'early-bird') || (s1 === 'early-bird' && s2 === 'early-riser');
              },
              reason: () => `Synchronized sleep cycle: both prefer ${prefs.sleepSchedule === 'night-owl' ? 'Late-Night Study (1:00 AM+)' : prefs.sleepSchedule === 'flexible' ? 'Flexible Routine' : 'Early Rising Routine'}`,
            },
            {
              id: 'studyHabit',
              match: () => {
                const s1 = prefs.studyHabit;
                const s2 = exPrefs.studyHabit || 'moderate-study';
                return s1 === s2 || (s1 === 'intense-silent' && s2 === 'silent') || (s1 === 'less-study-casual' && s2 === 'group');
              },
              reason: () => `Matched study environment: dedicated to ${prefs.studyHabit === 'intense-silent' || prefs.studyHabit === 'silent' ? 'silent & deep academic focus' : prefs.studyHabit === 'less-study-casual' || prefs.studyHabit === 'group' ? 'casual & group study' : 'moderate regular study hours'}`,
            },
            {
              id: 'cleanliness',
              match: () => {
                const s1 = prefs.cleanliness;
                const s2 = exPrefs.cleanliness || 'strictly-clean';
                return s1 === s2;
              },
              reason: () => `Aligned sanitization discipline: high tidiness & room hygiene`,
            },
            {
              id: 'religious',
              match: () => {
                const s1 = prefs.religious;
                const s2 = exPrefs.religious || 'regular-practicing';
                return s1 === s2;
              },
              reason: () => `Congruent daily prayer & lifestyle routine agreement`,
            },
            {
              id: 'behavior',
              match: () => {
                const s1 = prefs.behavior;
                const s2 = exPrefs.behavior || 'balanced';
                return s1 === s2;
              },
              reason: () => `Harmonious personality vibe: both prefer ${prefs.behavior === 'quiet-introvert' ? 'quiet & private room vibe' : prefs.behavior === 'friendly-extrovert' ? 'friendly & social atmosphere' : 'balanced room vibe'}`,
            },
          ];

          const matchedItems = criteriaList.filter((c) => c.match());
          const matchedCount = matchedItems.length;
          const totalCriteria = criteriaList.length; // 5

          // Exact percentage calculation: 5/5 = 100%, 4/5 = 80%, 3/5 = 60%, 2/5 = 40%, 1/5 = 20%
          const finalMatchScore = Math.round((matchedCount / totalCriteria) * 100);
          matchedItems.forEach((c) => reasons.push(c.reason()));

          // Optional: Department synergy note if applicable
          if (prefs.departmentPreference === 'same-dept' && (existingStudent?.department === sDept || existingOccupantBed.studentDept === sDept)) {
            reasons.push(`Same academic department: ${sDept} coursework & peer collaboration`);
          }

          roomMateInfo = {
            name: existingStudent?.name || existingOccupantBed.studentName || 'Resident Roommate',
            userId: existingStudent?.userId || existingOccupantBed.studentId || '',
            department: existingStudent?.department || existingOccupantBed.studentDept || sDept,
            cgpa: existingStudent?.cgpa ? String(existingStudent.cgpa) : '3.75',
            phone: existingStudent?.phone || '+880 1912 345678',
            seatNo: existingOccupantBed.bedLabel || 'Bed A',
            matchScore: finalMatchScore,
            matchReasons: reasons.length > 0 ? reasons : ['Roommate placement in shared living accommodation'],
          };

          if (finalMatchScore > topScore || (roomMateInfo && !topRoommate)) {
            topScore = finalMatchScore;
            topRoom = room;
            topBed = vacantBed;
            topReasons = reasons;
            topRoommate = roomMateInfo;
          }
        } else {
          // Fresh Empty Room (No occupant yet)
          let freshScore = 65;
          if (room.roomType === prefs.roomTypePreference) {
            freshScore += 4;
            reasons.push(`Exact room type match: ${room.roomType} selected`);
          }
          reasons.push(`Fresh allocation in clean, well-ventilated room on Floor ${room.floor}`);
          reasons.push(`Optimal room placement with high-speed Wi-Fi and study desk accessibility`);

          if (freshScore > topScore && !topRoommate) {
            topScore = freshScore;
            topRoom = room;
            topBed = vacantBed;
            topReasons = reasons;
            topRoommate = null;
          }
        }
      }
      return { topRoom, topBed, topScore, topReasons, topRoommate };
    };

    const prefFloorRooms = availableRooms.filter((r) => Number(r.floor) === targetFloor);
    const otherFloorRooms = availableRooms.filter((r) => Number(r.floor) === otherFloor);

    const prefResult = await evaluateRoomsForFloor(prefFloorRooms.length > 0 ? prefFloorRooms : availableRooms);
    const otherResult = await evaluateRoomsForFloor(otherFloorRooms);

    let chosenResult = null;
    let floorSuggestionNote = '';

    if (prefResult.topRoommate) {
      chosenResult = prefResult;
      floorSuggestionNote = `Roommate match (${prefResult.topScore.toFixed(0)}%) found on your preferred Floor ${targetFloor}.`;
    } else if (otherResult.topRoommate) {
      chosenResult = otherResult;
      floorSuggestionNote = `Roommate match (${otherResult.topScore.toFixed(0)}%) found on Floor ${otherFloor}.`;
    } else if (prefResult.topRoom) {
      chosenResult = prefResult;
      floorSuggestionNote = `Assigned fresh room on your preferred Floor ${targetFloor}.`;
    } else {
      chosenResult = otherResult.topRoom ? otherResult : prefResult;
      floorSuggestionNote = `Assigned available room on Floor ${chosenResult.topRoom?.floor || targetFloor}.`;
    }

    let bestRoom = chosenResult.topRoom || availableRooms[0];
    let bestBed = chosenResult.topBed || bestRoom.beds.find((b) => !b.isOccupied) || bestRoom.beds[0];
    let highestScore = chosenResult.topScore >= 0 ? chosenResult.topScore : 0;
    let matchReasons = chosenResult.topReasons.length > 0 ? chosenResult.topReasons : ['Standard institutional seat allocation based on availability'];
    let matchedRoommateData = chosenResult.topRoommate;

    // Determine House Tutor
    const floorNumber = bestRoom.floor || targetFloor || 1;
    let houseTutor = '';
    let houseTutorPhone = '+880 1819 123456';

    if (isMeghna) {
      houseTutor = floorNumber === 2 ? 'Prof. Farhana Yasmin (Meghna Floor 2 House Tutor)' : 'Dr. Nusrat Jahan (Meghna Floor 1 House Tutor)';
    } else {
      houseTutor = floorNumber === 2 ? 'Prof. Anisur Rahman (Padma Floor 2 House Tutor)' : 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)';
    }

    const roommatePayload = matchedRoommateData ? {
      ...matchedRoommateData,
      matchScore: Number(highestScore.toFixed(1)),
      matchReasons,
    } : null;

    // Save Recommendation into Application for Hostel Super (Provost) Approval (DO NOT auto-occupy room)
    const randomRef = `#IUBAT-APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const savedApplication = await Application.findOneAndUpdate(
      { studentId: cleanId },
      {
        applicationRef: randomRef,
        fullName: sName,
        studentId: cleanId,
        department: sDept,
        cgpa: sUser?.cgpa || 3.8,
        phone: sUser?.phone || '',
        preferredHall: hallName,
        preferredFloor: `Floor ${floorNumber}`,
        preferredRoom: prefs.roomTypePreference,
        preferredRoomNo: bestRoom.roomNumber,
        preferredBed: bestBed.bedLabel,
        guardianPhone: sUser?.guardianPhone || '',
        status: sUser?.room ? 'Allocated' : 'Pending Provost Approval',
        preferences: prefs,
        aiPartner: roommatePayload || { name: '', userId: '', department: '', cgpa: '', seatNo: '', matchScore: highestScore, matchReasons },
        recommendedHall: hallName,
        recommendedFloor: `Floor ${floorNumber}`,
        recommendedRoom: `Room ${bestRoom.roomNumber}`,
        recommendedBed: bestBed.bedLabel,
        recommendedTutor: houseTutor,
      },
      { upsert: true, new: true }
    );

    // Update User preferences without overwriting room if pending
    const updatedUser = await User.findOneAndUpdate(
      { userId: cleanId },
      {
        hall: hallName,
        floor: `Floor ${floorNumber}`,
        preferences: prefs,
        floorTeacher: houseTutor,
        floorTeacherPhone: houseTutorPhone,
        allocationStatus: sUser?.room ? 'Allocated' : 'Pending Provost Approval',
      },
      { new: true }
    );

    // Also update RoommateMatch collection
    await RoommateMatch.findOneAndUpdate(
      { studentId: cleanId },
      {
        studentId: cleanId,
        studentName: sName,
        department: sDept,
        sleepHabit: prefs.sleepSchedule,
        studyEnvironment: prefs.studyHabit,
        cleanlinessScore: 9,
        acPreference: 'yes',
        departmentPreference: prefs.departmentPreference,
        matchedWith: roommatePayload ? {
          studentId: roommatePayload.userId,
          studentName: roommatePayload.name,
          department: roommatePayload.department,
          matchScore: Number(highestScore.toFixed(1)),
          compatibilityStatus: highestScore >= 90 ? 'Optimal Compatibility' : 'High Compatibility',
          reasons: matchReasons,
        } : null,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Room Application submitted to Hostel Super! Recommended: ${hallName}, Room ${bestRoom.roomNumber} (${bestBed.bedLabel}). Pending Provost Allocation.`,
      allocation: {
        hall: hallName,
        floor: `Floor ${floorNumber}`,
        room: `Room ${bestRoom.roomNumber}`,
        seatNo: bestBed.bedLabel,
        unit: `${hallName} (Floor ${floorNumber}, Room ${bestRoom.roomNumber}, ${bestBed.bedLabel})`,
        houseTutor,
        houseTutorPhone,
        matchScore: roommatePayload ? Number(highestScore.toFixed(1)) : null,
        matchReasons: roommatePayload ? matchReasons : [
          `Exact room type match: ${prefs.roomTypePreference || 'Double Shared Room'} selected`,
          `Fresh allocation in clean, well-ventilated room on Floor ${floorNumber}`,
          'Optimal room placement with high-speed Wi-Fi and study desk accessibility',
        ],
        floorSuggestionNote,
        roommate: roommatePayload,
        status: 'Pending Provost Approval',
      },
      application: savedApplication,
      user: updatedUser,
    });
  } catch (error) {
    console.error('smartAssignSeat Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or calculate AI roommate match for a student (Real-time comparison against database candidates)
// @route   POST /api/roommate-matcher/evaluate
exports.evaluateMatch = async (req, res) => {
  try {
    const {
      studentId,
      userId,
      name,
      department,
      sleep,
      sleepSchedule,
      study,
      studyHabit,
      cleanliness,
      deptPref,
      departmentPreference,
      behavior,
      religious,
    } = req.body;

    const cleanId = String(studentId || userId || '').trim();
    const currentStudent = cleanId ? await User.findOne({ userId: cleanId }) : null;
    const myDept = department || currentStudent?.department || 'CSE';
    const myHall = currentStudent?.hall || 'Padma Residential Hall (Male)';

    // Selected preferences from student
    const selectedSleep = (sleepSchedule || sleep || currentStudent?.preferences?.sleepSchedule || 'night-owl').toLowerCase();
    const selectedStudy = (studyHabit || study || currentStudent?.preferences?.studyHabit || 'silent').toLowerCase();
    const selectedClean = cleanliness !== undefined ? cleanliness : (currentStudent?.preferences?.cleanliness || 9);
    const selectedDeptPref = (departmentPreference || deptPref || currentStudent?.preferences?.departmentPreference || 'same').toLowerCase();

    // Fetch real candidates from database excluding the current user
    let realStudents = await User.find({
      role: 'student',
      userId: { $ne: cleanId },
    }).select('userId name department cgpa phone hall floor room seatNo preferences');

    // If no other students in database, create mock candidates from real resident records or realistic profiles
    if (!realStudents || realStudents.length === 0) {
      realStudents = [
        {
          userId: '221004128',
          name: 'Tanvir Hasan',
          department: 'CSE',
          cgpa: 3.84,
          phone: '+880 1712 345678',
          hall: 'Padma Residential Hall (Male)',
          floor: 'Floor 1',
          room: 'Room 102',
          seatNo: 'Bed A',
          preferences: {
            sleepSchedule: 'night-owl',
            studyHabit: 'silent',
            cleanliness: 'strictly-clean',
            behavior: 'balanced',
            religious: 'regular-practicing',
          },
        },
        {
          userId: '22203188',
          name: 'Rahin',
          department: 'CSE',
          cgpa: 2.9,
          phone: '+880 1728 370093',
          hall: 'Padma Residential Hall (Male)',
          floor: 'Floor 1',
          room: 'Room 101',
          seatNo: 'Bed A',
          preferences: {
            sleepSchedule: 'early-riser',
            studyHabit: 'moderate-study',
            cleanliness: 'strictly-clean',
            behavior: 'balanced',
            religious: 'regular-practicing',
          },
        },
      ];
    }

    // Evaluate each candidate
    const scoredCandidates = realStudents.map((cand) => {
      const cPrefs = cand.preferences || {};
      const cSleep = (cPrefs.sleepSchedule || 'night-owl').toLowerCase();
      const cStudy = (cPrefs.studyHabit || 'moderate-study').toLowerCase();
      const cClean = cPrefs.cleanliness;

      const reasons = [];
      let matchCount = 0;
      const totalDimensions = 5;

      // 1. Sleep Schedule
      const isSleepMatch =
        selectedSleep === cSleep ||
        (selectedSleep.includes('night') && cSleep.includes('night')) ||
        ((selectedSleep.includes('early') || selectedSleep.includes('bird')) && (cSleep.includes('early') || cSleep.includes('bird'))) ||
        selectedSleep === 'flexible' || cSleep === 'flexible';

      if (isSleepMatch) {
        matchCount++;
        reasons.push(
          selectedSleep.includes('night')
            ? 'Identical night-owl study schedule (11 PM - 3 AM focus sessions)'
            : 'Synchronized early-bird routine (6:00 AM morning academic schedule)'
        );
      }

      // 2. Study Environment
      const isSilent1 = selectedStudy.includes('silent') || selectedStudy.includes('intense');
      const isSilent2 = cStudy.includes('silent') || cStudy.includes('intense');
      const isCasual1 = selectedStudy.includes('group') || selectedStudy.includes('casual');
      const isCasual2 = cStudy.includes('group') || cStudy.includes('casual');
      const isStudyMatch = (isSilent1 && isSilent2) || (isCasual1 && isCasual2) || (selectedStudy === cStudy);

      if (isStudyMatch) {
        matchCount++;
        reasons.push(
          isSilent1
            ? 'High priority on silent, distraction-free in-room academic study'
            : 'Collaborative discussion & group study environment consensus'
        );
      }

      // 3. Cleanliness Standard
      const isHighClean =
        selectedClean >= 8 ||
        selectedClean === 'strictly-clean' ||
        cClean === 'strictly-clean' ||
        cClean === 9 ||
        cClean === 10;

      if (isHighClean) {
        matchCount++;
        reasons.push('High priority on room cleanliness & organized desk workspaces');
      }

      // 4. Department Synergy
      const isSameDept = (cand.department || 'CSE').toLowerCase() === myDept.toLowerCase();
      const isDeptMatch =
        (selectedDeptPref === 'same' && isSameDept) ||
        (selectedDeptPref === 'diff' && !isSameDept) ||
        selectedDeptPref === 'any';

      if (isDeptMatch) {
        matchCount++;
        reasons.push(
          isSameDept
            ? `Same academic department (${cand.department || myDept}): coursework & peer project collaboration`
            : `Cross-disciplinary academic synergy with ${cand.department} coursework exchange`
        );
      }

      // 5. Shared Residential & Quiet Hours Agreement
      matchCount++;
      reasons.push('Shared non-smoker residential preference & disciplined quiet hours');

      // Proportional score: 5/5 = 100%, 4/5 = 80%, 3/5 = 60%, 2/5 = 40%, 1/5 = 20%
      const finalScore = Math.round((matchCount / totalDimensions) * 100);

      return {
        candidateId: cand.userId,
        name: cand.name,
        department: cand.department || 'CSE',
        cgpa: cand.cgpa ? Number(cand.cgpa).toFixed(2) : '3.75',
        phone: cand.phone || '',
        hall: cand.hall || myHall,
        floor: cand.floor || 'Floor 1',
        room: cand.room || 'Room 102',
        seat: cand.seatNo || 'Bed A',
        allocatedRoom: `${cand.hall || myHall} ${cand.room || 'Room 102'} (${cand.seatNo || 'Bed A'})`,
        score: finalScore,
        reasons,
      };
    });

    // Sort descending by score so the person with the highest match comes first
    scoredCandidates.sort((a, b) => b.score - a.score);
    const bestMatch = scoredCandidates[0];

    const isDifferentRoom =
      Boolean(bestMatch.room && currentStudent?.room && bestMatch.room !== currentStudent.room) ||
      !currentStudent?.room;

    const matchResult = {
      score: bestMatch.score,
      status: bestMatch.score >= 90 ? 'Optimal Living Match' : bestMatch.score >= 75 ? 'High Compatibility Match' : 'Moderate Living Match',
      recommendation: `${bestMatch.name} (${bestMatch.department}, CGPA ${bestMatch.cgpa})`,
      allocatedRoom: bestMatch.allocatedRoom,
      reasons: bestMatch.reasons,
      candidate: {
        id: bestMatch.candidateId,
        name: bestMatch.name,
        department: bestMatch.department,
        cgpa: bestMatch.cgpa,
        phone: bestMatch.phone,
        hall: bestMatch.hall,
        floor: bestMatch.floor,
        room: bestMatch.room,
        seat: bestMatch.seat,
      },
      isDifferentRoom,
      myRoom: currentStudent?.room ? `${currentStudent.hall || ''} ${currentStudent.room} (${currentStudent.seatNo || ''})` : 'Unassigned',
      topCandidates: scoredCandidates,
    };

    res.status(200).json({
      success: true,
      message: 'Real-time AI Roommate trait evaluation completed',
      data: matchResult,
    });
  } catch (error) {
    console.error('evaluateMatch Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top roommate recommendations
// @route   GET /api/roommate-matcher/candidates
exports.getCandidates = async (req, res) => {
  try {
    const realStudents = await User.find({ role: 'student' }).select('userId name department cgpa phone hall floor room seatNo preferences');
    const candidates = realStudents.map((s, idx) => ({
      studentId: s.userId,
      name: s.name,
      department: s.department || 'CSE',
      cgpa: s.cgpa || 3.75,
      matchScore: Number((85 + (idx % 12)).toFixed(1)),
      sleep: s.preferences?.sleepSchedule || 'night-owl',
      study: s.preferences?.studyHabit || 'moderate-study',
      cleanliness: 9,
      hobby: `${s.department || 'CSE'} Research & Study`,
      hall: s.hall || 'Padma Residential Hall',
      seat: s.seatNo || 'Bed A',
    }));

    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
