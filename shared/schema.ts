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
  matingPreference: boolean("mating_preference").default(false),
  distanceRadius: integer("distance_radius").default(10),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperDogId: varchar("swiper_dog_id").notNull().references(() => dogs.id),
  swipedDogId: varchar("swiped_dog_id").notNull().references(() => dogs.id),
  isLike: boolean("is_like").notNull(),
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

// Extended types for API responses
export type DogWithMedical = Dog & {
  medicalProfile?: MedicalProfile;
  distance?: number;
};

export type MatchWithDogs = Match & {
  dog1: Dog;
  dog2: Dog;
};

// Veterinarian schema
export const veterinarians = pgTable("veterinarians", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clinicName: text("clinic_name").notNull(),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  services: jsonb("services").$type<string[]>().default([]),
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
