import logging
import uuid
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

HOTEL_DATABASE = [
    # Jaipur Hotels (Luxury & Moderate Range)
    {
        "id": "ht_jaipur_01",
        "name": "Haveli Heritage Inn",
        "city": "Jaipur",
        "location": "Old Pink City, Jaipur",
        "rating": 4.4,
        "pricePerNight": 2200,
        "amenities": ["Rooftop Restaurant", "Cultural Shows", "Free WiFi", "Courtyard"],
        "roomType": "Traditional Heritage Room",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_jaipur_02",
        "name": "Pink City Boutique Hotel",
        "city": "Jaipur",
        "location": "MI Road, Jaipur",
        "rating": 4.3,
        "pricePerNight": 1800,
        "amenities": ["Free Breakfast", "Air Conditioning", "Free WiFi", "Travel Desk"],
        "roomType": "Deluxe Queen Room",
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_jaipur_03",
        "name": "Royal Orchid Jaipur",
        "city": "Jaipur",
        "location": "Tonk Road, Jaipur",
        "rating": 4.6,
        "pricePerNight": 3400,
        "amenities": ["Rooftop Pool", "Fitness Center", "Multi-cuisine Restaurant", "Free WiFi"],
        "roomType": "Executive King Suite",
        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 48 hours before check-in"
    },
    {
        "id": "ht_jaipur_04",
        "name": "Rambagh Palace Jaipur",
        "city": "Jaipur",
        "location": "Bhawani Singh Road, Jaipur",
        "rating": 5.0,
        "pricePerNight": 28000,
        "amenities": ["Royal Gardens", "Indoor/Outdoor Pool", "Heritage Spa", "Butler Service"],
        "roomType": "Palace Room",
        "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 7 days before check-in"
    },
    # Delhi Hotels
    {
        "id": "ht_delhi_01",
        "name": "Connaught Place Comfort Inn",
        "city": "Delhi",
        "location": "Connaught Place, New Delhi",
        "rating": 4.4,
        "pricePerNight": 2500,
        "amenities": ["Free WiFi", "Breakfast Included", "Airport Shuttle", "Air Conditioning"],
        "roomType": "Deluxe Double Room",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_delhi_02",
        "name": "Aerocity Boutique Stays",
        "city": "Delhi",
        "location": "Aerocity, Indira Gandhi International Airport",
        "rating": 4.5,
        "pricePerNight": 3200,
        "amenities": ["Soundproof Rooms", "Fitness Center", "Free Airport Transfer", "Free WiFi"],
        "roomType": "Executive Suite",
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_delhi_03",
        "name": "Red Fort Heritage Palace",
        "city": "Delhi",
        "location": "Old Delhi Heritage District",
        "rating": 4.3,
        "pricePerNight": 1900,
        "amenities": ["Rooftop Dining", "Historical Guided Walks", "Free WiFi", "Air Conditioning"],
        "roomType": "Traditional Heritage Room",
        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    # Lucknow Hotels
    {
        "id": "ht_lucknow_01",
        "name": "Awadh Heritage Hotel",
        "city": "Lucknow",
        "location": "Hazratganj, Lucknow",
        "rating": 4.5,
        "pricePerNight": 2200,
        "amenities": ["Authentic Awadhi Restaurant", "Free Breakfast", "Free WiFi", "Central Location"],
        "roomType": "Heritage Deluxe Room",
        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_lucknow_02",
        "name": "Gomti Nagar Residency",
        "city": "Lucknow",
        "location": "Gomti Nagar, Lucknow",
        "rating": 4.2,
        "pricePerNight": 1900,
        "amenities": ["Free WiFi", "Air Conditioning", "Room Service", "Parking"],
        "roomType": "Standard Double Room",
        "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_lucknow_03",
        "name": "Nawab Palace Hotel & Spa",
        "city": "Lucknow",
        "location": "Charbagh, Lucknow",
        "rating": 4.6,
        "pricePerNight": 2900,
        "amenities": ["Royal Dining", "Spa & Wellness", "Free WiFi", "Airport Transfer"],
        "roomType": "Nawabi Executive Suite",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 48 hours before check-in"
    },
    # Mumbai Hotels
    {
        "id": "ht_mumbai_01",
        "name": "Marine Bay Comfort Inn",
        "city": "Mumbai",
        "location": "Marine Drive, South Mumbai",
        "rating": 4.4,
        "pricePerNight": 3500,
        "amenities": ["Sea View", "Rooftop Cafe", "Free WiFi", "Air Conditioning"],
        "roomType": "Sea View Queen Room",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 48 hours before check-in"
    },
    {
        "id": "ht_mumbai_02",
        "name": "Suburban Eco Residency",
        "city": "Mumbai",
        "location": "Bandra West, Mumbai",
        "rating": 4.3,
        "pricePerNight": 2400,
        "amenities": ["Free WiFi", "Cafe", "Travel Desk", "Air Conditioning"],
        "roomType": "Deluxe Room",
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_mumbai_03",
        "name": "Juhu Beachfront Suites",
        "city": "Mumbai",
        "location": "Juhu Beach, Mumbai",
        "rating": 4.5,
        "pricePerNight": 3100,
        "amenities": ["Beach View", "Swimming Pool", "Free Breakfast", "Bar"],
        "roomType": "Ocean Deluxe King",
        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    # Goa Hotels
    {
        "id": "ht_goa_04",
        "name": "Palolem Sunset Beach Cottages",
        "city": "Goa",
        "location": "Palolem Beach, South Goa",
        "rating": 4.6,
        "pricePerNight": 1800,
        "amenities": ["Beachfront Huts", "Sea View", "Yoga Lawn", "Free WiFi", "Restaurant"],
        "roomType": "Beachfront Bamboo Cottage",
        "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 7 days before check-in"
    },
    {
        "id": "ht_goa_03",
        "name": "Goa Palms Boutique Resort",
        "city": "Goa",
        "location": "Anjuna, North Goa",
        "rating": 4.5,
        "pricePerNight": 2100,
        "amenities": ["Garden Pool", "Free Breakfast", "Scooter Rental", "Free WiFi", "Bar"],
        "roomType": "Superior King Room",
        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Non-refundable promo rate"
    },
    {
        "id": "ht_goa_02",
        "name": "Calangute Beach Haven Resort",
        "city": "Goa",
        "location": "Calangute Beach Road, North Goa",
        "rating": 4.3,
        "pricePerNight": 3200,
        "amenities": ["Swimming Pool", "Restaurant & Bar", "Free WiFi", "Air Conditioning", "Beach Access"],
        "roomType": "Standard Double Room",
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_goa_01",
        "name": "Taj Fort Aguada Resort & Spa",
        "city": "Goa",
        "location": "Sinquerim, Candolim, North Goa",
        "rating": 4.9,
        "pricePerNight": 12500,
        "amenities": ["Infinity Pool", "Private Beach", "Spa", "Free WiFi", "Breakfast Included", "Ocean View"],
        "roomType": "Deluxe Sea View Room",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 48 hours before check-in"
    },
    # Manali Hotels
    {
        "id": "ht_manali_02",
        "name": "Pine Valley Mountain Resort",
        "city": "Manali",
        "location": "Solang Valley Road, Manali",
        "rating": 4.2,
        "pricePerNight": 2400,
        "amenities": ["Balcony Views", "Restaurant", "Free WiFi", "Travel Desk"],
        "roomType": "Deluxe Mountain View Room",
        "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_manali_03",
        "name": "Snow Peaks Alpine Inn",
        "city": "Manali",
        "location": "Mall Road, Manali",
        "rating": 4.4,
        "pricePerNight": 1950,
        "amenities": ["Central Heating", "Mountain View", "Free Breakfast", "Free WiFi"],
        "roomType": "Standard Double Room",
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
    },
    {
        "id": "ht_manali_01",
        "name": "The Himalayan Luxury Resort & Spa",
        "city": "Manali",
        "location": "Hadimba Temple Road, Old Manali",
        "rating": 4.8,
        "pricePerNight": 8500,
        "amenities": ["Heated Pool", "Mountain View", "Fireplace", "Spa", "Fine Dining"],
        "roomType": "Grand Victorian Suite",
        "image": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&auto=format&fit=crop&q=80",
        "cancellationPolicy": "Free cancellation up to 72 hours before check-in"
    }
]

class HotelService:
    def search_hotels(
        self,
        city: str,
        guests: int = 1,
        rooms: int = 1,
        nights: int = 3,
        min_rating: Optional[float] = None,
        max_price: Optional[float] = None,
        amenities_filter: List[str] = [],
        sort_by: str = "recommended"
    ) -> List[Dict[str, Any]]:
        
        city_clean = city.strip().lower()
        results = []

        for hotel in HOTEL_DATABASE:
            # Check city match or wildcard
            if city_clean in hotel["city"].lower() or hotel["city"].lower() in city_clean:
                # Calculate total stay price
                stay_price = hotel["pricePerNight"] * nights
                
                if max_price and stay_price > max_price:
                    continue
                if min_rating and hotel["rating"] < min_rating:
                    continue
                if amenities_filter:
                    match_all = all(a.lower() in [h.lower() for h in hotel["amenities"]] for a in amenities_filter)
                    if not match_all:
                        continue

                hotel_copy = hotel.copy()
                hotel_copy["nights"] = nights
                hotel_copy["totalPrice"] = stay_price
                results.append(hotel_copy)

        # Fallback if no matching city in static database: generate dynamic options
        if not results:
            results = [
                {
                    "id": f"ht_{city_clean}_dyn1",
                    "name": f"{city.capitalize()} Grand Residency",
                    "city": city.capitalize(),
                    "location": f"Central District, {city.capitalize()}",
                    "rating": 4.5,
                    "pricePerNight": 3500,
                    "nights": nights,
                    "totalPrice": 3500 * nights,
                    "amenities": ["Swimming Pool", "Restaurant", "Free WiFi", "Breakfast Included"],
                    "roomType": "Executive Deluxe Room",
                    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
                    "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
                },
                {
                    "id": f"ht_{city_clean}_dyn2",
                    "name": f"{city.capitalize()} Eco Boutique Resort",
                    "city": city.capitalize(),
                    "location": f"Scenic Valley, {city.capitalize()}",
                    "rating": 4.2,
                    "pricePerNight": 2100,
                    "nights": nights,
                    "totalPrice": 2100 * nights,
                    "amenities": ["Garden View", "Free Breakfast", "Free WiFi", "Spa"],
                    "roomType": "Standard King Room",
                    "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
                    "cancellationPolicy": "Free cancellation up to 48 hours before check-in"
                },
                {
                    "id": f"ht_{city_clean}_dyn3",
                    "name": f"{city.capitalize()} Heritage Haveli & Spa",
                    "city": city.capitalize(),
                    "location": f"Historic Center, {city.capitalize()}",
                    "rating": 4.6,
                    "pricePerNight": 2800,
                    "nights": nights,
                    "totalPrice": 2800 * nights,
                    "amenities": ["Rooftop Restaurant", "Spa", "Free WiFi", "Pool"],
                    "roomType": "Deluxe Heritage Suite",
                    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
                    "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
                }
            ]

        # Sorting
        if sort_by == "cheapest":
            results.sort(key=lambda x: x["totalPrice"])
        elif sort_by == "rating":
            results.sort(key=lambda x: x["rating"], reverse=True)
        elif sort_by == "expensive":
            results.sort(key=lambda x: x["totalPrice"], reverse=True)

        return results

    def get_hotel_details(self, hotel_id: str) -> Optional[Dict[str, Any]]:
        for hotel in HOTEL_DATABASE:
            if hotel["id"] == hotel_id:
                hotel_copy = hotel.copy()
                hotel_copy["nights"] = 3
                hotel_copy["totalPrice"] = hotel["pricePerNight"] * 3
                return hotel_copy
        # Dynamic fallback detail
        return {
            "id": hotel_id,
            "name": "Luxury Beach & Spa Resort",
            "city": "Goa",
            "location": "North Goa Coast",
            "rating": 4.6,
            "pricePerNight": 2800,
            "nights": 3,
            "totalPrice": 8400,
            "amenities": ["Infinity Pool", "Free Breakfast", "Free WiFi", "Beach Access"],
            "roomType": "Deluxe Ocean View Suite",
            "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
            "cancellationPolicy": "Free cancellation up to 24 hours before check-in"
        }

hotel_service = HotelService()
