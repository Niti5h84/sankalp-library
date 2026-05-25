const updateSeats = async () => {
  const studentsRes = await fetch('https://sankalp-library.onrender.com/api/students');
  const students = await studentsRes.json();
  
  for (const student of students) {
    if (student.address) {
      console.log(`Fixing seat for student ${student.fullName} (Seat: ${student.address})`);
      
      // Step 1: Force remove the seat to trigger update
      await fetch(`https://sankalp-library.onrender.com/api/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...student,
          seat: "" // Clear the seat
        })
      });

      // Step 2: Re-assign the seat to trigger upsert and Occupied logic
      await fetch(`https://sankalp-library.onrender.com/api/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...student,
          seat: student.address // Re-assign the exact seat
        })
      });
    }
  }
  console.log("Live Sync Done");
};
updateSeats();
