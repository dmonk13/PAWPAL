import { type User, type InsertUser, type Dog, type InsertDog, type MedicalProfile, type InsertMedicalProfile, type Swipe, type InsertSwipe, type Match, type InsertMatch, type Message, type InsertMessage, type DogWithMedical } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dogs: Map<string, Dog>;
  private medicalProfiles: Map<string, MedicalProfile>;
  private swipes: Map<string, Swipe>;
  private matches: Map<string, Match>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.dogs = new Map();
    this.medicalProfiles = new Map();
    this.swipes = new Map();
    this.matches = new Map();
    this.messages = new Map();
    
    // Seed with initial data
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const user1: User = {
      id: "user-1",
      username: "dogowner1",
      email: "owner1@example.com",
      password: "password123",
      createdAt: new Date(),
    };
    
    const user2: User = {
      id: "user-2", 
      username: "dogowner2",
      email: "owner2@example.com",
      password: "password123",
      createdAt: new Date(),
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);

    // Create sample dogs
    const dog1: Dog = {
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
    };

    const dog2: Dog = {
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
    };

    const dog3: Dog = {
      id: "dog-3",
      ownerId: "user-1",
      name: "Max",
      breed: "Border Collie",
      age: 4,
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
    };

    this.dogs.set(dog1.id, dog1);
    this.dogs.set(dog2.id, dog2);
    this.dogs.set(dog3.id, dog3);

    // Create sample medical profiles
    const medical1: MedicalProfile = {
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
    };

    const medical2: MedicalProfile = {
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
    };

    const medical3: MedicalProfile = {
      id: "med-3",
      dogId: "dog-3",
      vaccinations: [
        { type: "Rabies", date: "2024-02-20", nextDue: "2025-02-20" },
        { type: "DHPP", date: "2024-02-20", nextDue: "2025-02-20" },
        { type: "Bordetella", date: "2024-02-20", nextDue: "2025-02-20" }
      ],
      medications: [],
      allergies: [],
      conditions: [],
      lastVetVisit: new Date("2024-02-20"),
      isSpayedNeutered: true,
      vetClearance: true,
      vetClearanceDate: new Date("2024-02-20"),
      vetDocumentUrl: null,
      createdAt: new Date(),
    };

    this.medicalProfiles.set(medical1.dogId, medical1);
    this.medicalProfiles.set(medical2.dogId, medical2);
    this.medicalProfiles.set(medical3.dogId, medical3);
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
}

export const storage = new MemStorage();
