import logging
from typing import List, Dict, Any
from app.services.duffel_service import flight_service
from app.services.hotel_service import hotel_service
from app.rag.vector_store import rag_engine

logger = logging.getLogger(__name__)

class ItineraryGenerator:
    def generate_trip_plan(
        self,
        origin: str,
        destination: str,
        days: int = 4,
        travelers: int = 1,
        budget: float = 30000.0,
        interests: List[str] = [],
        make_cheaper: bool = False
    ) -> Dict[str, Any]:
        
        nights = max(1, days - 1)

        # 1. Search Flights (sorted by cheapest)
        flights = flight_service.search_flights(
            origin=origin,
            destination=destination,
            departure_date="2026-10-12",
            passengers=travelers,
            sort_by="cheapest"
        )
        top_flights = flights[:3] if flights else []
        selected_flight = top_flights[0] if top_flights else None
        flight_cost = selected_flight["price"] if selected_flight else 3500.0 * travelers

        # 2. Dynamic Daily Allocations based on budget scale
        if budget <= 25000:
            food_cost_per_day = 500 * travelers
            transport_cost_per_day = 350 * travelers
            activity_cost_per_day = 400 * travelers
        elif budget <= 50000:
            food_cost_per_day = 800 * travelers
            transport_cost_per_day = 500 * travelers
            activity_cost_per_day = 600 * travelers
        else:
            food_cost_per_day = 1200 * travelers
            transport_cost_per_day = 800 * travelers
            activity_cost_per_day = 1000 * travelers

        total_food = food_cost_per_day * days
        total_transport = transport_cost_per_day * days
        total_activities = activity_cost_per_day * days

        # 3. Calculate remaining budget allowance for hotel stay
        max_affordable_hotel_total = budget - flight_cost - total_food - total_transport - total_activities
        
        # Search Hotels filtered by budget allowance and sorted by cheapest
        hotels = hotel_service.search_hotels(
            city=destination,
            guests=travelers,
            nights=nights,
            max_price=max_affordable_hotel_total if max_affordable_hotel_total > 0 else None,
            sort_by="cheapest"
        )

        if not hotels:
            hotels = hotel_service.search_hotels(
                city=destination,
                guests=travelers,
                nights=nights,
                sort_by="cheapest"
            )

        top_hotels = hotels[:3] if hotels else []
        selected_hotel = top_hotels[0] if top_hotels else None
        hotel_cost = selected_hotel["totalPrice"] if selected_hotel else 2200.0 * nights

        estimated_total = flight_cost + hotel_cost + total_food + total_transport + total_activities
        remaining_budget = budget - estimated_total
        is_over_budget = estimated_total > budget

        # 4. Retrieve RAG grounded information
        rag_context = rag_engine.query(destination=destination, query_text="attractions food tips", top_k=2)
        rag_highlights = [c["text"] for c in rag_context]

        # 5. Build Day-by-Day Itinerary dynamically for any duration (1..N days)
        dest_clean = destination.capitalize()
        days_itinerary = []

        for d in range(1, days + 1):
            if d == 1:
                title = f"Arrival in {dest_clean} & Sunset Exploration"
                schedule = [
                    {"time": "09:05 AM", "activity": "Arrival at Airport", "description": f"Land via {selected_flight['airline'] if selected_flight else 'flight'} and take prepaid taxi to hotel.", "cost": 600, "type": "transport"},
                    {"time": "12:00 PM", "activity": "Hotel Check-in", "description": f"Check in at {selected_hotel['name'] if selected_hotel else 'Resort'} & freshen up.", "cost": 0, "type": "stay"},
                    {"time": "02:00 PM", "activity": "Local Lunch", "description": f"Enjoy regional authentic cuisine in {dest_clean}.", "cost": 400 * travelers, "type": "food"},
                    {"time": "05:30 PM", "activity": "Sunset Walk & Sightseeing", "description": "Relax along popular avenues/promenades and take in sunset views.", "cost": 200, "type": "activity"}
                ]
            elif d == days:
                title = f"Souvenir Shopping & Departure from {dest_clean}"
                schedule = [
                    {"time": "10:00 AM", "activity": "Breakfast & Hotel Checkout", "description": "Pack belongings and complete checkout formalities.", "cost": 0, "type": "stay"},
                    {"time": "11:30 AM", "activity": "Last Minute Souvenir Pickups", "description": "Buy local handicrafts, sweets, spices, and gifts.", "cost": 300, "type": "activity"},
                    {"time": "02:00 PM", "activity": "Airport Transfer & Departure", "description": "Take taxi to airport for return flight home.", "cost": 600, "type": "transport"}
                ]
            elif d == 2:
                title = f"Heritage Forts & Sightseeing in {dest_clean}"
                schedule = [
                    {"time": "09:00 AM", "activity": "Fort & Heritage Site Visit", "description": "Explore historical architecture and panoramic view points.", "cost": 300 * travelers, "type": "activity"},
                    {"time": "01:00 PM", "activity": "Traditional Buffet Lunch", "description": "Savor authentic regional flavors and herbal teas.", "cost": 600 * travelers, "type": "food"},
                    {"time": "04:30 PM", "activity": "Shopping & Local Markets", "description": "Browse handcrafted souvenirs, spices, and local textiles.", "cost": 500, "type": "activity"}
                ]
            elif d == 3:
                title = f"Outdoor Adventure & Local Attractions"
                schedule = [
                    {"time": "09:30 AM", "activity": "Water Sports & Nature Activities", "description": "Enjoy scenic outdoor excursions and boat/valley tours.", "cost": 1200 * travelers, "type": "activity"},
                    {"time": "02:00 PM", "activity": "Beach/Riverside Dining", "description": "Chill at local scenic cafes with regional beverages.", "cost": 500 * travelers, "type": "food"},
                    {"time": "08:00 PM", "activity": "Evening Music & Dinner", "description": "Experience vibrant nightlife or peaceful waterfront dining.", "cost": 800 * travelers, "type": "food"}
                ]
            elif d == 4:
                title = f"Day Excursion & Countryside Tour"
                schedule = [
                    {"time": "09:00 AM", "activity": "Scenic Countryside & Village Tour", "description": "Visit nearby artisanal villages, waterfalls, or tea/spice gardens.", "cost": 700 * travelers, "type": "activity"},
                    {"time": "01:30 PM", "activity": "Farm-to-Table Lunch", "description": "Organic local produce dining in a scenic setting.", "cost": 550 * travelers, "type": "food"},
                    {"time": "06:00 PM", "activity": "Sunset Viewpoint & Lounge", "description": "Relax at hill/coast view lounge for dusk photography.", "cost": 400, "type": "activity"}
                ]
            elif d == 5:
                title = f"Wellness, Spa & Hidden Gem Exploration"
                schedule = [
                    {"time": "10:00 AM", "activity": "Ayurvedic Spa & Wellness Session", "description": "Rejuvenate with traditional massages and wellness treatments.", "cost": 1500 * travelers, "type": "activity"},
                    {"time": "02:00 PM", "activity": "Culinary Masterclass & Food Tour", "description": "Join guided food walk discovering hidden local eateries.", "cost": 600 * travelers, "type": "food"},
                    {"time": "07:30 PM", "activity": "Cultural Music & Dinner Night", "description": "Dine while enjoying live traditional music performances.", "cost": 900 * travelers, "type": "food"}
                ]
            elif d == 6:
                title = f"Local Offbeat Sights & Scenic Cruise"
                schedule = [
                    {"time": "09:30 AM", "activity": "Nature Trails & Wildlife Sanctuary", "description": "Morning nature walk or river boat cruise.", "cost": 800 * travelers, "type": "activity"},
                    {"time": "01:30 PM", "activity": "Panoramic Restaurant Lunch", "description": "Enjoy lunch overlooking scenic landscapes.", "cost": 600 * travelers, "type": "food"},
                    {"time": "05:00 PM", "activity": "Leisure Stroll & Cafe Hopping", "description": "Explore artisan coffee shops and boutique stores.", "cost": 350, "type": "activity"}
                ]
            else:
                title = f"Personal Exploration & Scenic Leisure (Day {d})"
                schedule = [
                    {"time": "10:00 AM", "activity": "Museum & Art Gallery Visit", "description": "Discover regional art, photography, and history.", "cost": 400 * travelers, "type": "activity"},
                    {"time": "01:00 PM", "activity": "Casual Local Lunch", "description": "Taste street food delicacies and local dessert.", "cost": 450 * travelers, "type": "food"},
                    {"time": "05:30 PM", "activity": "Sunset Promenade & Leisure", "description": "Relaxed evening walk and souvenir shopping.", "cost": 300, "type": "activity"}
                ]

            days_itinerary.append({
                "day": d,
                "title": title,
                "schedule": schedule
            })

        # Cost Breakdown Summary
        budget_breakdown = {
            "flight": flight_cost,
            "hotel": hotel_cost,
            "food": total_food,
            "transport": total_transport,
            "activities": total_activities,
            "totalEstimatedCost": estimated_total,
            "userBudget": budget,
            "remainingBudget": remaining_budget,
            "isOverBudget": is_over_budget
        }

        cheaper_suggestions = []
        if len(top_flights) > 1 and top_flights[0]["price"] < top_flights[-1]["price"]:
            savings = top_flights[-1]["price"] - top_flights[0]["price"]
            cheaper_suggestions.append(f"Opted for lowest fare flight on {top_flights[0]['airline']} ({top_flights[0]['flightNumber']}) saving ₹{savings:,}.")
        
        if len(top_hotels) > 1 and top_hotels[0]["totalPrice"] < top_hotels[-1]["totalPrice"]:
            hotel_savings = top_hotels[-1]["totalPrice"] - top_hotels[0]["totalPrice"]
            cheaper_suggestions.append(f"Selected budget-friendly stay at {top_hotels[0]['name']} saving ₹{hotel_savings:,}.")

        if is_over_budget:
            cheaper_suggestions.append("Consider reducing trip duration by 1 day or opting for train transfers.")

        return {
            "tripId": f"trip_gen_{destination.lower()[:3]}_{days}d",
            "origin": origin,
            "destination": dest_clean,
            "durationDays": days,
            "travelers": travelers,
            "flightOffer": selected_flight,
            "flightOffers": top_flights,
            "hotelOffer": selected_hotel,
            "hotelOffers": top_hotels,
            "budgetBreakdown": budget_breakdown,
            "itinerary": days_itinerary,
            "ragKnowledgeHighlights": rag_highlights,
            "cheaperSuggestions": cheaper_suggestions
        }

itinerary_generator = ItineraryGenerator()
