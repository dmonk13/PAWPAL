import { db } from "./db";
import { veterinarians, appointments } from "@shared/schema";

async function addVetData() {
  console.log("Adding more veterinarian data...");

  try {
    // Add veterinarians in Bangalore/India location (around 12.96, 77.66)
    const newVeterinarians = [
      {
        name: "Dr. Rajesh Gupta",
        title: "BVSc & AH, MVSc",
        clinicName: "Pet Care Plus Clinic",
        profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        bio: "Experienced veterinarian with over 12 years in small animal practice. Specializes in surgery and emergency care. Fluent in English, Hindi, and Kannada.",
        yearsExperience: 12,
        education: [
          { degree: "Bachelor of Veterinary Science & Animal Husbandry", institution: "Veterinary College Bangalore", year: 2011 },
          { degree: "Master of Veterinary Science", institution: "KVAFSU", year: 2013 }
        ],
        certifications: [
          { name: "Small Animal Surgery Certification", issuingBody: "Indian Veterinary Association", year: 2014 },
          { name: "Pet Nutrition Specialist", issuingBody: "IAVN", year: 2018 }
        ],
        specialties: ["General Practice", "Surgery", "Emergency Care", "Pet Nutrition"],
        services: ["Health Checkups", "Vaccinations", "Surgery", "Emergency Care", "Pet Grooming", "Dental Care"],
        languages: ["English", "Hindi", "Kannada"],
        rating: "4.6",
        reviewCount: 89,
        phoneNumber: "+91 80 2345 6789",
        email: "dr.rajesh@petcareplus.in",
        website: "https://petcareplus.in",
        address: "123 MG Road, Bangalore, Karnataka 560001",
        latitude: "12.9716",
        longitude: "77.5946",
        workingHours: {
          "Monday": { "open": "09:00", "close": "18:00" },
          "Tuesday": { "open": "09:00", "close": "18:00" },
          "Wednesday": { "open": "09:00", "close": "18:00" },
          "Thursday": { "open": "09:00", "close": "18:00" },
          "Friday": { "open": "09:00", "close": "18:00" },
          "Saturday": { "open": "09:00", "close": "15:00" },
          "Sunday": { "closed": true, "open": "00:00", "close": "00:00" }
        },
        emergencyServices: true,
        onlineBooking: true,
        bookingUrl: "https://petcareplus.in/book",
        consultationFee: "500.00",
        acceptsInsurance: false,
        acceptedInsurances: [],
        isActive: true,
      },
      {
        name: "Dr. Priya Sharma",
        title: "DVM, PhD",
        clinicName: "Happy Tails Veterinary Hospital",
        profilePhoto: "https://images.unsplash.com/photo-1594824388191-7802ad14b544?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        bio: "PhD in Veterinary Medicine with expertise in dermatology and behavioral issues. Passionate about holistic pet care and preventive medicine.",
        yearsExperience: 9,
        education: [
          { degree: "Doctor of Veterinary Medicine", institution: "Madras Veterinary College", year: 2014 },
          { degree: "PhD in Veterinary Medicine", institution: "TANUVAS", year: 2017 }
        ],
        certifications: [
          { name: "Veterinary Dermatology Specialist", issuingBody: "WSAVA", year: 2018 },
          { name: "Animal Behavior Certification", issuingBody: "International Association of Animal Behavior Consultants", year: 2019 }
        ],
        specialties: ["Dermatology", "Behavioral Medicine", "Internal Medicine", "Preventive Care"],
        services: ["Skin Treatment", "Behavioral Consultation", "Wellness Exams", "Vaccinations", "Diagnostic Services"],
        languages: ["English", "Hindi", "Tamil"],
        rating: "4.8",
        reviewCount: 127,
        phoneNumber: "+91 80 3456 7890",
        email: "dr.priya@happytails.in",
        website: "https://happytails.in",
        address: "456 Brigade Road, Bangalore, Karnataka 560025",
        latitude: "12.9698",
        longitude: "77.6205",
        workingHours: {
          "Monday": { "open": "08:00", "close": "19:00" },
          "Tuesday": { "open": "08:00", "close": "19:00" },
          "Wednesday": { "open": "08:00", "close": "19:00" },
          "Thursday": { "open": "08:00", "close": "19:00" },
          "Friday": { "open": "08:00", "close": "19:00" },
          "Saturday": { "open": "09:00", "close": "17:00" },
          "Sunday": { "open": "10:00", "close": "14:00" }
        },
        emergencyServices: false,
        onlineBooking: true,
        bookingUrl: "https://happytails.in/appointment",
        consultationFee: "600.00",
        acceptsInsurance: true,
        acceptedInsurances: ["New India Pet Insurance", "Oriental Pet Care"],
        isActive: true,
      },
      {
        name: "Dr. Arun Kumar",
        title: "BVSc & AH",
        clinicName: "City Veterinary Center",
        profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        bio: "Dedicated veterinarian serving Bangalore for over 15 years. Expert in orthopedic surgery and rehabilitation. Known for compassionate care.",
        yearsExperience: 15,
        education: [
          { degree: "Bachelor of Veterinary Science & Animal Husbandry", institution: "University of Agricultural Sciences, Bangalore", year: 2008 }
        ],
        certifications: [
          { name: "Orthopedic Surgery Certification", issuingBody: "Indian Veterinary Association", year: 2010 },
          { name: "Pet Rehabilitation Specialist", issuingBody: "IVRPT", year: 2015 }
        ],
        specialties: ["Orthopedic Surgery", "Physical Therapy", "Sports Medicine", "Emergency Care"],
        services: ["Orthopedic Surgery", "Physical Rehabilitation", "X-ray Services", "Ultrasound", "Emergency Treatment"],
        languages: ["English", "Hindi", "Kannada", "Telugu"],
        rating: "4.9",
        reviewCount: 203,
        phoneNumber: "+91 80 4567 8901",
        email: "dr.arun@cityvet.in",
        website: "https://cityvet.in",
        address: "789 Koramangala, Bangalore, Karnataka 560034",
        latitude: "12.9352",
        longitude: "77.6245",
        workingHours: {
          "Monday": { "open": "07:00", "close": "20:00" },
          "Tuesday": { "open": "07:00", "close": "20:00" },
          "Wednesday": { "open": "07:00", "close": "20:00" },
          "Thursday": { "open": "07:00", "close": "20:00" },
          "Friday": { "open": "07:00", "close": "20:00" },
          "Saturday": { "open": "08:00", "close": "18:00" },
          "Sunday": { "open": "09:00", "close": "16:00" }
        },
        emergencyServices: true,
        onlineBooking: false,
        consultationFee: "450.00",
        acceptsInsurance: true,
        acceptedInsurances: ["New India Pet Insurance", "Star Health Pet Insurance"],
        isActive: true,
      },
      {
        name: "Dr. Meera Nair",
        title: "DVM, MVSc",
        clinicName: "Paws & Claws Animal Hospital",
        profilePhoto: "https://images.unsplash.com/photo-1594824388191-7802ad14b544?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        bio: "Specialist in exotic pet care and small animal medicine. Known for gentle handling and advanced diagnostic capabilities.",
        yearsExperience: 7,
        education: [
          { degree: "Doctor of Veterinary Medicine", institution: "Kerala Veterinary College", year: 2016 },
          { degree: "Master of Veterinary Science", institution: "KVASU", year: 2018 }
        ],
        certifications: [
          { name: "Exotic Pet Medicine Certification", issuingBody: "AEMV", year: 2019 },
          { name: "Advanced Diagnostics Certification", issuingBody: "WSAVA", year: 2020 }
        ],
        specialties: ["Exotic Pet Care", "Diagnostic Medicine", "Cardiology", "Ophthalmology"],
        services: ["Exotic Pet Treatment", "Cardiac Evaluation", "Eye Examination", "Laboratory Services", "Imaging Services"],
        languages: ["English", "Hindi", "Malayalam", "Kannada"],
        rating: "4.7",
        reviewCount: 98,
        phoneNumber: "+91 80 5678 9012",
        email: "dr.meera@pawsandclaws.in",
        website: "https://pawsandclaws.in",
        address: "321 Indiranagar, Bangalore, Karnataka 560038",
        latitude: "12.9719",
        longitude: "77.6412",
        workingHours: {
          "Monday": { "open": "10:00", "close": "19:00" },
          "Tuesday": { "open": "10:00", "close": "19:00" },
          "Wednesday": { "open": "10:00", "close": "19:00" },
          "Thursday": { "open": "10:00", "close": "19:00" },
          "Friday": { "open": "10:00", "close": "19:00" },
          "Saturday": { "open": "10:00", "close": "16:00" },
          "Sunday": { "closed": true, "open": "00:00", "close": "00:00" }
        },
        emergencyServices: false,
        onlineBooking: true,
        bookingUrl: "https://pawsandclaws.in/schedule",
        consultationFee: "750.00",
        acceptsInsurance: false,
        acceptedInsurances: [],
        isActive: true,
      },
      {
        name: "Dr. Vikram Singh",
        title: "BVSc & AH, Dip. Emergency Medicine",
        clinicName: "24/7 Pet Emergency Center",
        profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        bio: "Emergency medicine specialist available 24/7. Expert in critical care and trauma management for pets. Quick response times.",
        yearsExperience: 11,
        education: [
          { degree: "Bachelor of Veterinary Science & Animal Husbandry", institution: "Punjab Agricultural University", year: 2012 },
          { degree: "Diploma in Emergency Medicine", institution: "AEMV", year: 2014 }
        ],
        certifications: [
          { name: "Emergency & Critical Care Specialist", issuingBody: "VECCS", year: 2015 },
          { name: "Advanced Life Support", issuingBody: "RECOVER Initiative", year: 2020 }
        ],
        specialties: ["Emergency Medicine", "Critical Care", "Trauma Surgery", "Intensive Care"],
        services: ["24/7 Emergency Care", "Critical Care", "Trauma Surgery", "ICU Services", "Ambulance Service"],
        languages: ["English", "Hindi", "Punjabi"],
        rating: "4.8",
        reviewCount: 156,
        phoneNumber: "+91 80 6789 0123",
        email: "dr.vikram@24petcare.in",
        website: "https://24petcare.in",
        address: "654 Whitefield, Bangalore, Karnataka 560066",
        latitude: "12.9698",
        longitude: "77.7500",
        workingHours: {
          "Monday": { "open": "00:00", "close": "23:59" },
          "Tuesday": { "open": "00:00", "close": "23:59" },
          "Wednesday": { "open": "00:00", "close": "23:59" },
          "Thursday": { "open": "00:00", "close": "23:59" },
          "Friday": { "open": "00:00", "close": "23:59" },
          "Saturday": { "open": "00:00", "close": "23:59" },
          "Sunday": { "open": "00:00", "close": "23:59" }
        },
        emergencyServices: true,
        onlineBooking: true,
        bookingUrl: "https://24petcare.in/emergency",
        consultationFee: "800.00",
        acceptsInsurance: true,
        acceptedInsurances: ["New India Pet Insurance", "Star Health Pet Insurance", "Oriental Pet Care"],
        isActive: true,
      }
    ];

    const insertedVets = await db.insert(veterinarians).values(newVeterinarians).returning();
    console.log(`Inserted ${insertedVets.length} veterinarians in Bangalore area`);

    console.log("Veterinarian data addition completed successfully!");

  } catch (error) {
    console.error("Error adding veterinarian data:", error);
    throw error;
  }
}

// Run the function
addVetData().catch(console.error);