import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isPro: boolean("is_pro").default(false),
  proExpiresAt: timestamp("pro_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences for Spotlight matching
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  distanceKm: integer("distance_km").default(25),
  preferredBreeds: jsonb("preferred_breeds").$type<string[]>().default([]),
  preferredSizes: jsonb("preferred_sizes").$type<string[]>().default([]), // Small, Medium, Large
  ageRange: jsonb("age_range").$type<{ min: number; max: number }>().default({ min: 0, max: 15 }),
  temperamentPrefs: jsonb("temperament_prefs").$type<string[]>().default([]),
  activityLevelPrefs: jsonb("activity_level_prefs").$type<string[]>().default([]),
  medicalCompat: jsonb("medical_compat").$type<{
    allowAllergies: boolean;
    allowChronic: boolean;
    notes: string;
  }>().default({ allowAllergies: true, allowChronic: true, notes: "" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Spotlight state for daily recommendations
export const spotlightState = pgTable("spotlight_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  dayStamp: text("day_stamp").notNull(), // YYYY-MM-DD format
  candidateIds: jsonb("candidate_ids").$type<string[]>().default([]), // top 5 dog IDs
  woofRemaining: integer("woof_remaining").default(1), // 0 or 1 per day
  lastReset: timestamp("last_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dogs = pgTable("dogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  size: text("size").notNull(),
  bio: text("bio"),
  photos: jsonb("photos").$type<string[]>().default([]),
  temperament: jsonb("temperament").$type<string[]>().default([]),
  personalityPrompts: jsonb("personality_prompts").$type<Record<string, string>>(),
  matingPreference: boolean("mating_preference").default(false),
  distanceRadius: integer("distance_radius").default(10),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  // New Spotlight fields
  activityLevel: text("activity_level").default("Medium"), // "Low"|"Medium"|"High"
  vetVerified: boolean("vet_verified").default(false),
  vaccinationStatus: text("vaccination_status").default("Up to date"), // "Up to date"|"Overdue"
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalProfiles = pgTable("medical_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dogId: varchar("dog_id").notNull().references(() => dogs.id),
  vaccinations: jsonb("vaccinations").$type<{
    type: string;
    date: string;
    nextDue?: string;
  }[]>().default([]),
  medications: jsonb("medications").$type<{
    name: string;
    dosage: string;
    frequency: string;
  }[]>().default([]),
  allergies: jsonb("allergies").$type<string[]>().default([]),
  conditions: jsonb("conditions").$type<string[]>().default([]),
  lastVetVisit: timestamp("last_vet_visit"),
  isSpayedNeutered: boolean("is_spayed_neutered").default(false),
  vetClearance: boolean("vet_clearance").default(false),
  vetClearanceDate: timestamp("vet_clearance_date"),
  vetDocumentUrl: text("vet_document_url"),
  insurance: jsonb("insurance").$type<{
    provider: string;
    policyNumber: string;
    coverageType: string;
    coverageLimit?: string;
    deductible?: string;
    expirationDate?: string;
    contactNumber?: string;
  } | null>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperDogId: varchar("swiper_dog_id").notNull().references(() => dogs.id),
  swipedDogId: varchar("swiped_dog_id").notNull().references(() => dogs.id),
  isLike: boolean("is_like").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced likes for Spotlight with notes and woof
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toDogId: varchar("to_dog_id").notNull().references(() => dogs.id),
  note: text("note").default(""), // optional message with like
  type: text("type").notNull().default("like"), // "like" or "woof"
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dog1Id: varchar("dog1_id").notNull().references(() => dogs.id),
  dog2Id: varchar("dog2_id").notNull().references(() => dogs.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDogSchema = createInsertSchema(dogs).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalProfileSchema = createInsertSchema(medicalProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpotlightStateSchema = createInsertSchema(spotlightState).omit({
  id: true,
  createdAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Dog = typeof dogs.$inferSelect;
export type InsertDog = z.infer<typeof insertDogSchema>;

export type MedicalProfile = typeof medicalProfiles.$inferSelect;
export type InsertMedicalProfile = z.infer<typeof insertMedicalProfileSchema>;

export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type SpotlightState = typeof spotlightState.$inferSelect;
export type InsertSpotlightState = z.infer<typeof insertSpotlightStateSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

// Extended types for API responses
export type DogWithMedical = Dog & {
  medicalProfile?: MedicalProfile;
  distance?: number;
};

export type MatchWithDogs = Match & {
  dog1: Dog;
  dog2: Dog;
};

// Spotlight-specific types
export type SpotlightCandidate = Dog & {
  medicalProfile?: MedicalProfile;
  distance?: number;
  compatibilityScore: number;
  badges: string[]; // e.g., ["Vaccinated", "Spayed/Neutered", "Vet Verified"]
};

export type WoofStatus = {
  woofRemaining: number;
  resetTime: string; // ISO timestamp for next reset
};

// Veterinarian schema
export const veterinarians = pgTable("veterinarians", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title"), // e.g., "DVM", "VMD", "Doctor of Veterinary Medicine"
  clinicName: text("clinic_name").notNull(),
  profilePhoto: text("profile_photo"),
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  education: jsonb("education").$type<{
    degree: string;
    institution: string;
    year: number;
  }[]>().default([]),
  certifications: jsonb("certifications").$type<{
    name: string;
    issuingBody: string;
    year: number;
    expiryDate?: string;
  }[]>().default([]),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  services: jsonb("services").$type<string[]>().default([]),
  languages: jsonb("languages").$type<string[]>().default(["English"]),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  phoneNumber: text("phone_number"),
  email: text("email"),
  website: text("website"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  workingHours: jsonb("working_hours").$type<{
    [key: string]: { open: string; close: string; closed?: boolean };
  }>().default({}),
  emergencyServices: boolean("emergency_services").default(false),
  onlineBooking: boolean("online_booking").default(false),
  bookingUrl: text("booking_url"),
  consultationFee: decimal("consultation_fee", { precision: 8, scale: 2 }),
  acceptsInsurance: boolean("accepts_insurance").default(false),
  acceptedInsurances: jsonb("accepted_insurances").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments schema
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  dogId: varchar("dog_id").notNull().references(() => dogs.id),
  veterinarianId: varchar("veterinarian_id").notNull().references(() => veterinarians.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  serviceType: text("service_type").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  isExternal: boolean("is_external").default(false),
  externalBookingId: text("external_booking_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional insert schemas
export const insertVeterinarianSchema = createInsertSchema(veterinarians).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

// Additional types
export type Veterinarian = typeof veterinarians.$inferSelect;
export type InsertVeterinarian = z.infer<typeof insertVeterinarianSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Extended types for vet listings
export type VeterinarianWithDistance = Veterinarian & {
  distance?: number;
};
