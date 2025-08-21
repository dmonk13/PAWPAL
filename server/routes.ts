import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertSwipeSchema, insertDogSchema, insertMedicalProfileSchema, insertAppointmentSchema, insertUserSchema, insertLikeSchema } from "@shared/schema";
import { z } from "zod";

// Define session type extension
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: any) => {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Configure session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Helper functions
  const calculateCompatibility = (userPrefs: any, candidate: any) => {
    let score = 0;
    
    // Distance scoring (20 points)
    if (candidate.distance && userPrefs.distanceKm) {
      const distanceScore = candidate.distance <= userPrefs.distanceKm 
        ? Math.max(0, 20 - (candidate.distance / userPrefs.distanceKm) * 15)
        : 0;
      score += distanceScore;
    } else {
      score += 10; // Default if no distance data
    }
    
    // Age compatibility (10 points)
    if (userPrefs.ageRange && candidate.age >= userPrefs.ageRange.min && candidate.age <= userPrefs.ageRange.max) {
      score += 10;
    }
    
    // Breed preference (10 points)
    if (userPrefs.preferredBreeds && userPrefs.preferredBreeds.length > 0) {
      if (userPrefs.preferredBreeds.includes(candidate.breed)) {
        score += 7;
      }
    } else {
      score += 5; // Neutral if no breed preference
    }
    
    // Size preference (3 points)
    if (userPrefs.preferredSizes && userPrefs.preferredSizes.length > 0) {
      if (userPrefs.preferredSizes.includes(candidate.size)) {
        score += 3;
      }
    } else {
      score += 2;
    }
    
    // Temperament overlap (25 points)
    if (userPrefs.temperamentPrefs && candidate.temperament) {
      const overlap = userPrefs.temperamentPrefs.filter((t: string) => candidate.temperament.includes(t));
      score += Math.min(25, overlap.length * 8);
    } else {
      score += 10; // Neutral
    }
    
    // Activity level (10 points)
    if (userPrefs.activityLevelPrefs && userPrefs.activityLevelPrefs.includes(candidate.activityLevel)) {
      score += 10;
    } else {
      score += 5; // Neutral
    }
    
    // Medical compatibility (15 points)
    if (userPrefs.medicalCompat) {
      let medScore = 0;
      if (!candidate.medicalProfile?.allergies?.length || userPrefs.medicalCompat.allowAllergies) {
        medScore += 5;
      }
      if (!candidate.medicalProfile?.conditions?.length || userPrefs.medicalCompat.allowChronic) {
        medScore += 5;
      }
      medScore += 5; // Base medical score
      score += medScore;
    } else {
      score += 12; // Default
    }
    
    // Vet verified and vaccination status (10 points)
    if (candidate.vetVerified) score += 5;
    if (candidate.vaccinationStatus === "Up to date") score += 5;
    
    return Math.min(100, Math.round(score));
  };

  // Authentication Routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { user: userData, dog: dogData } = req.body;
      
      // Validate user data
      const validatedUser = insertUserSchema.parse(userData);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedUser.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user
      const newUser = await storage.createUser(validatedUser);
      
      // Create dog profile
      const dogProfileData = insertDogSchema.parse({
        ...dogData,
        ownerId: newUser.id,
        photos: [],
        latitude: "12.9716", // Default Bangalore coordinates
        longitude: "77.5946",
        isActive: true
      });
      
      const newDog = await storage.createDog(dogProfileData);

      // Set session
      req.session.userId = newUser.id;
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ 
        user: userWithoutPassword, 
        dog: newDog 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get("/api/auth/user", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        req.session.destroy((err) => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/magic-link", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // In a real app, you would:
      // 1. Find user by email
      // 2. Generate a secure token
      // 3. Store token with expiration
      // 4. Send email with magic link
      
      console.log(`Magic link requested for: ${email}`);
      
      // Simulate email sending delay
      setTimeout(() => {
        res.json({ 
          success: true, 
          message: "Magic link sent to email address" 
        });
      }, 1000);
    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ message: "Failed to send magic link" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).json({ message: "Could not log out" });
          }
          res.json({ message: "Logged out successfully" });
        });
      } else {
        res.json({ message: "No active session" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  
  // Get dogs for matching based on location and filters
  app.get("/api/dogs/discover", async (req, res) => {
    try {
      const { 
        dogId, 
        latitude, 
        longitude, 
        maxDistance = 10,
        ageRange,
        size,
        vaccinated,
        spayedNeutered,
        noAllergies
      } = req.query;

      if (!dogId || !latitude || !longitude) {
        return res.status(400).json({ 
          message: "dogId, latitude, and longitude are required" 
        });
      }

      const filters = {
        ageRange: ageRange as string,
        size: size as string,
        vaccinated: vaccinated === 'true',
        spayedNeutered: spayedNeutered === 'true',
        noAllergies: noAllergies === 'true'
      };

      const dogs = await storage.getDogsForMatching(
        dogId as string,
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(maxDistance as string),
        filters
      );

      res.json(dogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dogs for matching" });
    }
  });

  // Create a swipe
  app.post("/api/swipes", async (req, res) => {
    try {
      const swipeData = insertSwipeSchema.parse(req.body);
      const swipe = await storage.createSwipe(swipeData);

      // Check if there's a mutual like (match)
      if (swipeData.isLike) {
        const reverseSwipe = await storage.getSwipe(
          swipeData.swipedDogId,
          swipeData.swiperDogId
        );

        if (reverseSwipe && reverseSwipe.isLike) {
          // Create a match
          const match = await storage.createMatch({
            dog1Id: swipeData.swiperDogId,
            dog2Id: swipeData.swipedDogId
          });

          return res.json({ swipe, match });
        }
      }

      res.json({ swipe });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid swipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create swipe" });
    }
  });

  // Get matches for a dog
  app.get("/api/dogs/:dogId/matches", async (req, res) => {
    try {
      const { dogId } = req.params;
      const matches = await storage.getMatchesByDog(dogId);
      
      // Get dog details for each match
      const matchesWithDogs = await Promise.all(
        matches.map(async (match) => {
          const otherDogId = match.dog1Id === dogId ? match.dog2Id : match.dog1Id;
          const otherDog = await storage.getDog(otherDogId);
          const medicalProfile = await storage.getMedicalProfile(otherDogId);
          
          return {
            ...match,
            otherDog: {
              ...otherDog,
              medicalProfile
            }
          };
        })
      );

      res.json(matchesWithDogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get matches" });
    }
  });

  // Create a new dog profile
  app.post("/api/dogs", async (req, res) => {
    try {
      const dogData = insertDogSchema.parse(req.body);
      const dog = await storage.createDog(dogData);
      res.status(201).json(dog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dog data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dog profile" });
    }
  });

  // Update dog profile
  app.patch("/api/dogs/:dogId", async (req, res) => {
    try {
      const { dogId } = req.params;
      const updates = req.body;
      const updatedDog = await storage.updateDog(dogId, updates);
      
      if (!updatedDog) {
        return res.status(404).json({ message: "Dog not found" });
      }
      
      res.json(updatedDog);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dog profile" });
    }
  });

  // Get user's dogs
  app.get("/api/users/:userId/dogs", async (req, res) => {
    try {
      const { userId } = req.params;
      const dogs = await storage.getDogsByOwner(userId);
      
      // Get medical profiles for each dog
      const dogsWithMedical = await Promise.all(
        dogs.map(async (dog) => {
          const medicalProfile = await storage.getMedicalProfile(dog.id);
          return {
            ...dog,
            medicalProfile
          };
        })
      );
      
      res.json(dogsWithMedical);
    } catch (error) {
      console.error("Failed to get user dogs:", error);
      res.status(500).json({ message: "Failed to get user dogs" });
    }
  });

  // Get dog medical profile
  app.get("/api/dogs/:dogId/medical", async (req, res) => {
    try {
      const { dogId } = req.params;
      const medicalProfile = await storage.getMedicalProfile(dogId);
      
      if (!medicalProfile) {
        return res.status(404).json({ message: "Medical profile not found" });
      }
      
      res.json(medicalProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to get medical profile" });
    }
  });

  // Create or update medical profile
  app.post("/api/dogs/:dogId/medical", async (req, res) => {
    try {
      const { dogId } = req.params;
      const medicalData = insertMedicalProfileSchema.parse({
        ...req.body,
        dogId
      });

      const existingProfile = await storage.getMedicalProfile(dogId);
      
      if (existingProfile) {
        const updatedProfile = await storage.updateMedicalProfile(dogId, req.body);
        res.json(updatedProfile);
      } else {
        const newProfile = await storage.createMedicalProfile(medicalData);
        res.status(201).json(newProfile);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid medical data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save medical profile" });
    }
  });

  // Create medical profile
  app.post("/api/medical-profiles", async (req, res) => {
    try {
      const medicalData = insertMedicalProfileSchema.parse(req.body);
      const newProfile = await storage.createMedicalProfile(medicalData);
      res.status(201).json(newProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid medical data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create medical profile" });
    }
  });

  // Update medical profile by ID
  app.patch("/api/medical-profiles/:medicalProfileId", async (req, res) => {
    try {
      const { medicalProfileId } = req.params;
      const updatedProfile = await storage.updateMedicalProfileById(medicalProfileId, req.body);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Medical profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update medical profile" });
    }
  });

  // Get messages for a match
  app.get("/api/matches/:matchId/messages", async (req, res) => {
    try {
      const { matchId } = req.params;
      const messages = await storage.getMessagesByMatch(matchId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send a message
  app.post("/api/matches/:matchId/messages", async (req, res) => {
    try {
      const { matchId } = req.params;
      const { senderId, content } = req.body;
      
      if (!senderId || !content) {
        return res.status(400).json({ message: "senderId and content are required" });
      }

      const message = await storage.createMessage({
        matchId,
        senderId,
        content
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get dogs by owner
  app.get("/api/users/:userId/dogs", async (req, res) => {
    try {
      const { userId } = req.params;
      const dogs = await storage.getDogsByOwner(userId);
      
      const dogsWithMedical = await Promise.all(
        dogs.map(async (dog) => {
          const medicalProfile = await storage.getMedicalProfile(dog.id);
          return { ...dog, medicalProfile };
        })
      );
      
      res.json(dogsWithMedical);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user's dogs" });
    }
  });

  // Veterinarian routes
  
  // Get veterinarians nearby
  app.get("/api/veterinarians/nearby", async (req, res) => {
    try {
      const { latitude, longitude, maxDistance = 25 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ 
          message: "latitude and longitude are required" 
        });
      }

      const veterinarians = await storage.getVeterinariansNearby(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(maxDistance as string)
      );

      res.json(veterinarians);
    } catch (error) {
      res.status(500).json({ message: "Failed to get nearby veterinarians" });
    }
  });

  // Get veterinarian details
  app.get("/api/veterinarians/:vetId", async (req, res) => {
    try {
      const { vetId } = req.params;
      const veterinarian = await storage.getVeterinarian(vetId);
      
      if (!veterinarian) {
        return res.status(404).json({ message: "Veterinarian not found" });
      }
      
      res.json(veterinarian);
    } catch (error) {
      res.status(500).json({ message: "Failed to get veterinarian details" });
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Get user appointments
  app.get("/api/users/:userId/appointments", async (req, res) => {
    try {
      const { userId } = req.params;
      const appointments = await storage.getAppointmentsByUser(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user appointments" });
    }
  });

  // Stripe subscription endpoint
  app.post("/api/create-subscription", async (req, res) => {
    try {
      // For now, return a placeholder URL since we need actual Stripe setup
      // In production, this would create a Stripe checkout session
      res.json({ 
        checkoutUrl: "/premium?success=true",
        message: "Subscription feature ready - requires Stripe configuration" 
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating subscription: " + error.message 
      });
    }
  });

  // Spotlight Routes
  
  // Get Spotlight candidates
  app.get("/api/spotlight", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const candidates = await storage.getSpotlightCandidates(userId);
      res.json(candidates);
    } catch (error) {
      console.error("Get spotlight candidates error:", error);
      res.status(500).json({ message: "Failed to get Spotlight candidates" });
    }
  });

  // Create like with note (includes woof)
  app.post("/api/likes", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const validatedLike = insertLikeSchema.parse({
        ...req.body,
        fromUserId: userId
      });

      // Check woof limit if type is "woof"
      if (validatedLike.type === "woof") {
        const woofStatus = await storage.getWoofStatus(userId);
        if (woofStatus.woofRemaining < 1) {
          return res.status(429).json({ 
            message: "No Woofs remaining for today",
            woofStatus
          });
        }
      }

      const like = await storage.createLike(validatedLike);
      res.status(201).json({ like });
    } catch (error) {
      console.error("Create like error:", error);
      res.status(400).json({ message: "Failed to create like" });
    }
  });

  // Get woof status
  app.get("/api/woof/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const woofStatus = await storage.getWoofStatus(userId);
      res.json(woofStatus);
    } catch (error) {
      console.error("Get woof status error:", error);
      res.status(500).json({ message: "Failed to get woof status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
