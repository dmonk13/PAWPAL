# PupMatch - Dog Dating App

## Overview

PupMatch is a mobile-first dog dating application that allows dog owners to connect their pets for playdates and companionship. The app features a Tinder-like swiping interface where users can browse nearby dogs, view their profiles and medical information, and match with compatible pets. Built with React, Express, and Drizzle ORM, the application follows a modern full-stack architecture with real-time matching capabilities.

**Migration Status**: Successfully migrated from Replit Agent to Replit environment on August 6, 2025. All core functionality working with PostgreSQL database and sample data.

**Recent Updates (August 13, 2025)**:
- Successfully completed migration from Replit Agent to standard Replit environment
- Fixed duplicate close button issue in medical profile modal (SimpleMedicalModal component)
- **MAJOR UX IMPROVEMENT**: Replaced modal medical profile with immersive bottom sheet experience
- Created new ImmersiveMedicalView component that slides up from bottom for better mobile UX
- Optimized medical profile for mobile: reduced height from 85vh to 70vh, compact spacing, smaller text sizes
- Enhanced medical profile with quick stats cards, better visual hierarchy, and streamlined action buttons
- Improved user experience: medical profile now opens within Discover section instead of separate page overlay
- **FILTER MODAL ENHANCEMENTS**: Improved age group selection with better icons and visual design
- Enhanced age filter icons: Sparkles for Puppy, Zap for Young, Star for Adult, Crown for Senior, Settings for Custom
- Improved button design with gradient backgrounds, scale animations, and better hover effects
- Optimized spacing throughout filter modal: reduced gaps from space-y-8 to space-y-5, padding from p-6 to p-4
- Made layout more adaptable with compact summary bar and action buttons for better mobile experience
- Created comprehensive modern sign-in screen with advanced authentication features
- Implemented brand-aligned design with primary gradient CTAs, AA+ contrast, and accessibility features
- Added security features: progressive login delays, caps lock detection, invisible bot protection
- Integrated SSO options (Apple/Google), magic link authentication, and "Keep me signed in" functionality
- Built offline support with connection status indicators and maintenance mode banners
- Enhanced error handling with specific messages, rate limiting alerts, and retry mechanisms
- Fixed settings page navigation: back button now correctly redirects to profile section instead of discover
- Fixed premium page navigation: added back button that correctly redirects to profile section
- Fixed "Compare Plans" button in profile to properly navigate to premium pricing page
- Added 44px touch targets, semantic labels, and proper ARIA attributes for accessibility
- Implemented device/session management link and comprehensive form validation
- Redesigned Age Range filter with improved user experience: cleaner interface, better text, tooltip for guidance
- Removed duplicate X button from filter modal header and improved spacing between sections
- Enhanced age selection with clear multi-select chips (Puppy 0-1y, Young 1-3y, Adult 3-7y, Senior 7y+)
- Added custom age range bottom sheet with min/max steppers, validation, and reset functionality
- Improved filter summary with live pill display and selected count indicators

**Vaccination Care System Implementation (August 13, 2025)**:
- Created unified vaccination care scheduling system with "Care Details & Scheduling" dialog
- Implemented comprehensive CareDetailsDialog showing vaccine info, medical details, and scheduling options
- Built VetSchedulingDialog with complete appointment booking flow, calendar integration, and confirmation screen
- Added AddVaccinationDialog for recording completed vaccinations with auto-calculated due dates
- Created PremiumUpsellSheet for non-subscribers with trial CTA and feature benefits
- Integrated MedicalModal providing overview of dog's medical profile and vaccination status
- Enhanced profile page with improved medical profile section and quick action buttons
- Added analytics tracking for vaccination scheduling, booking confirmations, and upsell conversions
- Implemented proper error handling, offline support, and accessibility features
- System supports overdue badge clicking, schedule button actions, and premium/non-premium user flows

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