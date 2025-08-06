import { db } from "./db";
import { dogs, medicalProfiles, users } from "@shared/schema";

async function addBangaloreDogs() {
  console.log("Adding dogs in Bangalore area...");

  try {
    // Get some users to assign the dogs to
    const allUsers = await db.select().from(users);
    
    if (allUsers.length === 0) {
      console.log("No users found to assign dogs to");
      return;
    }

    const bangaloreDogs = [
      {
        ownerId: allUsers[0]?.id || "3c3044cf-bd16-46db-bbbf-1394cbdfa513",
        name: "Koko",
        breed: "Golden Retriever",
        age: 3,
        gender: "Female",
        size: "Large",
        bio: "Friendly and energetic Golden Retriever who loves long walks and playing fetch in the park!",
        photos: ["https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Friendly", "Energetic", "Loyal"],
        matingPreference: true,
        distanceRadius: 15,
        latitude: "12.9716",
        longitude: "77.5946",
        isActive: true,
      },
      {
        ownerId: allUsers[1]?.id || "49d1f26e-8321-4e39-b57b-755141428f80",
        name: "Simba",
        breed: "German Shepherd",
        age: 4,
        gender: "Male",
        size: "Large",
        bio: "Intelligent and protective German Shepherd. Great with families and loves outdoor adventures.",
        photos: ["https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Intelligent", "Protective", "Loyal"],
        matingPreference: false,
        distanceRadius: 20,
        latitude: "12.9698",
        longitude: "77.6205",
        isActive: true,
      },
      {
        ownerId: allUsers[2]?.id || "67ec3062-615d-4524-8cd2-3a2c5c75cd8d",
        name: "Daisy",
        breed: "Labrador Retriever",
        age: 2,
        gender: "Female", 
        size: "Large",
        bio: "Sweet and playful Labrador who loves swimming and meeting new friends. Very social!",
        photos: ["https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Sweet", "Playful", "Social"],
        matingPreference: true,
        distanceRadius: 12,
        latitude: "12.9352",
        longitude: "77.6245",
        isActive: true,
      },
      {
        ownerId: allUsers[3]?.id || allUsers[0]?.id || "ca89630f-2619-4b49-b935-6fb087951b69",
        name: "Rocky",
        breed: "Rottweiler",
        age: 5,
        gender: "Male",
        size: "Large",
        bio: "Strong and gentle giant. Well-trained and loves being around people. Great guard dog!",
        photos: ["https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Strong", "Gentle", "Protective"],
        matingPreference: false,
        distanceRadius: 18,
        latitude: "12.9719",
        longitude: "77.6412",
        isActive: true,
      },
      {
        ownerId: allUsers[4]?.id || allUsers[1]?.id || "0017b234-497b-4164-8793-09d1228c6e4c",
        name: "Coco",
        breed: "Poodle",
        age: 1,
        gender: "Female",
        size: "Medium",
        bio: "Adorable Poodle puppy full of energy and curiosity. Loves learning new tricks!",
        photos: ["https://images.unsplash.com/photo-1616190280147-d6b5ac788b10?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Energetic", "Curious", "Smart"],
        matingPreference: false,
        distanceRadius: 8,
        latitude: "12.9698",
        longitude: "77.7500",
        isActive: true,
      },
      {
        ownerId: allUsers[5]?.id || allUsers[2]?.id || "5dc4a903-abda-48db-8c34-0a03ea12948a",
        name: "Bruno",
        breed: "Boxer",
        age: 3,
        gender: "Male",
        size: "Large",
        bio: "Playful Boxer with lots of personality. Loves running and playing with other dogs.",
        photos: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Playful", "Energetic", "Outgoing"],
        matingPreference: true,
        distanceRadius: 22,
        latitude: "12.9500",
        longitude: "77.6000",
        isActive: true,
      }
    ];

    const insertedDogs = await db.insert(dogs).values(bangaloreDogs).returning();
    console.log(`Inserted ${insertedDogs.length} dogs in Bangalore area`);

    // Add medical profiles for the new dogs
    const medicalProfilesData = insertedDogs.map((dog, index) => ({
      dogId: dog.id,
      vaccinations: [
        { date: "2024-05-01", type: "Rabies", nextDue: "2025-05-01" },
        { date: "2024-05-01", type: "DHPP", nextDue: "2025-05-01" }
      ],
      medications: index % 2 === 0 ? [] : [{ name: "Flea Prevention", dosage: "1 tablet", frequency: "Monthly" }],
      allergies: index % 3 === 0 ? ["Chicken"] : [],
      conditions: [],
      lastVetVisit: new Date("2024-05-01"),
      isSpayedNeutered: index % 2 === 0,
      vetClearance: true,
      vetClearanceDate: new Date("2024-05-01"),
    }));

    const insertedProfiles = await db.insert(medicalProfiles).values(medicalProfilesData).returning();
    console.log(`Inserted ${insertedProfiles.length} medical profiles for new dogs`);

    console.log("Bangalore dogs added successfully!");

  } catch (error) {
    console.error("Error adding Bangalore dogs:", error);
    throw error;
  }
}

// Run the function
addBangaloreDogs().catch(console.error);