       const { OpenAI } = require("openai");
       const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");
       const TripBase = require("../../models/TripWell/TripBase");
       const openai = new OpenAI();

       /**
        * Modifies a single TripCurrentDays block using GPT (Angela) based on user feedback.
        * Returns raw GPT output string (block JSON only). Parsing handled separately.
        */
       async function tripDayGPTModifierService({ tripId, dayIndex, feedback, block }) {
         if (!tripId || typeof dayIndex !== "number" || !feedback || !block) {
           throw new Error("Invalid input to GPT modifier");
         }

         // Fetch trip base for city and startDate
         const trip = await TripBase.findOne({ _id: tripId });
         if (!trip || !trip.city || !trip.startDate) {
           throw new Error("Trip city or startDate missing");
         }

         const tripDay = await TripCurrentDays.findOne({ tripId, dayIndex });
         if (!tripDay) throw new Error(`TripCurrentDays not found for tripId ${tripId}, dayIndex ${dayIndex}`);

         const currentBlock = tripDay.blocks[block];
         if (!currentBlock) throw new Error(`Invalid block: ${block}`);

         // Compute day of week from start date + dayIndex
         const tripStart = new Date(trip.startDate);
         const targetDate = new Date(tripStart);
         targetDate.setDate(tripStart.getDate() + (dayIndex - 1)); // DayIndex starts at 1

         const dayOfWeek = targetDate.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Saturday"

         const systemPrompt = `
       You are Angela, TripWell’s smart itinerary planner.
       You’re revising a single block of a travel day based on user feedback.

       City: ${trip.city}  
       Day of week: ${dayOfWeek}

       Only revise the requested time block and return ONLY valid JSON in this format:
       { "block": { "title": "...", "desc": "..." } }

       No markdown (e.g., backticks), no commentary, no extra text.
       `.trim();

         const userPrompt = `
       Trip ID: ${tripId}
       Day index: ${dayIndex}
       Block to modify: ${block}

       Current block:
       ${JSON.stringify(currentBlock, null, 2)}

       User feedback:
       "${feedback}"
       `.trim();

         const response = await openai.chat.completions.create({
           model: "gpt-4",
           temperature: 0.8,
           messages: [
             { role: "system", content: systemPrompt },
             { role: "user", content: userPrompt }
           ]
         });

         const content = response.choices?.[0]?.message?.content;
         if (!content) throw new Error("No GPT output received from Angela.");

         return content.trim();
       }

       module.exports = { tripDayGPTModifierService };
