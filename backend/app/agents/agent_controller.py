import logging
import re
import json
from typing import Dict, Any, List, Optional
from app.config import settings
from app.agents.itinerary_generator import itinerary_generator
from app.rag.vector_store import rag_engine
from app.services.duffel_service import flight_service
from app.services.hotel_service import hotel_service

logger = logging.getLogger(__name__)

POPULAR_CITIES = [
    "Lucknow", "Mumbai", "Delhi", "Bangalore", "Goa", "Jaipur", 
    "Manali", "Kerala", "Kolkata", "Chennai", "Hyderabad", "Pune", 
    "Ahmedabad", "Chandigarh", "Shimla", "Udaipur", "Varanasi", "Agra"
]

class AgentController:
    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.last_plan: Optional[Dict[str, Any]] = None
        self.last_flights: List[Dict[str, Any]] = []
        self.last_hotels: List[Dict[str, Any]] = []
        self.last_origin: str = "Delhi"
        self.last_destination: str = "Goa"

    def generate_llm_response(self, prompt: str, system_context: str = "") -> str:
        """Call Gemini 2.5 Flash LLM for dynamic, natural AI conversational answers."""
        if self.gemini_api_key and not settings.DEMO_MODE:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_api_key)
                model = genai.GenerativeModel("gemini-2.5-flash")
                full_prompt = f"{system_context}\n\nUser Question: {prompt}\n\nPlease respond directly and conversationally in 2-4 sentences."
                res = model.generate_content(full_prompt)
                if res and res.text:
                    return res.text.strip()
            except Exception as e:
                logger.warning(f"Gemini LLM generation error: {e}")
        return ""

    def parse_travel_intent(self, prompt: str) -> Dict[str, Any]:
        """Extract origin, destination, days, travelers, and budget dynamically for ANY city."""
        prompt_clean = re.sub(r'\s*\([A-Za-z0-9]+\)', '', prompt).strip()
        origin = self.last_origin or "Delhi"
        destination = self.last_destination or "Goa"
        days = 4
        travelers = 1
        budget = 30000.0
        make_cheaper = "cheaper" in prompt_clean.lower() or ("budget" in prompt_clean.lower() and "reduce" in prompt_clean.lower())

        # 1. Regex match "from X to Y" or "X to Y"
        from_to_match = re.search(r'([a-zA-Z\s]{2,30}?)\s+to\s+([a-zA-Z\s]{2,30}?)(?:\.|\,|$|\s+under|\s+for|\s+budget|\s+my)', prompt_clean, re.IGNORECASE)
        if from_to_match:
            g1 = from_to_match.group(1).strip()
            g2 = from_to_match.group(2).strip()
            
            if "from" in g1.lower():
                g1 = g1[g1.lower().rfind("from") + 4:].strip()

            g1_clean = re.sub(r'^(?:plan\s+)?(?:a\s+)?(?:\d+-day\s+)?(?:trip\s+)?(?:flight\s+)?', '', g1, flags=re.IGNORECASE).strip()
            g2_clean = re.sub(r'^(?:a\s+)?(?:\d+-day\s+)?', '', g2, flags=re.IGNORECASE).strip()
            
            if g1_clean and len(g1_clean) >= 3:
                origin = g1_clean.title()
            if g2_clean and len(g2_clean) >= 3:
                destination = g2_clean.title()
        else:
            city_positions = []
            for city in POPULAR_CITIES:
                match = re.search(r'\b' + re.escape(city) + r'\b', prompt_clean, re.IGNORECASE)
                if match:
                    city_positions.append((match.start(), city))
            city_positions.sort(key=lambda x: x[0])
            
            if len(city_positions) >= 2:
                origin = city_positions[0][1]
                destination = city_positions[1][1]
            elif len(city_positions) == 1:
                destination = city_positions[0][1]

        days_match = re.search(r'(\d+)\s*(?:day|days|d\b)', prompt_clean, re.IGNORECASE)
        if days_match:
            try:
                days = max(1, min(14, int(days_match.group(1))))
            except Exception:
                pass

        travelers_match = re.search(r'(\d+)\s*(?:people|travelers|passengers|guests|person|adults)', prompt_clean, re.IGNORECASE)
        if travelers_match:
            try:
                travelers = max(1, min(10, int(travelers_match.group(1))))
            except Exception:
                pass

        budget_match = re.search(r'(?:₹|\$|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d{4,7}|\d+k)\b', prompt_clean, re.IGNORECASE)
        if budget_match:
            val_str = budget_match.group(1).lower().replace(',', '')
            try:
                if 'k' in val_str:
                    budget = float(val_str.replace('k', '')) * 1000
                else:
                    budget = float(val_str)
            except Exception:
                pass

        return {
            "origin": origin,
            "destination": destination,
            "days": days,
            "travelers": travelers,
            "budget": budget,
            "makeCheaper": make_cheaper
        }

    async def process_chat(self, prompt: str, conversation_history: List[Dict[str, str]] = []) -> Dict[str, Any]:
        prompt_lower = prompt.lower().strip()

        # A. BOOKING INTENT CLASSIFICATION
        is_booking_req = any(kw in prompt_lower for kw in ["book", "reserve", "checkout", "buy", "confirm booking"])
        
        # B. EXPLICIT TRIP PLAN INTENT
        is_explicit_trip_req = any(kw in prompt_lower for kw in [
            "plan a trip", "plan trip", "trip plan", "itinerary", "full trip", 
            "4 day", "3 day", "5 day", "2 day", "custom trip", "create trip", "create plan"
        ])

        # C. FLIGHT SEARCH ONLY INTENT
        is_flight_search_only = any(kw in prompt_lower for kw in [
            "flight", "flights", "airline", "airfare", "cheap flight", "cheaper flight", "cheaper flights", 
            "flights from", "flight from", "flight to", "flights to", "cheapest flight", "cheapest flights", "more cheaper flights"
        ]) and not is_explicit_trip_req and not is_booking_req

        # D. HOTEL SEARCH ONLY INTENT
        is_hotel_search_only = any(kw in prompt_lower for kw in [
            "hotel", "hotels", "resort", "resorts", "place to stay", "places to stay", "room", "rooms"
        ]) and not is_explicit_trip_req and not is_booking_req and not is_flight_search_only

        # --- EXECUTE BOOKING REQUEST ---
        if is_booking_req:
            is_hotel_booking = any(kw in prompt_lower for kw in ["hotel", "room", "stay", "resort", "inn", "suite"])
            is_flight_booking = any(kw in prompt_lower for kw in ["flight", "airline", "ticket", "plane", "fly"])

            if is_hotel_booking or (not is_flight_booking and self.last_hotels and not self.last_flights):
                hotel = None
                
                # Check for explicit index e.g. "book hotel 2"
                idx_match = re.search(r'\b(?:hotel|room|option)\s*(\d+)\b', prompt_lower)
                if idx_match and self.last_hotels:
                    idx = int(idx_match.group(1)) - 1
                    if 0 <= idx < len(self.last_hotels):
                        hotel = self.last_hotels[idx]
                
                if not hotel and self.last_hotels:
                    hotel = self.last_hotels[0]
                
                if not hotel and self.last_plan and self.last_plan.get("hotelOffer"):
                    hotel = self.last_plan.get("hotelOffer")

                if not hotel:
                    dest = self.last_destination or "Goa"
                    searched = hotel_service.search_hotels(city=dest, sort_by="cheapest")
                    hotel = searched[0] if searched else {
                        "id": f"hotel_{dest.lower()[:3]}_101",
                        "name": f"Luxury Hotel & Spa {dest}",
                        "location": dest,
                        "totalPrice": 4500
                    }

                query_str = f"type=HOTEL&offerId={hotel.get('id')}&amount={hotel.get('totalPrice', 4500)}&details={json.dumps(hotel)}"
                redirect_url = f"/checkout?{query_str}"

                return {
                    "response": f"I'm executing your hotel booking for {hotel.get('name')} in {hotel.get('location')} (Total: ₹{hotel.get('totalPrice', 4500):,}). Redirecting you to checkout for payment authorization now!",
                    "actions": ["Recognized HOTEL booking request", f"Prepared hotel offer payload for {hotel.get('name')}", "Redirecting to checkout..."],
                    "redirectUrl": redirect_url,
                    "plan": self.last_plan
                }

            else:
                flight = None
                
                idx_match = re.search(r'\b(?:flight|ticket|option)\s*(\d+)\b', prompt_lower)
                if idx_match and self.last_flights:
                    idx = int(idx_match.group(1)) - 1
                    if 0 <= idx < len(self.last_flights):
                        flight = self.last_flights[idx]

                if not flight and self.last_flights:
                    flight = self.last_flights[0]

                if not flight and self.last_plan and self.last_plan.get("flightOffer"):
                    flight = self.last_plan.get("flightOffer")

                if not flight:
                    orig = self.last_origin or "Delhi"
                    dest = self.last_destination or "Goa"
                    searched = flight_service.search_flights(
                        origin=orig,
                        destination=dest,
                        departure_date="2026-10-12",
                        passengers=1,
                        sort_by="cheapest"
                    )
                    flight = searched[0] if searched else {
                        "id": f"fl_{orig.lower()[:3]}_{dest.lower()[:3]}_101",
                        "airline": "IndiGo",
                        "flightNumber": "6E-204",
                        "origin": orig,
                        "destination": dest,
                        "price": 3800
                    }

                query_str = f"type=FLIGHT&offerId={flight.get('id')}&amount={flight.get('price', 3800)}&details={json.dumps(flight)}"
                redirect_url = f"/checkout?{query_str}"

                return {
                    "response": f"I'm executing your flight booking on {flight.get('airline')} ({flight.get('flightNumber')}) from {flight.get('origin')} to {flight.get('destination')} for ₹{flight.get('price', 3800):,}. Redirecting you to checkout for payment authorization now!",
                    "actions": ["Recognized FLIGHT booking request", f"Prepared Duffel flight offer payload for {flight.get('airline')}", "Redirecting to checkout..."],
                    "redirectUrl": redirect_url,
                    "plan": self.last_plan
                }

        # C. FLIGHT SEARCH ONLY RESPONSE
        if is_flight_search_only:
            intent = self.parse_travel_intent(prompt)
            origin = intent["origin"]
            destination = intent["destination"]

            is_cheapest_query = any(kw in prompt_lower for kw in [
                "cheapest", "cheaper flight", "cheaper flights", "more cheaper", 
                "lowest price", "cheap flight", "cheap flights", "low fare", "lowest fare"
            ])

            flights = flight_service.search_flights(
                origin=origin,
                destination=destination,
                departure_date="2026-10-12",
                passengers=1,
                sort_by="cheapest"
            )

            if is_cheapest_query and flights:
                min_price = flights[0]["price"]
                # Keep only the absolute cheapest flight options (within 10% of min_price or top 2 cheapest)
                cheapest_flights = [f for f in flights if f["price"] <= min_price * 1.10][:2]
                if not cheapest_flights:
                    cheapest_flights = [flights[0]]
                selected_flights = cheapest_flights
                resp_heading = f"Here are the absolute cheapest flight options available from {origin} to {destination} (starting at ₹{min_price:,}):\n\n"
            else:
                selected_flights = flights[:3]
                resp_heading = f"Here are top flight options from {origin} to {destination}:\n\n"

            self.last_flights = selected_flights
            self.last_origin = origin
            self.last_destination = destination

            resp_text = resp_heading
            for idx, f in enumerate(selected_flights, 1):
                dep = f.get('departureTime', '').split('T')[-1][:5] if f.get('departureTime') else ""
                arr = f.get('arrivalTime', '').split('T')[-1][:5] if f.get('arrivalTime') else ""
                timing_str = f" • 🕒 {dep} - {arr}" if dep and arr else ""
                resp_text += f"{idx}. {f['airline']} ({f['flightNumber']}) — ₹{f['price']:,}\n   • {f['origin']} ➔ {f['destination']}{timing_str} ({f['duration']})\n\n"
            resp_text += "Click 'Book Flight' below on your preferred option to proceed to checkout!"

            return {
                "response": resp_text,
                "actions": [
                    f"Identified {'cheapest' if is_cheapest_query else 'standard'} flight query: {origin} ➔ {destination}...",
                    f"Querying Duffel flight engine for lowest fares...",
                    f"Found {len(selected_flights)} flight offer(s)..."
                ],
                "flights": selected_flights,
                "plan": self.last_plan
            }

        # D. HOTEL SEARCH ONLY RESPONSE
        if is_hotel_search_only:
            intent = self.parse_travel_intent(prompt)
            destination = intent["destination"]

            is_cheapest_query = any(kw in prompt_lower for kw in [
                "cheapest", "cheaper hotel", "cheaper hotels", "more cheaper", 
                "lowest price", "cheap hotel", "cheap hotels", "low fare", "lowest fare"
            ])

            hotels = hotel_service.search_hotels(
                city=destination,
                guests=1,
                nights=3,
                sort_by="cheapest"
            )

            if is_cheapest_query and hotels:
                min_price = hotels[0]["totalPrice"]
                cheapest_hotels = [h for h in hotels if h["totalPrice"] <= min_price * 1.25][:2]
                if not cheapest_hotels:
                    cheapest_hotels = [hotels[0]]
                selected_hotels = cheapest_hotels
                resp_heading = f"Here are the absolute cheapest hotel options available in {destination} (starting at ₹{min_price:,}):\n\n"
            else:
                selected_hotels = hotels[:3]
                resp_heading = f"Here are top recommended hotels in {destination}:\n\n"

            self.last_hotels = selected_hotels
            self.last_destination = destination

            resp_text = resp_heading
            for idx, h in enumerate(selected_hotels, 1):
                resp_text += f"{idx}. {h['name']} — ₹{h['totalPrice']:,} ({h['rating']} ★)\n   • Location: {h['location']}\n\n"
            resp_text += "Click 'Book Hotel' below on your preferred option to proceed to checkout!"

            return {
                "response": resp_text,
                "actions": [
                    f"Identified {'cheapest' if is_cheapest_query else 'standard'} hotel search query for {destination}...",
                    f"Searching hotel database for lowest rates...",
                    f"Found {len(selected_hotels)} hotel offer(s)..."
                ],
                "hotels": selected_hotels,
                "plan": self.last_plan
            }

        # E. GENERAL QUESTION / CONVERSATIONAL INTENT
        is_question = any(prompt_lower.startswith(w) for w in ["what", "why", "how", "where", "is", "can", "should", "tell", "which", "hello", "hi"]) or \
                      any(topic in prompt_lower for topic in ["food", "weather", "packing", "places", "attraction", "safety", "timing", "visit", "culture"])

        if is_question and not is_explicit_trip_req:
            curr_dest = self.last_plan.get("destination", "Goa") if self.last_plan else "Goa"
            rag_chunks = rag_engine.query(destination=curr_dest, query_text=prompt, top_k=2)
            rag_text = "\n\n".join([f"• {c['section']}: {c['content']}" for c in rag_chunks]) if rag_chunks else ""

            system_ctx = f"You are JournAI, an expert AI Travel Assistant. Current destination context: {curr_dest}.\nVector Knowledge Base context:\n{rag_text}"
            llm_reply = self.generate_llm_response(prompt=prompt, system_context=system_ctx)

            if not llm_reply:
                if "food" in prompt_lower:
                    llm_reply = f"In {curr_dest}, be sure to try local specialties! {rag_text or 'Explore local markets and authentic regional dining spots.'}"
                elif "weather" in prompt_lower:
                    llm_reply = f"The weather in {curr_dest} is generally pleasant for sightseeing. Check seasonal forecast for rain or heat."
                else:
                    llm_reply = f"Great question about {curr_dest}! {rag_text or 'I recommend visiting top local landmarks and taking evening walks along popular avenues.'}"

            return {
                "response": llm_reply,
                "actions": ["Analyzing question intent...", f"Querying RAG knowledge for {curr_dest}...", "Generating conversational AI response..."],
                "destinationKnowledge": rag_text,
                "plan": self.last_plan
            }

        # F. EXPLICIT TRIP GENERATION / MODIFICATION INTENT
        intent = self.parse_travel_intent(prompt)
        origin = intent["origin"]
        destination = intent["destination"]
        days = intent["days"]
        travelers = intent["travelers"]
        budget = intent["budget"]
        make_cheaper = intent["makeCheaper"]

        action_trace = [
            f"Parsing intent: {origin} ➔ {destination} ({days} days)...",
            f"Searching real flight offers from {origin} to {destination}...",
            f"Comparing available hotel inventory in {destination}...",
            f"Querying RAG destination knowledge base for {destination}...",
            f"Calculating day-by-day budget & itinerary for {travelers} traveler(s)..."
        ]

        plan = itinerary_generator.generate_trip_plan(
            origin=origin,
            destination=destination,
            days=days,
            travelers=travelers,
            budget=budget,
            make_cheaper=make_cheaper
        )
        self.last_plan = plan
        self.last_origin = origin
        self.last_destination = destination

        rag_chunks = rag_engine.query(destination=destination, query_text=prompt, top_k=2)
        rag_text = "\n\n".join([f"• {c['section']}: {c['content']}" for c in rag_chunks]) if rag_chunks else f"Custom travel insights loaded for {destination}."

        flight_options = plan.get("flightOffers", [])
        hotel_options = plan.get("hotelOffers", [])
        self.last_flights = flight_options
        self.last_hotels = hotel_options

        def format_flight_item(f):
            dep = f.get('departureTime', '').split('T')[-1][:5] if f.get('departureTime') else ""
            arr = f.get('arrivalTime', '').split('T')[-1][:5] if f.get('arrivalTime') else ""
            timing_str = f" • 🕒 {dep} - {arr}" if dep and arr else ""
            stops_str = "Non-stop" if f.get("stops", 0) == 0 else f"{f.get('stops')} Stop"
            return f"{f['airline']} ({f['flightNumber']}) — ₹{f['price']:,} ({f['origin']} ➔ {f['destination']}{timing_str} • {f['duration']} • {stops_str})"

        flight_list_str = "\n".join([
            f"   {idx}. {format_flight_item(f)}" 
            for idx, f in enumerate(flight_options, 1)
        ])
        hotel_list_str = "\n".join([
            f"   {idx}. {h['name']} — ₹{h['totalPrice']:,} stay ({h['rating']} ★ • {h['location']})" 
            for idx, h in enumerate(hotel_options, 1)
        ])

        if make_cheaper:
            intro_msg = (
                f"I've dynamically optimized your {days}-day trip from {origin} to {destination} for lower budget!\n\n"
                f"✈️ **Recommended Flight Options (Top {len(flight_options)}):**\n{flight_list_str}\n\n"
                f"🏨 **Recommended Hotel Options (Top {len(hotel_options)}):**\n{hotel_list_str}\n\n"
                f"💰 **Total Estimated Cost:** ₹{plan['budgetBreakdown']['totalEstimatedCost']:,} (Budget: ₹{budget:,.0f})\n"
                f"Select your preferred options below or on the right dashboard to book!"
            )
        else:
            intro_msg = (
                f"I've planned a complete {days}-day trip from {origin} to {destination} within your ₹{budget:,.0f} budget for {travelers} traveler(s)!\n\n"
                f"✈️ **Recommended Flight Options (Top {len(flight_options)}):**\n{flight_list_str}\n\n"
                f"🏨 **Recommended Hotel Options (Top {len(hotel_options)}):**\n{hotel_list_str}\n\n"
                f"💰 **Total Estimated Cost:** ₹{plan['budgetBreakdown']['totalEstimatedCost']:,}\n"
                f"Check out the options below or in your right-hand dashboard to proceed!"
            )

        return {
            "response": intro_msg,
            "actions": action_trace,
            "destinationKnowledge": rag_text,
            "plan": plan,
            "flights": flight_options,
            "hotels": hotel_options,
            "requiresConfirmation": False
        }

agent_controller = AgentController()
