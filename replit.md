# FarmConnect - Smart Farming Assistant

## Overview

FarmConnect is a bilingual agricultural platform that empowers farmers with AI-powered crop disease detection, real-time weather monitoring, market price tracking, and community features. The application provides a comprehensive farming assistant that combines computer vision, weather APIs, and social features to help farmers make informed decisions and connect with their community.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with custom design system using CSS variables and shadcn/ui components
- **Animations**: Framer Motion for smooth page transitions and component animations
- **State Management**: Zustand for lightweight client-side state with persistence
- **Routing**: Wouter for minimal client-side routing
- **Internationalization**: react-i18next supporting English and Hindi languages
- **Data Fetching**: React Query (TanStack Query) for server state management and caching

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript for type safety across the full stack
- **File Uploads**: Multer middleware for handling multipart form data (image uploads)
- **Validation**: Zod for request/response schema validation
- **Authentication**: Session-based authentication with mock OTP system (OTP always "0000")
- **API Design**: RESTful endpoints with consistent error handling and logging

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: PostgreSQL with UUID primary keys and proper relationships
- **Key Tables**:
  - `users`: User profiles with farming details and preferences
  - `disease_reports`: AI analysis results with image paths and metadata
  - `mandi_prices`: Market price data with temporal tracking
  - `community_posts`: Social features for farmer interaction
  - `marketplace_items`: Buy/sell agricultural products

### Storage Strategy
- **Primary Storage**: Supabase for database, authentication, and file storage
- **Image Storage**: Supabase Storage with organized bucket structure (`disease-images`)
- **Fallback**: In-memory storage implementation for development without external dependencies

### AI Integration
- **Vision AI**: Google Gemini API for crop disease detection and analysis
- **Graceful Degradation**: Mock responses when API keys are not configured
- **Image Processing**: Direct buffer processing with structured JSON responses

## External Dependencies

### Core Services
- **Supabase**: Primary backend service providing PostgreSQL database, authentication, and file storage
- **Google Gemini API**: AI-powered crop disease detection and farming assistant chatbot
- **OpenWeather API**: Real-time weather data and forecasting
- **Government Mandi API**: Live agricultural commodity prices from Indian markets

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **Vite**: Fast development server and build tool with hot module replacement
- **ESBuild**: Production bundling for server-side code

### UI Component Library
- **Radix UI**: Accessible, unstyled component primitives
- **Lucide React**: Consistent iconography system
- **Tailwind CSS**: Utility-first styling with custom design tokens

### Authentication Flow
- **Mock OTP System**: Development-friendly authentication with hardcoded OTP "0000"
- **Session Management**: Server-side session handling with Supabase integration
- **Progressive Onboarding**: Multi-step user profile completion

### Internationalization
- **Language Support**: English and Hindi with JSON translation files
- **User Preference**: Language selection stored in user profile
- **Dynamic Switching**: Real-time language updates without page refresh

### Error Handling Strategy
- **Graceful Degradation**: Fallback to mock data when external APIs are unavailable
- **User Feedback**: Toast notifications for user actions and error states
- **Development Mode**: Enhanced error reporting and debugging tools