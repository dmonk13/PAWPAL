import { db } from "./db";
import { appointments, veterinarians, users, dogs } from "@shared/schema";

async function addSampleAppointments() {
  console.log("Adding sample appointments...");

  try {
    // Get some users, dogs, and veterinarians
    const allUsers = await db.select().from(users).limit(3);
    const allDogs = await db.select().from(dogs).limit(5);
    const allVets = await db.select().from(veterinarians).limit(8);

    if (allUsers.length === 0 || allDogs.length === 0 || allVets.length === 0) {
      console.log("Not enough data to create appointments");
      return;
    }

    const sampleAppointments = [
      {
        userId: allUsers[0].id,
        dogId: allDogs[0].id,
        veterinarianId: allVets[3].id, // Dr. Rajesh Gupta (Bangalore)
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        serviceType: "Routine Health Checkup",
        status: "scheduled",
        notes: "Annual wellness exam and vaccination updates",
        isExternal: false,
      },
      {
        userId: allUsers[1].id,
        dogId: allDogs[1].id,
        veterinarianId: allVets[4].id, // Dr. Priya Sharma (Bangalore)
        appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        serviceType: "Dermatology Consultation",
        status: "scheduled",
        notes: "Skin irritation and allergy assessment",
        isExternal: false,
      },
      {
        userId: allUsers[2].id,
        dogId: allDogs[2].id,
        veterinarianId: allVets[5].id, // Dr. Arun Kumar (Bangalore)
        appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        serviceType: "Orthopedic Surgery Follow-up",
        status: "completed",
        notes: "Post-surgery recovery check and physical therapy assessment",
        isExternal: false,
      },
      {
        userId: allUsers[0].id,
        dogId: allDogs[3].id,
        veterinarianId: allVets[6].id, // Dr. Meera Nair (Bangalore)
        appointmentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        serviceType: "Exotic Pet Consultation",
        status: "scheduled",
        notes: "Behavioral assessment and nutritional guidance",
        isExternal: false,
      },
      {
        userId: allUsers[1].id,
        dogId: allDogs[4].id,
        veterinarianId: allVets[7].id, // Dr. Vikram Singh (24/7 Emergency)
        appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        serviceType: "Emergency Consultation",
        status: "scheduled",
        notes: "Urgent care for stomach upset and lethargy",
        isExternal: false,
      },
      {
        userId: allUsers[2].id,
        dogId: allDogs[0].id,
        veterinarianId: allVets[3].id, // Dr. Rajesh Gupta
        appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        serviceType: "Vaccination",
        status: "completed",
        notes: "Rabies and DHPP vaccination booster shots",
        isExternal: false,
      }
    ];

    const insertedAppointments = await db.insert(appointments).values(sampleAppointments).returning();
    console.log(`Inserted ${insertedAppointments.length} sample appointments`);

    console.log("Sample appointments added successfully!");

  } catch (error) {
    console.error("Error adding sample appointments:", error);
    throw error;
  }
}

// Run the function
addSampleAppointments().catch(console.error);