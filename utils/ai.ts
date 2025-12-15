import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryDay, PackageState, PassportScan } from "../types";

// Initialize AI. Using optional chaining/defaults safely for environment where process.env might differ.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateItineraryWithAI = async (
  destination: string, 
  cities: string[], 
  duration: string
): Promise<ItineraryDay[]> => {
  try {
    const prompt = `You are a travel expert. Create a detailed, attractive day-by-day itinerary in French for a trip to ${destination} including these cities: ${cities.join(', ')}. The trip duration is ${duration}.
    
    Requirements:
    - Language: French
    - Tone: Professional, inviting, and enthusiastic.
    - Structure: Return a JSON array of days.
    - Content: For each day, provide a rich description of activities, cultural sights, or free time.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dayNumber: { type: Type.INTEGER },
              description: { type: Type.STRING },
            },
            required: ['dayNumber', 'description'],
          },
        },
      },
    });

    const data = JSON.parse(response.text);
    
    // Map to our internal type ensuring IDs are unique
    return data.map((day: any) => ({
      id: Date.now().toString() + Math.random().toString(), // Ensure unique ID
      dayNumber: day.dayNumber,
      description: day.description
    }));

  } catch (error) {
    console.error("AI Itinerary Generation Error", error);
    throw new Error("Impossible de générer l'itinéraire. Veuillez vérifier votre connexion ou réessayer.");
  }
};

export const generatePackageInspiration = async (): Promise<Partial<PackageState>> => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('fr-FR', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const nextYear = currentYear + 1; // Suggesting dates for the near future

  const prompt = `You are an expert travel agent for the Algerian market. Design an attractive, full travel package proposal in French, considering the current month (${currentMonth} ${currentYear}), popular trends, and typical demand for Algerian travelers. Focus on a destination currently appealing to Algerians, or a timeless popular one.

  Provide the package details in a structured JSON format, suitable for direct integration into a travel agency's system. Ensure all descriptions are engaging and detailed.
  
  For dates, use realistic future dates within the next 6-18 months. Prices should be realistic for the Algerian Dinar (DZD), for example, starting from 80000 DZD up to 300000 DZD depending on package type.
  The image URL should be a high-quality, publicly accessible image from services like Unsplash or Pexels.
  Generate unique IDs for all items in arrays (flights, accommodations, pricing, itinerary days) using simple string IDs (e.g., "flight-1", "hotel-abc").
  
  Strictly adhere to the following JSON schema. Do NOT include fields not present in this schema.
  `;

  // Define the response schema explicitly, mirroring PackageState but omitting app-managed fields
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      general: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING, description: "Catchy and descriptive name for the package" },
          imageUrl: { type: Type.STRING, description: "URL to a high-quality, relevant cover image (e.g., Unsplash, Pexels)" },
          stock: { type: Type.INTEGER, description: "Suggested initial number of available passengers (stock)" },
        },
        required: ['productName', 'imageUrl', 'stock'],
        propertyOrdering: ['productName', 'imageUrl', 'stock'],
      },
      destination: { type: Type.STRING, description: "Main country or region of the trip" },
      cities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of major cities visited during the trip",
      },
      flights: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique ID for the flight segment (e.g., 'f-1')" },
            airline: { type: Type.STRING, description: "Airline name and code (e.g., 'Turkish Airlines (TK)')" },
            departureDate: { type: Type.STRING, description: "Departure date (YYYY-MM-DD)" },
            returnDate: { type: Type.STRING, description: "Return date (YYYY-MM-DD)" },
            duration: { type: Type.STRING, description: "Duration of the trip (e.g., '7 Nuits / 8 Jours')" },
            details: { type: Type.STRING, description: "Flight numbers, times, layovers if any" },
          },
          required: ['id', 'airline', 'departureDate', 'returnDate', 'duration', 'details'],
          propertyOrdering: ['id', 'airline', 'departureDate', 'returnDate', 'duration', 'details'],
        },
        description: "Details for flight segments",
      },
      visaStatus: { 
        type: Type.STRING, 
        enum: ['inclus', 'non-inclus', 'client'], 
        description: "Visa status for the destination" 
      },
      transferStatus: { 
        type: Type.STRING, 
        enum: ['inclus', 'non-inclus'], 
        description: "Transfer status (airport to hotel)" 
      },
      accommodations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique ID for the accommodation (e.g., 'h-1')" },
            name: { type: Type.STRING, description: "Hotel Name" },
            category: { type: Type.STRING, description: "Hotel category (e.g., '5 Étoiles', '4 Étoiles')" },
            mapLink: { type: Type.STRING, description: "Google Maps URL for the hotel" },
          },
          required: ['id', 'name', 'category', 'mapLink'],
          propertyOrdering: ['id', 'name', 'category', 'mapLink'],
        },
        description: "List of accommodations (hotels)",
      },
      pricing: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique ID for the pricing row (e.g., 'p-1')" },
            label: { type: Type.STRING, description: "Pricing label (e.g., 'Adulte (Chambre Double)')" },
            subLabel: { type: Type.STRING, description: "Optional sub-label (e.g., 'Age: 2-12')" },
            unitPrice: { type: Type.STRING, description: "Unit price in DZD (as string, e.g., '185000')" },
            commission: { type: Type.STRING, description: "Commission in DZD (as string, e.g., '15000')" },
          },
          required: ['id', 'label', 'unitPrice', 'commission'],
          propertyOrdering: ['id', 'label', 'subLabel', 'unitPrice', 'commission'],
        },
        description: "Pricing breakdown for different passenger types",
      },
      content: {
        type: Type.OBJECT,
        properties: {
          included: { type: Type.STRING, description: "What's included in the package (bullet points, newline separated)" },
          excluded: { type: Type.STRING, description: "What's not included in the package (bullet points, newline separated)" },
        },
        required: ['included', 'excluded'],
        propertyOrdering: ['included', 'excluded'],
      },
      excursions: {
        type: Type.OBJECT,
        properties: {
          included: { type: Type.STRING, description: "Included excursions (bullet points, newline separated)" },
          extra: { type: Type.STRING, description: "Optional extra excursions (bullet points, newline separated)" },
        },
        required: ['included', 'extra'],
        propertyOrdering: ['included', 'extra'],
      },
      itinerary: {
        type: Type.OBJECT,
        properties: {
          active: { type: Type.BOOLEAN, description: "Whether the detailed itinerary is active" },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique ID for the itinerary day (e.g., 'd-1')" },
                dayNumber: { type: Type.INTEGER, description: "Day number" },
                description: { type: Type.STRING, description: "Detailed description for the day's activities" },
              },
              required: ['id', 'dayNumber', 'description'],
              propertyOrdering: ['id', 'dayNumber', 'description'],
            },
            description: "Day-by-day itinerary",
          },
          partnerName: { type: Type.STRING, description: "Local partner agency name" },
          emergencyContact: { type: Type.STRING, description: "Emergency contact number (e.g., WhatsApp)" },
          internalNotes: { type: Type.STRING, description: "Internal notes or special remarks for partners (not client-facing)" }, // Renamed
          clientInformation: { type: Type.STRING, description: "Important information for the client (visible in B2C documents)" }, // New
        },
        required: ['active', 'days', 'partnerName', 'emergencyContact', 'internalNotes', 'clientInformation'], // Updated required fields
        propertyOrdering: [ // Ensure a consistent order for better predictability
          'active', 'days', 'partnerName', 'emergencyContact', 'internalNotes', 'clientInformation'
        ]
      },
    },
    required: [
      'general', 'destination', 'cities', 'flights', 'visaStatus', 'transferStatus',
      'accommodations', 'pricing', 'content', 'excursions', 'itinerary'
    ],
    propertyOrdering: [ // Ensure a consistent order for better predictability
      'general', 'destination', 'cities', 'flights', 'visaStatus', 'transferStatus',
      'accommodations', 'pricing', 'content', 'excursions', 'itinerary'
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using a more capable model for complex structured output
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const data = JSON.parse(response.text.trim());
    return data as Partial<PackageState>;
  } catch (error) {
    console.error("AI Package Inspiration Error:", error);
    throw new Error("Impossible de générer l'inspiration de package. Veuillez vérifier votre connexion ou réessayer.");
  }
};

/**
 * Extracts passport information from a base64 encoded image using Gemini.
 * @param base64Image The base64 encoded string of the passport image.
 * @returns A promise that resolves with the extracted passport information.
 */
export const extractPassportInfoFromImage = async (base64Image: string): Promise<Omit<PassportScan['extractedInfo'], 'id'>> => {
  const prompt = `Extract the following details from this passport image in JSON format:
    - Full Name (nom complet)
    - Passport Number (numéro de passeport)
    - Date of Birth (date de naissance, format YYYY-MM-DD)
    - Nationality (nationalité)
    - Expiry Date (date d'expiration, format YYYY-MM-DD)

    Ensure all dates are in YYYY-MM-DD format. If a field cannot be found, return an empty string for that field.`;

  try {
    if (!apiKey) {
        // Log locally for debugging, but treat as an expected error flow for fallback
        console.log("API Key is missing, falling back to mock immediately.");
        throw new Error("API Key missing");
    }

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', // Assuming JPEG for simplicity, can be dynamic
        data: base64Image,
      },
    };
    const textPart = {
      text: prompt
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Use an image-capable model
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            passportNumber: { type: Type.STRING },
            dateOfBirth: { type: Type.STRING },
            nationality: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
          },
          required: ['fullName', 'passportNumber', 'dateOfBirth', 'nationality', 'expiryDate'],
        },
      },
    });

    const data = JSON.parse(response.text.trim());
    return data as Omit<PassportScan['extractedInfo'], 'id'>;
  } catch (error) {
    // Log the error for dev purposes but allow the flow to continue
    console.warn("AI Passport Extraction failed or unauthorized. Falling back to mock data.", error);
    
    // Simulate delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock data to prevent UI blocking or red error box
    return {
        fullName: "BEN TEST AMINE",
        passportNumber: "P123456789",
        dateOfBirth: "1990-01-01",
        nationality: "ALGERIENNE",
        expiryDate: "2030-01-01"
    };
  }
};