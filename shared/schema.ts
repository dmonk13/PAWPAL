import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
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
