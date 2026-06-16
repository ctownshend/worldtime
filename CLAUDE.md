# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chronosphere is a React world time widget with live city clocks and a day–night solar terminator map. Cities are loaded from GeoNames API and displayed on an equirectangular projection with NASA Blue Marble textures.

## Commands

```bash
npm run dev      # Start Vite dev server (proxies GeoNames via /api/geonames)
npm run build    # TypeScript compile + Vite build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Setup

GeoNames requires a free username. Copy `.env.example` to `.env` and set `VITE_GEONAMES_USERNAME`. Falls back to `demo` with strict rate limits if unset.

## Architecture

### Core data flow
- `City` type (`src/types/city.ts`) is the central model with geonameId, coordinates, and IANA timezone
- `seedCities` provides offline fallback defaults (London, NYC, Tokyo, Sydney)
- GeoNames API is proxied through Vite dev server to avoid CORS

### Map rendering (`src/components/WorldMap.tsx`)
- Equirectangular projection (2048×1024 SVG)
- Day texture shows when solar elevation > 0, night texture clipped to terminator
- Solar geometry in `src/lib/solar.ts` calculates subsolar point and terminator path

### Hooks pattern
- `useNow()` — live Date updated every second
- `useCitySearch(query)` — debounced GeoNames search with fallback to seedCities
- `useDefaultCities()` — hydrates seedCities with live timezone data on mount

### Future platforms
The domain logic (`types/`, `data/`, `lib/`) is platform-agnostic. For iOS/Android/watch targets, rebuild `components/` with React Native/Expo.
