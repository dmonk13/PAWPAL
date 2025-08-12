# PupMatch - Dog Dating App

## Overview

PupMatch is a mobile-first dog dating application that allows dog owners to connect their pets for playdates and companionship. The app features a Tinder-like swiping interface where users can browse nearby dogs, view their profiles and medical information, and match with compatible pets. Built with React, Express, and Drizzle ORM, the application follows a modern full-stack architecture with real-time matching capabilities.

**Migration Status**: Successfully migrated from Replit Agent to Replit environment on August 6, 2025. All core functionality working with PostgreSQL database and sample data.

**Recent Updates (August 12, 2025)**:
- Successfully completed migration from Replit Agent to standard Replit environment
- Redesigned Discover section profile cards with premium gradient badge system (#6B21A8→#F59E0B) 
- Implemented single-column mobile layout with 4/8/16px spacing grid for optimal mobile UX
- Enhanced badges with gold stroke (#D4AF37), subtle shadows, and interactive states (hover, pressed, focus)
- Created comprehensive UI component system with AA contrast compliance and ≥44px tap targets
- Added premium badge variants for gender, size, breed with icons and uppercase styling
- Integrated attribute-based tone styling system with CSS custom properties for consistent theming
- Documented complete badge system and layout patterns in UI JSON specification
- Maintained accessibility standards with ARIA labels, proper focus indicators, and touch optimization

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Component Structure**: Modular components with separation of concerns (pages, components, hooks)

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage Pattern**: Interface-based storage abstraction with in-memory implementation for development
- **API Design**: RESTful endpoints with structured error handling and request logging
- **Build System**: ESBuild for production bundling with dual client/server builds

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database (migrated from in-memory storage - August 6, 2025)
- **ORM**: Drizzle ORM with code-first schema definition
- **Schema Structure**: 
  - Users table for authentication
  - Dogs table with location data (latitude/longitude)
  - Medical profiles for health information
  - Swipes and matches for dating mechanics
  - Messages for communication
  - Veterinarians table for vet connect feature
  - Appointments table for scheduling
- **Migrations**: Drizzle Kit for database schema management
- **Sample Data**: Complete seed data with 6 users, 14 dogs (8 in NY, 6 in Bangalore), 8 veterinarians (3 in NY, 5 in Bangalore), 10 medical profiles, matches, messages, and 8 appointments across different statuses

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **User Context**: Session-based authentication (implementation pending)
- **Data Access**: User-scoped data access patterns

### External Dependencies
- **Database Hosting**: Neon Database (PostgreSQL)
- **Geolocation**: Browser Geolocation API for location-based matching
- **Distance Calculation**: Haversine formula for calculating distances between coordinates
- **UI Framework**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **Development Tools**: Replit-specific plugins for development environment integration

### Key Features Architecture
- **Matching Algorithm**: Location-based filtering with customizable distance radius and preference filters
- **Swipe Mechanics**: Touch gesture handling with visual feedback and match detection
- **Real-time Updates**: React Query for optimistic updates and cache invalidation
- **Medical Information**: Structured medical profiles with vaccination records, allergies, health conditions, and pet insurance integration
- **Pet Insurance System**: Complete third-party insurance management with provider details, policy numbers, coverage types, and expiration tracking
- **Responsive Design**: Mobile-optimized interface with bottom navigation pattern