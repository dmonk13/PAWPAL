import { type User, type InsertUser, type Dog, type InsertDog, type MedicalProfile, type InsertMedicalProfile, type Swipe, type InsertSwipe, type Match, type InsertMatch, type Message, type InsertMessage, type Veterinarian, type InsertVeterinarian, type Appointment, type InsertAppointment, type DogWithMedical, type VeterinarianWithDistance } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Dog methods
  getDog(id: string): Promise<Dog | undefined>;
  getDogsByOwner(ownerId: string): Promise<Dog[]>;
  createDog(dog: InsertDog): Promise<Dog>;
  updateDog(id: string, updates: Partial<Dog>): Promise<Dog | undefined>;
  
  // Medical profile methods
  getMedicalProfile(dogId: string): Promise<MedicalProfile | undefined>;
  createMedicalProfile(profile: InsertMedicalProfile): Promise<MedicalProfile>;
  updateMedicalProfile(dogId: string, updates: Partial<MedicalProfile>): Promise<MedicalProfile | undefined>;

  // Matching methods
  getDogsForMatching(currentDogId: string, latitude: number, longitude: number, maxDistance: number, filters?: any): Promise<DogWithMedical[]>;
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  getSwipe(swiperDogId: string, swipedDogId: string): Promise<Swipe | undefined>;
  
  // Match methods
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByDog(dogId: string): Promise<Match[]>;
  
  // Message methods
  getMessagesByMatch(matchId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Veterinarian methods
  getVeterinariansNearby(latitude: number, longitude: number, maxDistance: number): Promise<VeterinarianWithDistance[]>;
  getVeterinarian(id: string): Promise<Veterinarian | undefined>;
  
  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByUser(userId: string): Promise<Appointment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dogs: Map<string, Dog>;
  private medicalProfiles: Map<string, MedicalProfile>;
  private swipes: Map<string, Swipe>;
  private matches: Map<string, Match>;
  private messages: Map<string, Message>;
  private veterinarians: Map<string, Veterinarian>;
  private appointments: Map<string, Appointment>;

  constructor() {
    this.users = new Map();
    this.dogs = new Map();
    this.medicalProfiles = new Map();
    this.swipes = new Map();
    this.matches = new Map();
    this.messages = new Map();
    this.veterinarians = new Map();
    this.appointments = new Map();
    
    // Seed with initial data
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const user1: User = {
      id: "user-1",
      username: "sarah_golden",
      email: "sarah@example.com",
      password: "password123",
      createdAt: new Date(),
    };
    
    const user2: User = {
      id: "user-2", 
      username: "mike_corgi",
      email: "mike@example.com",
      password: "password123",
      createdAt: new Date(),
    };

    const user3: User = {
      id: "user-3",
      username: "alex_husky",
      email: "alex@example.com", 
      password: "password123",
      createdAt: new Date(),
    };

    const user4: User = {
      id: "user-4",
      username: "emma_beagle",
      email: "emma@example.com",
      password: "password123", 
      createdAt: new Date(),
    };

    const user5: User = {
      id: "user-5",
      username: "carlos_poodle",
      email: "carlos@example.com",
      password: "password123",
      createdAt: new Date(),
    };

    const user6: User = {
      id: "user-6",
      username: "lisa_lab",
      email: "lisa@example.com",
      password: "password123",
      createdAt: new Date(),
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
    this.users.set(user4.id, user4);
    this.users.set(user5.id, user5);
    this.users.set(user6.id, user6);

    // Create sample dogs
    const dogs: Dog[] = [
      {
        id: "dog-1",
        ownerId: "user-1", 
        name: "Buddy",
        breed: "Golden Retriever",
        age: 3,
        gender: "Male",
        size: "Large",
        bio: "Loves playing fetch and swimming. Great with kids and other dogs!",
        photos: ["https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Playful", "Energetic", "Friendly"],
        matingPreference: false,
        distanceRadius: 15,
        latitude: "40.7128",
        longitude: "-74.0060",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-2",
        ownerId: "user-2",
        name: "Luna",
        breed: "Corgi",
        age: 2,
        gender: "Female", 
        size: "Medium",
        bio: "Energetic and playful! Loves short walks and belly rubs.",
        photos: ["https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Energetic", "Playful", "Curious"],
        matingPreference: true,
        distanceRadius: 10,
        latitude: "40.7589",
        longitude: "-73.9851",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-3",
        ownerId: "user-3",
        name: "Zeus",
        breed: "Siberian Husky",
        age: 5,
        gender: "Male",
        size: "Large",
        bio: "Athletic and adventurous! Perfect hiking companion who loves cold weather.",
        photos: ["https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Athletic", "Independent", "Alert"],
        matingPreference: false,
        distanceRadius: 25,
        latitude: "40.7505",
        longitude: "-73.9934",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-4", 
        ownerId: "user-4",
        name: "Bella",
        breed: "Beagle",
        age: 1,
        gender: "Female",
        size: "Medium",
        bio: "Sweet puppy who loves treats and sniffing everything! Still learning commands.",
        photos: ["https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Curious", "Gentle", "Food-motivated"],
        matingPreference: false,
        distanceRadius: 8,
        latitude: "40.7614",
        longitude: "-73.9776",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-5",
        ownerId: "user-5",
        name: "Charlie",
        breed: "Poodle",
        age: 6,
        gender: "Male",
        size: "Medium",
        bio: "Well-trained and loves meeting new friends. Great with children and other pets.",
        photos: ["https://images.unsplash.com/photo-1616190280147-d6b5ac788b10?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Intelligent", "Social", "Obedient"],
        matingPreference: true,
        distanceRadius: 12,
        latitude: "40.7282",
        longitude: "-74.0060",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-6",
        ownerId: "user-6",
        name: "Ruby",
        breed: "Labrador Retriever",
        age: 4,
        gender: "Female",
        size: "Large",
        bio: "Loves water activities and playing with tennis balls. Very loyal and friendly.",
        photos: ["https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Loyal", "Playful", "Water-loving"],
        matingPreference: true,
        distanceRadius: 18,
        latitude: "40.7543",
        longitude: "-73.9836",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-7",
        ownerId: "user-1",
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
        createdAt: new Date(),
      },
      {
        id: "dog-8",
        ownerId: "user-2",
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
        createdAt: new Date(),
      },
      {
        id: "dog-9",
        ownerId: "user-3",
        name: "Sadie",
        breed: "Australian Shepherd",
        age: 3,
        gender: "Female",
        size: "Large",
        bio: "Energetic herding dog who loves agility training and frisbee. Great with active families and enjoys learning new tricks!",
        photos: ["https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Energetic", "Intelligent", "Loyal", "Herding"],
        matingPreference: false,
        distanceRadius: 30,
        latitude: "40.7831",
        longitude: "-73.9664",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-10",
        ownerId: "user-4",
        name: "Oscar",
        breed: "Bulldog",
        age: 4,
        gender: "Male",
        size: "Medium",
        bio: "Gentle giant with a sweet personality. Loves air conditioning, treats, and meeting new friends at a relaxed pace.",
        photos: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Gentle", "Calm", "Friendly", "Laid-back"],
        matingPreference: true,
        distanceRadius: 8,
        latitude: "40.7420",
        longitude: "-73.9892",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-11",
        ownerId: "user-5",
        name: "Penny",
        breed: "Dachshund",
        age: 1,
        gender: "Female",
        size: "Small",
        bio: "Tiny but mighty! This little sausage dog loves burrowing under blankets and chasing squirrels in the park.",
        photos: ["https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Playful", "Curious", "Brave", "Snuggly"],
        matingPreference: false,
        distanceRadius: 6,
        latitude: "40.7358",
        longitude: "-73.9911",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-12",
        ownerId: "user-6",
        name: "Thor",
        breed: "German Shepherd",
        age: 5,
        gender: "Male",
        size: "Large",
        bio: "Loyal and protective companion. Well-trained, loves long hikes, and is great with children. Looking for a strong female partner.",
        photos: ["https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Loyal", "Protective", "Intelligent", "Active"],
        matingPreference: true,
        distanceRadius: 25,
        latitude: "40.7686",
        longitude: "-73.9918",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "dog-13",
        ownerId: "user-1",
        name: "Coco",
        breed: "Cocker Spaniel",
        age: 2,
        gender: "Female",
        size: "Medium",
        bio: "Sweet and gentle girl who loves water activities and swimming. Perfect companion for beach trips and outdoor adventures.",
        photos: ["https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"],
        temperament: ["Sweet", "Gentle", "Water-loving", "Social"],
        matingPreference: true,
        distanceRadius: 15,
        latitude: "40.7260",
        longitude: "-73.9897",
        isActive: true,
        createdAt: new Date(),
      }
    ];

    dogs.forEach(dog => this.dogs.set(dog.id, dog));

    // Create sample medical profiles
    const medicalProfiles: MedicalProfile[] = [
      {
        id: "med-1",
        dogId: "dog-1",
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
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-2", 
        dogId: "dog-2",
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
        vetClearanceDate: null,
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-3",
        dogId: "dog-3",
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
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-4",
        dogId: "dog-4",
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
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-5",
        dogId: "dog-5",
        vaccinations: [
          { type: "Rabies", date: "2024-01-20", nextDue: "2025-01-20" },
          { type: "DHPP", date: "2024-01-20", nextDue: "2025-01-20" },
          { type: "Bordetella", date: "2024-01-20", nextDue: "2025-01-20" }
        ],
        medications: [
          { name: "Allergy Relief", dosage: "0.5ml", frequency: "As needed" }
        ],
        allergies: ["Pollen", "Dust mites"],
        conditions: ["Seasonal Allergies"],
        lastVetVisit: new Date("2024-01-20"),
        isSpayedNeutered: true,
        vetClearance: true,
        vetClearanceDate: new Date("2024-01-20"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-6",
        dogId: "dog-6",
        vaccinations: [
          { type: "Rabies", date: "2024-04-10", nextDue: "2025-04-10" },
          { type: "DHPP", date: "2024-04-10", nextDue: "2025-04-10" },
          { type: "Lyme Disease", date: "2024-04-10", nextDue: "2025-04-10" }
        ],
        medications: [],
        allergies: [],
        conditions: [],
        lastVetVisit: new Date("2024-04-10"),
        isSpayedNeutered: true,
        vetClearance: true,
        vetClearanceDate: new Date("2024-04-10"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-7",
        dogId: "dog-7",
        vaccinations: [
          { type: "Rabies", date: "2024-05-05", nextDue: "2025-05-05" },
          { type: "DHPP", date: "2024-05-05", nextDue: "2025-05-05" },
          { type: "Bordetella", date: "2024-05-05", nextDue: "2025-05-05" }
        ],
        medications: [],
        allergies: [],
        conditions: [],
        lastVetVisit: new Date("2024-05-05"),
        isSpayedNeutered: true,
        vetClearance: true,
        vetClearanceDate: new Date("2024-05-05"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-8",
        dogId: "dog-8",
        vaccinations: [
          { type: "Rabies", date: "2024-07-01", nextDue: "2025-07-01" },
          { type: "DHPP", date: "2024-07-01", nextDue: "2025-07-01" }
        ],
        medications: [
          { name: "Eye Drops", dosage: "2 drops", frequency: "Twice daily" }
        ],
        allergies: ["Grass"],
        conditions: ["Dry Eyes"],
        lastVetVisit: new Date("2024-07-01"),
        isSpayedNeutered: false,
        vetClearance: true,
        vetClearanceDate: new Date("2024-07-01"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-9",
        dogId: "dog-9",
        vaccinations: [
          { type: "Rabies", date: "2024-04-20", nextDue: "2025-04-20" },
          { type: "DHPP", date: "2024-04-20", nextDue: "2025-04-20" },
          { type: "Bordetella", date: "2024-04-20", nextDue: "2025-04-20" },
          { type: "Lyme Disease", date: "2024-04-20", nextDue: "2025-04-20" }
        ],
        medications: [
          { name: "Joint Supplement", dosage: "1 chew", frequency: "Daily" }
        ],
        allergies: [],
        conditions: [],
        lastVetVisit: new Date("2024-04-20"),
        isSpayedNeutered: true,
        vetClearance: true,
        vetClearanceDate: new Date("2024-04-20"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-10",
        dogId: "dog-10",
        vaccinations: [
          { type: "Rabies", date: "2024-06-10", nextDue: "2025-06-10" },
          { type: "DHPP", date: "2024-06-10", nextDue: "2025-06-10" }
        ],
        medications: [
          { name: "Breathing Support", dosage: "0.25ml", frequency: "As needed" }
        ],
        allergies: ["Heat sensitivity"],
        conditions: ["Brachycephalic Syndrome"],
        lastVetVisit: new Date("2024-06-10"),
        isSpayedNeutered: true,
        vetClearance: true,
        vetClearanceDate: new Date("2024-06-10"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-11",
        dogId: "dog-11",
        vaccinations: [
          { type: "Rabies", date: "2024-08-15", nextDue: "2025-08-15" },
          { type: "DHPP", date: "2024-08-15", nextDue: "2025-08-15" },
          { type: "Bordetella", date: "2024-08-15", nextDue: "2025-08-15" }
        ],
        medications: [],
        allergies: ["Corn"],
        conditions: [],
        lastVetVisit: new Date("2024-08-15"),
        isSpayedNeutered: false,
        vetClearance: true,
        vetClearanceDate: new Date("2024-08-15"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-12",
        dogId: "dog-12",
        vaccinations: [
          { type: "Rabies", date: "2024-03-25", nextDue: "2025-03-25" },
          { type: "DHPP", date: "2024-03-25", nextDue: "2025-03-25" },
          { type: "Bordetella", date: "2024-03-25", nextDue: "2025-03-25" },
          { type: "Lyme Disease", date: "2024-03-25", nextDue: "2025-03-25" }
        ],
        medications: [
          { name: "Hip Support", dosage: "2 tablets", frequency: "Daily" }
        ],
        allergies: [],
        conditions: ["Mild Hip Dysplasia"],
        lastVetVisit: new Date("2024-03-25"),
        isSpayedNeutered: true,
        vetClearance: true,
        vetClearanceDate: new Date("2024-03-25"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      },
      {
        id: "med-13",
        dogId: "dog-13",
        vaccinations: [
          { type: "Rabies", date: "2024-05-30", nextDue: "2025-05-30" },
          { type: "DHPP", date: "2024-05-30", nextDue: "2025-05-30" },
          { type: "Bordetella", date: "2024-05-30", nextDue: "2025-05-30" }
        ],
        medications: [
          { name: "Ear Cleaning Solution", dosage: "Weekly", frequency: "As needed" }
        ],
        allergies: ["Wheat"],
        conditions: ["Prone to ear infections"],
        lastVetVisit: new Date("2024-05-30"),
        isSpayedNeutered: false,
        vetClearance: true,
        vetClearanceDate: new Date("2024-05-30"),
        vetDocumentUrl: null,
        createdAt: new Date(),
      }
    ];

    medicalProfiles.forEach(profile => this.medicalProfiles.set(profile.dogId, profile));

    // Create sample veterinarians
    const vet1: Veterinarian = {
      id: "vet-1",
      name: "Dr. Sarah Johnson",
      clinicName: "Paws & Claws Veterinary Clinic",
      specialties: ["General Practice", "Surgery", "Emergency Care"],
      services: ["Vaccinations", "Health Checkups", "Surgery", "Dental Care", "Emergency Services"],
      rating: "4.8",
      reviewCount: 156,
      phoneNumber: "(555) 123-4567",
      email: "sarah@pawsandclaws.com",
      website: "https://pawsandclaws.com",
      address: "123 Main Street, New York, NY 10001",
      latitude: "40.7589",
      longitude: "-73.9851",
      workingHours: {
        Monday: { open: "8:00", close: "18:00" },
        Tuesday: { open: "8:00", close: "18:00" },
        Wednesday: { open: "8:00", close: "18:00" },
        Thursday: { open: "8:00", close: "18:00" },
        Friday: { open: "8:00", close: "18:00" },
        Saturday: { open: "9:00", close: "15:00" },
        Sunday: { open: "", close: "", closed: true }
      },
      emergencyServices: true,
      onlineBooking: true,
      bookingUrl: "https://pawsandclaws.com/book",
      isActive: true,
      createdAt: new Date(),
    };

    const vet2: Veterinarian = {
      id: "vet-2",
      name: "Dr. Michael Chen",
      clinicName: "City Animal Hospital",
      specialties: ["Internal Medicine", "Cardiology", "Oncology"],
      services: ["Specialized Care", "Diagnostics", "Lab Tests", "X-rays", "Ultrasound"],
      rating: "4.9",
      reviewCount: 203,
      phoneNumber: "(555) 987-6543",
      email: "mchen@cityanimalhospital.com",
      website: "https://cityanimalhospital.com",
      address: "456 Oak Avenue, New York, NY 10002",
      latitude: "40.7505",
      longitude: "-73.9934",
      workingHours: {
        Monday: { open: "7:00", close: "19:00" },
        Tuesday: { open: "7:00", close: "19:00" },
        Wednesday: { open: "7:00", close: "19:00" },
        Thursday: { open: "7:00", close: "19:00" },
        Friday: { open: "7:00", close: "19:00" },
        Saturday: { open: "8:00", close: "16:00" },
        Sunday: { open: "10:00", close: "14:00" }
      },
      emergencyServices: true,
      onlineBooking: false,
      bookingUrl: null,
      isActive: true,
      createdAt: new Date(),
    };

    const vet3: Veterinarian = {
      id: "vet-3",
      name: "Dr. Emily Rodriguez",
      clinicName: "Happy Tails Veterinary Care",
      specialties: ["Preventive Care", "Behavioral Medicine", "Nutrition"],
      services: ["Wellness Exams", "Behavioral Consultation", "Nutrition Planning", "Grooming"],
      rating: "4.7",
      reviewCount: 89,
      phoneNumber: "(555) 456-7890",
      email: "emily@happytailsvet.com",
      website: "https://happytailsvet.com",
      address: "789 Park Boulevard, New York, NY 10003",
      latitude: "40.7614",
      longitude: "-73.9776",
      workingHours: {
        Monday: { open: "9:00", close: "17:00" },
        Tuesday: { open: "9:00", close: "17:00" },
        Wednesday: { open: "9:00", close: "17:00" },
        Thursday: { open: "9:00", close: "17:00" },
        Friday: { open: "9:00", close: "17:00" },
        Saturday: { open: "", close: "", closed: true },
        Sunday: { open: "", close: "", closed: true }
      },
      emergencyServices: false,
      onlineBooking: true,
      bookingUrl: "https://happytailsvet.com/schedule",
      isActive: true,
      createdAt: new Date(),
    };

    this.veterinarians.set(vet1.id, vet1);
    this.veterinarians.set(vet2.id, vet2);
    this.veterinarians.set(vet3.id, vet3);

    // Create sample swipes to show swiping interactions
    const swipes: Swipe[] = [
      {
        id: "swipe-1",
        swiperDogId: "dog-1",
        swipedDogId: "dog-2",
        isLike: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: "swipe-2",
        swiperDogId: "dog-2",
        swipedDogId: "dog-1",
        isLike: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: "swipe-3",
        swiperDogId: "dog-3",
        swipedDogId: "dog-6",
        isLike: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        id: "swipe-4",
        swiperDogId: "dog-6",
        swipedDogId: "dog-3",
        isLike: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: "swipe-5",
        swiperDogId: "dog-1",
        swipedDogId: "dog-4",
        isLike: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: "swipe-6",
        swiperDogId: "dog-5",
        swipedDogId: "dog-8",
        isLike: true,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      }
    ];

    swipes.forEach(swipe => this.swipes.set(swipe.id, swipe));

    // Create sample matches (based on mutual likes)
    const matches: Match[] = [
      {
        id: "match-1",
        dog1Id: "dog-1",
        dog2Id: "dog-2",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: "match-2",
        dog1Id: "dog-3",
        dog2Id: "dog-6",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      }
    ];

    matches.forEach(match => this.matches.set(match.id, match));

    // Create sample messages between matched dogs
    const messages: Message[] = [
      {
        id: "msg-1",
        matchId: "match-1",
        senderId: "user-1",
        content: "Hi! Buddy would love to meet Luna for a playdate in Central Park!",
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
      },
      {
        id: "msg-2",
        matchId: "match-1",
        senderId: "user-2",
        content: "That sounds great! Luna loves the dog run there. How about Saturday morning?",
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      },
      {
        id: "msg-3",
        matchId: "match-1",
        senderId: "user-1",
        content: "Perfect! Let's meet at the 72nd Street entrance at 10am?",
        createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000), // 17 hours ago
      },
      {
        id: "msg-4",
        matchId: "match-1",
        senderId: "user-2",
        content: "See you there! 🐕",
        createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
      },
      {
        id: "msg-5",
        matchId: "match-2",
        senderId: "user-3",
        content: "Zeus would love to go on a hike with Ruby! He's very active.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: "msg-6",
        matchId: "match-2",
        senderId: "user-6",
        content: "That's perfect! Ruby loves hiking trails. Do you know Prospect Park well?",
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      }
    ];

    messages.forEach(message => this.messages.set(message.id, message));

    // Create sample appointments
    const appointments: Appointment[] = [
      {
        id: "apt-1",
        userId: "user-1",
        dogId: "dog-1",
        veterinarianId: "vet-1",
        appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        serviceType: "Annual Checkup",
        status: "scheduled",
        notes: "Routine wellness exam and vaccinations",
        isExternal: false,
        externalBookingId: null,
        createdAt: new Date(),
      },
      {
        id: "apt-2",
        userId: "user-2",
        dogId: "dog-2",
        veterinarianId: "vet-2",
        appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        serviceType: "Spay Surgery Consultation",
        status: "scheduled",
        notes: "Pre-surgery consultation for spaying",
        isExternal: false,
        externalBookingId: null,
        createdAt: new Date(),
      },
      {
        id: "apt-3",
        userId: "user-3",
        dogId: "dog-3",
        veterinarianId: "vet-2",
        appointmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        serviceType: "Joint X-rays",
        status: "scheduled",
        notes: "Follow-up x-rays for hip dysplasia monitoring",
        isExternal: false,
        externalBookingId: null,
        createdAt: new Date(),
      },
      {
        id: "apt-4",
        userId: "user-4",
        dogId: "dog-4",
        veterinarianId: "vet-3",
        appointmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        serviceType: "Puppy Training Consultation",
        status: "completed",
        notes: "Behavioral training guidance for young puppy",
        isExternal: false,
        externalBookingId: null,
        createdAt: new Date(),
      },
      {
        id: "apt-5",
        userId: "user-5",
        dogId: "dog-5",
        veterinarianId: "vet-1",
        appointmentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        serviceType: "Allergy Testing",
        status: "scheduled",
        notes: "Comprehensive allergy panel for seasonal allergies",
        isExternal: true,
        externalBookingId: "EXT-12345",
        createdAt: new Date(),
      }
    ];

    appointments.forEach(appointment => this.appointments.set(appointment.id, appointment));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getDog(id: string): Promise<Dog | undefined> {
    return this.dogs.get(id);
  }

  async getDogsByOwner(ownerId: string): Promise<Dog[]> {
    return Array.from(this.dogs.values()).filter(dog => dog.ownerId === ownerId);
  }

  async createDog(insertDog: InsertDog): Promise<Dog> {
    const id = randomUUID();
    const dog: Dog = { ...insertDog, id, createdAt: new Date() };
    this.dogs.set(id, dog);
    return dog;
  }

  async updateDog(id: string, updates: Partial<Dog>): Promise<Dog | undefined> {
    const dog = this.dogs.get(id);
    if (!dog) return undefined;
    
    const updatedDog = { ...dog, ...updates };
    this.dogs.set(id, updatedDog);
    return updatedDog;
  }

  async getMedicalProfile(dogId: string): Promise<MedicalProfile | undefined> {
    return this.medicalProfiles.get(dogId);
  }

  async createMedicalProfile(insertProfile: InsertMedicalProfile): Promise<MedicalProfile> {
    const id = randomUUID();
    const profile: MedicalProfile = { ...insertProfile, id, createdAt: new Date() };
    this.medicalProfiles.set(insertProfile.dogId, profile);
    return profile;
  }

  async updateMedicalProfile(dogId: string, updates: Partial<MedicalProfile>): Promise<MedicalProfile | undefined> {
    const profile = this.medicalProfiles.get(dogId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.medicalProfiles.set(dogId, updatedProfile);
    return updatedProfile;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async getDogsForMatching(currentDogId: string, latitude: number, longitude: number, maxDistance: number, filters?: any): Promise<DogWithMedical[]> {
    const currentDog = this.dogs.get(currentDogId);
    if (!currentDog) return [];

    // Get dogs that haven't been swiped on yet
    const swipedDogIds = Array.from(this.swipes.values())
      .filter(swipe => swipe.swiperDogId === currentDogId)
      .map(swipe => swipe.swipedDogId);

    const availableDogs = Array.from(this.dogs.values())
      .filter(dog => 
        dog.id !== currentDogId && 
        !swipedDogIds.includes(dog.id) &&
        dog.isActive &&
        dog.latitude && 
        dog.longitude
      );

    const dogsWithDistance = availableDogs.map(dog => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        parseFloat(dog.latitude!),
        parseFloat(dog.longitude!)
      );
      
      const medicalProfile = this.medicalProfiles.get(dog.id);
      
      return {
        ...dog,
        medicalProfile,
        distance: Math.round(distance * 10) / 10
      };
    }).filter(dog => dog.distance! <= maxDistance);

    // Apply filters if provided
    if (filters) {
      return dogsWithDistance.filter(dog => {
        if (filters.ageRange && !this.matchesAgeRange(dog.age, filters.ageRange)) return false;
        if (filters.size && dog.size !== filters.size) return false;
        if (filters.vaccinated && !this.isVaccinated(dog.medicalProfile)) return false;
        if (filters.spayedNeutered && !dog.medicalProfile?.isSpayedNeutered) return false;
        if (filters.noAllergies && dog.medicalProfile?.allergies?.length) return false;
        return true;
      });
    }

    return dogsWithDistance;
  }

  private matchesAgeRange(age: number, ageRange: string): boolean {
    switch (ageRange) {
      case "Puppy (0-1 year)": return age <= 1;
      case "Young (1-3 years)": return age >= 1 && age <= 3;
      case "Adult (3-7 years)": return age >= 3 && age <= 7;
      case "Senior (7+ years)": return age >= 7;
      default: return true;
    }
  }

  private isVaccinated(medical?: MedicalProfile): boolean {
    return medical?.vaccinations?.some(v => v.type === "Rabies") || false;
  }

  async createSwipe(insertSwipe: InsertSwipe): Promise<Swipe> {
    const id = randomUUID();
    const swipe: Swipe = { ...insertSwipe, id, createdAt: new Date() };
    this.swipes.set(id, swipe);
    return swipe;
  }

  async getSwipe(swiperDogId: string, swipedDogId: string): Promise<Swipe | undefined> {
    return Array.from(this.swipes.values())
      .find(swipe => swipe.swiperDogId === swiperDogId && swipe.swipedDogId === swipedDogId);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = { ...insertMatch, id, createdAt: new Date() };
    this.matches.set(id, match);
    return match;
  }

  async getMatchesByDog(dogId: string): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(match => match.dog1Id === dogId || match.dog2Id === dogId);
  }

  async getMessagesByMatch(matchId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.matchId === matchId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...insertMessage, id, createdAt: new Date() };
    this.messages.set(id, message);
    return message;
  }

  async getVeterinariansNearby(latitude: number, longitude: number, maxDistance: number): Promise<VeterinarianWithDistance[]> {
    const vets = Array.from(this.veterinarians.values()).filter(vet => vet.isActive);
    
    const vetsWithDistance = vets.map(vet => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        parseFloat(vet.latitude),
        parseFloat(vet.longitude)
      );
      
      return {
        ...vet,
        distance: Math.round(distance * 10) / 10
      };
    }).filter(vet => vet.distance! <= maxDistance);

    return vetsWithDistance.sort((a, b) => a.distance! - b.distance!);
  }

  async getVeterinarian(id: string): Promise<Veterinarian | undefined> {
    return this.veterinarians.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { ...insertAppointment, id, createdAt: new Date() };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.userId === userId)
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }
}

export const storage = new MemStorage();
