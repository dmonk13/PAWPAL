import { db } from "./db";
import { users, dogs, medicalProfiles, swipes, matches, messages, veterinarians, appointments } from "@shared/schema";

async function seedData() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data
    await db.delete(appointments);
    await db.delete(messages);
    await db.delete(matches);
    await db.delete(swipes);
    await db.delete(medicalProfiles);
    await db.delete(veterinarians);
    await db.delete(dogs);
    await db.delete(users);

    // Insert users
    const usersList = [
      {
        username: "sarah_golden",
        email: "sarah@example.com",
        password: "password123",
        isPro: false,
      },
      {
        username: "mike_corgi",
        email: "mike@example.com",
        password: "password123",
        isPro: false,
      },
      {
        username: "alex_husky",
        email: "alex@example.com",
        password: "password123",
        isPro: false,
      },
      {
        username: "emma_beagle",
        email: "emma@example.com",
        password: "password123",
        isPro: false,
      },
      {
        username: "carlos_poodle",
        email: "carlos@example.com",
        password: "password123",
        isPro: false,
      },
      {
        username: "lisa_lab",
        email: "lisa@example.com",
        password: "password123",
        isPro: false,
      }
    ];

    const insertedUsers = await db.insert(users).values(usersList).returning();
    console.log(`Inserted ${insertedUsers.length} users`);

    // Insert dogs using the returned user IDs
    const dogsList = [
      {
        ownerId: insertedUsers[0].id,
        name: "Buddy",
        breed: "Golden Retriever",
        age: 3,
        gender: "Male",
        size: "Large",
        bio: "Loves playing fetch and swimming. Great with kids and other dogs!",
        photos: [
          "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
          "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
        ],
        temperament: ["Playful", "Energetic", "Friendly"],
        matingPreference: false,
        distanceRadius: 15,
        latitude: "40.7128",
        longitude: "-74.0060",
        isActive: true,
      },
      {
        ownerId: insertedUsers[1].id,
        name: "Luna",
        breed: "Corgi",
        age: 2,
        gender: "Female",
        size: "Medium",
        bio: "Energetic and playful! Loves short walks and belly rubs.",
        photos: [
          "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
          "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
        ],
        temperament: ["Energetic", "Playful", "Curious"],
        matingPreference: true,
        distanceRadius: 10,
        latitude: "40.7589",
        longitude: "-73.9851",
        isActive: true,
      },
      {
        ownerId: insertedUsers[2].id,
        name: "Zeus",
        breed: "Siberian Husky",
        age: 5,
        gender: "Male",
        size: "Large",
        bio: "Athletic and adventurous! Perfect hiking companion who loves cold weather.",
        photos: [
          "https://images.unsplash.com/photo-1615751072497-5f5169febe17?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
          "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
        ],
        temperament: ["Athletic", "Independent", "Alert"],
        matingPreference: false,
        distanceRadius: 25,
        latitude: "40.7505",
        longitude: "-73.9934",
        isActive: true,
      },
      {
        ownerId: insertedUsers[3].id,
        name: "Bella",
        breed: "Beagle",
        age: 1,
        gender: "Female",
        size: "Medium",
        bio: "Sweet puppy who loves treats and sniffing everything! Still learning commands.",
        photos: [
          "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
          "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
        ],
        temperament: ["Curious", "Gentle", "Food-motivated"],
        matingPreference: false,
        distanceRadius: 8,
        latitude: "40.7614",
        longitude: "-73.9776",
        isActive: true,
      },
      {
        ownerId: insertedUsers[4].id,
        name: "Charlie",
        breed: "Poodle",
        age: 6,
        gender: "Male",
        size: "Medium",
        bio: "Well-trained and loves meeting new friends. Great with children and other pets.",
        photos: [
          "https://images.unsplash.com/photo-1616190280147-d6b5ac788b10?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
          "https://images.unsplash.com/photo-1594149831265-35c4c48ed8bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
        ],
        temperament: ["Intelligent", "Social", "Obedient"],
        matingPreference: true,
        distanceRadius: 12,
        latitude: "40.7282",
        longitude: "-74.0060",
        isActive: true,
      },
      {
        ownerId: insertedUsers[5].id,
        name: "Ruby",
        breed: "Labrador Retriever",
        age: 4,
        gender: "Female",
        size: "Large",
        bio: "Loves water activities and playing with tennis balls. Very loyal and friendly.",
        photos: [
          "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
          "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
        ],
        temperament: ["Loyal", "Playful", "Water-loving"],
        matingPreference: true,
        distanceRadius: 18,
        latitude: "40.7543",
        longitude: "-73.9836",
        isActive: true,
      },
      {
        ownerId: insertedUsers[0].id,
        name: "Max",
        breed: "Border Collie",
        age: 3,
        gender: "Male",
        size: "Large",
        bio: "Highly intelligent and loves to learn new tricks. Perfect for active families!",
        photos: ["https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Intelligent", "Active", "Focused"],
        matingPreference: false,
        distanceRadius: 20,
        latitude: "40.7282",
        longitude: "-74.0776",
        isActive: true,
      },
      {
        ownerId: insertedUsers[1].id,
        name: "Milo",
        breed: "French Bulldog",
        age: 2,
        gender: "Male",
        size: "Small",
        bio: "Calm and cuddly companion. Loves lounging and short walks in the park.",
        photos: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Calm", "Affectionate", "Easy-going"],
        matingPreference: true,
        distanceRadius: 5,
        latitude: "40.7489",
        longitude: "-73.9680",
        isActive: true,
      }
    ];

    const insertedDogs = await db.insert(dogs).values(dogsList).returning();
    console.log(`Inserted ${insertedDogs.length} dogs`);

    // Insert medical profiles
    const medicalProfilesList = [
      {
        dogId: insertedDogs[0].id,
        vaccinations: [
          { type: "Rabies", date: "2024-03-15", nextDue: "2025-03-15" },
          { type: "DHPP", date: "2024-03-15", nextDue: "2025-03-15" },
          { type: "Bordetella", date: "2024-01-10", nextDue: "2025-01-10" }
        ],
        medications: [],
        allergies: [],
        conditions: [],
        lastVetVisit: new Date("2024-02-15"),
        isSpayedNeutered: true,
        vetClearance: true,
        vetClearanceDate: new Date("2024-02-15"),
      },
      {
        dogId: insertedDogs[1].id,
        vaccinations: [
          { type: "Rabies", date: "2024-03-01", nextDue: "2025-03-01" },
          { type: "DHPP", date: "2024-03-01", nextDue: "2025-03-01" }
        ],
        medications: [],
        allergies: ["Chicken", "Beef"],
        conditions: [],
        lastVetVisit: new Date("2024-03-01"),
        isSpayedNeutered: false,
        vetClearance: false,
      },
      {
        dogId: insertedDogs[2].id,
        vaccinations: [
          { type: "Rabies", date: "2024-02-20", nextDue: "2025-02-20" },
          { type: "DHPP", date: "2024-02-20", nextDue: "2025-02-20" },
          { type: "Bordetella", date: "2024-02-20", nextDue: "2025-02-20" }
        ],
        medications: [
          { name: "Joint Support", dosage: "1 tablet", frequency: "Daily" }
        ],
        allergies: [],
        conditions: ["Hip Dysplasia"],
        lastVetVisit: new Date("2024-02-20"),
        isSpayedNeutered: true,
        vetClearance: true,
        vetClearanceDate: new Date("2024-02-20"),
      },
      {
        dogId: insertedDogs[3].id,
        vaccinations: [
          { type: "Rabies", date: "2024-06-15", nextDue: "2025-06-15" },
          { type: "DHPP", date: "2024-06-15", nextDue: "2025-06-15" }
        ],
        medications: [],
        allergies: ["Dairy"],
        conditions: [],
        lastVetVisit: new Date("2024-06-15"),
        isSpayedNeutered: false,
        vetClearance: true,
        vetClearanceDate: new Date("2024-06-15"),
      }
    ];

    const insertedMedicalProfiles = await db.insert(medicalProfiles).values(medicalProfilesList).returning();
    console.log(`Inserted ${insertedMedicalProfiles.length} medical profiles`);

    // Insert veterinarians
    const veterinariansList = [
      {
        name: "Dr. Sarah Johnson",
        title: "DVM",
        clinicName: "Happy Paws Veterinary Clinic",
        profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        bio: "Dedicated veterinarian with over 10 years of experience in small animal care. Specializes in preventive medicine and surgical procedures.",
        yearsExperience: 10,
        education: [
          { degree: "Doctor of Veterinary Medicine", institution: "Cornell University", year: 2013 },
          { degree: "Bachelor of Science in Biology", institution: "University of Vermont", year: 2009 }
        ],
        certifications: [
          { name: "Board Certified Small Animal Surgery", issuingBody: "ACVS", year: 2015 },
          { name: "Fear-Free Certified Professional", issuingBody: "Fear Free Pets", year: 2020 }
        ],
        specialties: ["General Practice", "Surgery", "Emergency Care"],
        services: ["Wellness Exams", "Vaccinations", "Spay/Neuter", "Dental Care", "Emergency Surgery"],
        languages: ["English", "Spanish"],
        rating: "4.8",
        reviewCount: 127,
        phoneNumber: "(555) 123-4567",
        email: "dr.johnson@happypaws.com",
        website: "https://happypawsvet.com",
        address: "123 Main Street, New York, NY 10001",
        latitude: "40.7505",
        longitude: "-73.9934",
        workingHours: {
          "Monday": { "open": "08:00", "close": "18:00" },
          "Tuesday": { "open": "08:00", "close": "18:00" },
          "Wednesday": { "open": "08:00", "close": "18:00" },
          "Thursday": { "open": "08:00", "close": "18:00" },
          "Friday": { "open": "08:00", "close": "18:00" },
          "Saturday": { "open": "09:00", "close": "15:00" },
          "Sunday": { "closed": true, "open": "00:00", "close": "00:00" }
        },
        emergencyServices: true,
        onlineBooking: true,
        bookingUrl: "https://happypawsvet.com/book",
        consultationFee: "85.00",
        acceptsInsurance: true,
        acceptedInsurances: ["Pets Best", "Healthy Paws", "Trupanion"],
        isActive: true,
      },
      {
        name: "Dr. Michael Chen",
        title: "DVM, DACVIM",
        clinicName: "Metropolitan Animal Hospital",
        profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        bio: "Board-certified internal medicine specialist with expertise in complex medical cases and advanced diagnostics.",
        yearsExperience: 15,
        education: [
          { degree: "Doctor of Veterinary Medicine", institution: "UC Davis", year: 2008 },
          { degree: "Residency in Internal Medicine", institution: "Animal Medical Center", year: 2012 }
        ],
        certifications: [
          { name: "Diplomate, American College of Veterinary Internal Medicine", issuingBody: "ACVIM", year: 2012 },
          { name: "Advanced Cardiac Life Support", issuingBody: "RECOVER Initiative", year: 2021 }
        ],
        specialties: ["Internal Medicine", "Cardiology", "Endocrinology", "Gastroenterology"],
        services: ["Internal Medicine Consultation", "Cardiac Evaluation", "Endoscopy", "Ultrasound", "Advanced Diagnostics"],
        languages: ["English", "Mandarin", "Cantonese"],
        rating: "4.9",
        reviewCount: 89,
        phoneNumber: "(555) 987-6543",
        email: "dr.chen@metroanimalhospital.com",
        website: "https://metroanimalhospital.com",
        address: "456 Broadway, New York, NY 10013",
        latitude: "40.7282",
        longitude: "-74.0060",
        workingHours: {
          "Monday": { "open": "07:00", "close": "19:00" },
          "Tuesday": { "open": "07:00", "close": "19:00" },
          "Wednesday": { "open": "07:00", "close": "19:00" },
          "Thursday": { "open": "07:00", "close": "19:00" },
          "Friday": { "open": "07:00", "close": "19:00" },
          "Saturday": { "open": "08:00", "close": "16:00" },
          "Sunday": { "open": "08:00", "close": "16:00" }
        },
        emergencyServices: false,
        onlineBooking: true,
        bookingUrl: "https://metroanimalhospital.com/schedule",
        consultationFee: "150.00",
        acceptsInsurance: true,
        acceptedInsurances: ["Pets Best", "ASPCA Pet Insurance", "Embrace"],
        isActive: true,
      },
      {
        name: "Dr. Emily Rodriguez",
        title: "DVM",
        clinicName: "Central Park Veterinary Center",
        profilePhoto: "https://images.unsplash.com/photo-1594824388191-7802ad14b544?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        bio: "Compassionate veterinarian focused on building strong relationships with pets and their families. Specializes in behavioral medicine and senior pet care.",
        yearsExperience: 8,
        education: [
          { degree: "Doctor of Veterinary Medicine", institution: "Tufts University", year: 2015 },
          { degree: "Certificate in Veterinary Behavior", institution: "UC Davis", year: 2017 }
        ],
        certifications: [
          { name: "Certified Veterinary Behaviorist", issuingBody: "ACVB", year: 2018 },
          { name: "Low Stress Handling Certification", issuingBody: "Dr. Sophia Yin", year: 2016 }
        ],
        specialties: ["Behavioral Medicine", "Senior Pet Care", "Preventive Medicine"],
        services: ["Behavioral Consultation", "Senior Wellness", "Nutritional Counseling", "Pain Management", "End-of-Life Care"],
        languages: ["English", "Spanish", "Portuguese"],
        rating: "4.7",
        reviewCount: 156,
        phoneNumber: "(555) 456-7890",
        email: "dr.rodriguez@cpvet.com",
        website: "https://centralparkvet.com",
        address: "789 Central Park West, New York, NY 10024",
        latitude: "40.7829",
        longitude: "-73.9654",
        workingHours: {
          "Monday": { "open": "09:00", "close": "17:00" },
          "Tuesday": { "open": "09:00", "close": "17:00" },
          "Wednesday": { "open": "09:00", "close": "17:00" },
          "Thursday": { "open": "09:00", "close": "17:00" },
          "Friday": { "open": "09:00", "close": "17:00" },
          "Saturday": { "open": "10:00", "close": "14:00" },
          "Sunday": { "closed": true, "open": "00:00", "close": "00:00" }
        },
        emergencyServices: false,
        onlineBooking: false,
        consultationFee: "95.00",
        acceptsInsurance: false,
        acceptedInsurances: [],
        isActive: true,
      }
    ];

    const insertedVeterinarians = await db.insert(veterinarians).values(veterinariansList).returning();
    console.log(`Inserted ${insertedVeterinarians.length} veterinarians`);

    // Insert some sample swipes and matches
    const swipesList = [
      {
        swiperDogId: insertedDogs[0].id,
        swipedDogId: insertedDogs[1].id,
        isLike: true,
      },
      {
        swiperDogId: insertedDogs[1].id,
        swipedDogId: insertedDogs[0].id,
        isLike: true,
      },
      {
        swiperDogId: insertedDogs[2].id,
        swipedDogId: insertedDogs[3].id,
        isLike: true,
      },
      {
        swiperDogId: insertedDogs[3].id,
        swipedDogId: insertedDogs[2].id,
        isLike: false,
      }
    ];

    const insertedSwipes = await db.insert(swipes).values(swipesList).returning();
    console.log(`Inserted ${insertedSwipes.length} swipes`);

    // Create matches where both dogs liked each other
    const matchesList = [
      {
        dog1Id: insertedDogs[0].id,
        dog2Id: insertedDogs[1].id,
      },
      {
        dog1Id: insertedDogs[0].id,
        dog2Id: insertedDogs[2].id,
      },
      {
        dog1Id: insertedDogs[1].id,
        dog2Id: insertedDogs[3].id,
      }
    ];

    const insertedMatches = await db.insert(matches).values(matchesList).returning();
    console.log(`Inserted ${insertedMatches.length} matches`);

    // Insert sample messages
    const messagesList = [
      {
        matchId: insertedMatches[0].id,
        senderId: insertedUsers[0].id,
        content: "Hi! Buddy would love to meet Luna for a playdate in Central Park!",
      },
      {
        matchId: insertedMatches[0].id,
        senderId: insertedUsers[1].id,
        content: "That sounds wonderful! Luna loves playing with other dogs. How about this Saturday morning?",
      },
      {
        matchId: insertedMatches[0].id,
        senderId: insertedUsers[0].id,
        content: "Perfect! Let's meet at the dog run around 10 AM. Buddy will be so excited!",
      },
      {
        matchId: insertedMatches[1].id,
        senderId: insertedUsers[0].id,
        content: "Hey! Zeus looks like an amazing hiking companion. Would you be interested in a group hike this weekend?",
      },
      {
        matchId: insertedMatches[1].id,
        senderId: insertedUsers[2].id,
        content: "Absolutely! Zeus loves hiking and would enjoy meeting Buddy. I know some great trails nearby.",
      },
      {
        matchId: insertedMatches[2].id,
        senderId: insertedUsers[1].id,
        content: "Bella is such a cute puppy! Luna would love to be her mentor. How is her training going?",
      },
      {
        matchId: insertedMatches[2].id,
        senderId: insertedUsers[3].id,
        content: "Thank you! Bella is doing well with basic commands. A playdate with Luna would be perfect for her socialization!",
      }
    ];

    const insertedMessages = await db.insert(messages).values(messagesList).returning();
    console.log(`Inserted ${insertedMessages.length} messages`);

    // Insert sample appointments
    const appointmentsList = [
      {
        userId: insertedUsers[0].id,
        dogId: insertedDogs[0].id,
        veterinarianId: insertedVeterinarians[0].id,
        appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        serviceType: "Annual Wellness Exam",
        status: "scheduled",
        notes: "Annual checkup and vaccination boosters",
        isExternal: false,
      },
      {
        userId: insertedUsers[1].id,
        dogId: insertedDogs[1].id,
        veterinarianId: insertedVeterinarians[1].id,
        appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        serviceType: "Allergy Consultation",
        status: "scheduled",
        notes: "Discuss food allergies and treatment options",
        isExternal: false,
      }
    ];

    const insertedAppointments = await db.insert(appointments).values(appointmentsList).returning();
    console.log(`Inserted ${insertedAppointments.length} appointments`);

    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seeding function
seedData().catch(console.error);