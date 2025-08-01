import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSwipeSchema, insertDogSchema, insertMedicalProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
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
        const updatedProfile = await storage.updateMedicalProfile(dogId, medicalData);
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

  const httpServer = createServer(app);
  return httpServer;
}
