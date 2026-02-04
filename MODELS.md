- `gemini-2.0-flash` (Primary - Latest Efficiency)
- `gemini-2.0-flash-exp` (Experimental - New Features)
- `gemini-3-flash` (High Throughput)
- `gemini-3-pro` (High Intelligence)
- `imagen-4.0-generate` (Image Generation)

## Usage Strategy

The system prioritizes `gemini-2.0-flash`. If unavailable, it falls back to experimental or 3.x series models.

### Limits (RPD)
- **Gemini 3 Pro:** 250 RPD
- **Gemini 2/3 Flash:** 10,000 RPD
- **Imagen 4.0:** 70 RPD
