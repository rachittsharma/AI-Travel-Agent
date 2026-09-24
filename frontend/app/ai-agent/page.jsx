'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { aiAPI } from '@/services/api';
import { Bot, Mic, MicOff, Send, Sparkles, Plane, Hotel, Calendar, Volume2, RefreshCw, Clock } from 'lucide-react';

function AIAgentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentActions, setCurrentActions] = useState([]);
  const [activePlan, setActivePlan] = useState(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const dest = searchParams.get('destination');
    const origin = searchParams.get('origin') || 'Delhi';
    const budget = searchParams.get('budget') || '30000';
    
    if (dest) {
      const initialPrompt = `Plan a 4-day trip from ${origin} to ${dest}. My budget is ₹${budget}. I like beaches, sightseeing, and local food.`;
      handleSendMessage(initialPrompt);
    } else {
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'ai',
          text: "Hello! I am your autonomous AI Travel Assistant. Where would you like to travel? Try typing or talking to me: 'Plan a 4-day trip to Goa under ₹30,000'.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentActions]);

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please type your query.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = (err) => {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setPrompt('');
    setLoading(true);

    const simulatedActions = [
      "Parsing user travel intent...",
      "Searching flights with Duffel Engine...",
      "Comparing hotel offers & guest ratings...",
      "Querying RAG destination knowledge base...",
      "Generating day-by-day itinerary & budget breakdown..."
    ];

    setCurrentActions([]);
    for (let i = 0; i < simulatedActions.length; i++) {
      await new Promise((res) => setTimeout(res, 350));
      setCurrentActions((prev) => [...prev, simulatedActions[i]]);
    }

    try {
      const res = await aiAPI.chat(textToSend, messages.map(m => ({ role: m.sender, content: m.text })));
      
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.response,
        actions: res.actions,
        plan: res.plan,
        flights: res.flights,
        hotels: res.hotels,
        knowledge: res.destinationKnowledge,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (res.plan) setActivePlan(res.plan);
      speakText(res.response);

      if (res.redirectUrl) {
        setTimeout(() => {
          router.push(res.redirectUrl);
        }, 1800);
      }
    } catch (err) {
      console.error('AI agent chat failed', err);
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: "I encountered an issue processing your request. Please check your network connection or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setCurrentActions([]);
    }
  };

  const handleBookFlightClick = (flight) => {
    const query = new URLSearchParams({
      type: 'FLIGHT',
      offerId: flight.id,
      amount: flight.price.toString(),
      details: JSON.stringify(flight)
    }).toString();
    router.push(`/checkout?${query}`);
  };

  const handleBookHotelClick = (hotel) => {
    const query = new URLSearchParams({
      type: 'HOTEL',
      offerId: hotel.id,
      amount: hotel.totalPrice.toString(),
      details: JSON.stringify(hotel)
    }).toString();
    router.push(`/checkout?${query}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-6rem)]">
      
      {/* Left Chat Column */}
      <div className="lg:col-span-6 flex flex-col glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden h-full">
        
        {/* Assistant Header */}
        <div className="p-4 sm:p-5 bg-dark-bg/90 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-[2px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-dark-bg rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-white text-base">JournAI Assistant</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Gemini 2.5 Flash + RAG Vector Engine</span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleVoiceInput}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isListening
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? 'Listening...' : '🎙 Talk to AI'}</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-dark-card border border-dark-border text-slate-100 rounded-tl-none'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10 text-xs font-semibold text-sky-400">
                    <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> AI Response</span>
                    <button onClick={() => speakText(msg.text)} className="text-slate-400 hover:text-white" title="Read aloud">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.flights && msg.flights.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.flights.map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-sky-400" /> {f.airline} ({f.flightNumber})
                          </div>
                          <div className="text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{f.origin} ➔ {f.destination}</span>
                            {(f.departureTime || f.departure_time) && (
                              <>
                                <span>•</span>
                                <span className="text-sky-300 font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-sky-400" />
                                  {(f.departureTime || f.departure_time).includes('T') ? (f.departureTime || f.departure_time).split('T')[1].substring(0, 5) : (f.departureTime || f.departure_time)}
                                  {(f.arrivalTime || f.arrival_time) ? ` - ${(f.arrivalTime || f.arrival_time).includes('T') ? (f.arrivalTime || f.arrival_time).split('T')[1].substring(0, 5) : (f.arrivalTime || f.arrival_time)}` : ''}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>{f.duration}</span>
                            {f.stops !== undefined && (
                              <>
                                <span>•</span>
                                <span>{f.stops === 0 ? 'Non-stop' : `${f.stops} Stop`}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-bold text-emerald-400 text-sm">₹{f.price?.toLocaleString()}</div>
                          <button
                            onClick={() => handleBookFlightClick(f)}
                            className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px]"
                          >
                            Book Flight
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.hotels && msg.hotels.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.hotels.map((h, i) => (
                      <div key={i} className="p-3 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            <Hotel className="w-3.5 h-3.5 text-indigo-400" /> {h.name}
                          </div>
                          <div className="text-slate-400 mt-0.5">{h.location} • {h.rating} ★</div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-bold text-emerald-400 text-sm">₹{h.totalPrice?.toLocaleString()}</div>
                          <button
                            onClick={() => handleBookHotelClick(h)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                          >
                            Book Hotel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.knowledge && (
                  <div className="mt-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200">
                    <span className="font-bold text-sky-400 block mb-1">📖 RAG Knowledge Insights:</span>
                    <p className="whitespace-pre-line text-slate-300">{msg.knowledge}</p>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && currentActions.length > 0 && (
            <div className="p-3 rounded-2xl bg-dark-card/90 border border-sky-500/30 space-y-1.5 animate-pulse">
              <div className="text-xs font-bold text-sky-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Agent Processing Actions...</span>
              </div>
              {currentActions.map((act, idx) => (
                <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5 pl-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Controls */}
        <div className="p-3 sm:p-4 bg-dark-bg/90 border-t border-dark-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Plan a 4-day Goa trip under ₹30,000' or 'Make it cheaper'..."
              className="flex-1 px-4 py-3 rounded-2xl bg-dark-card border border-dark-border text-white text-sm outline-none focus:border-sky-500 transition-all"
            />
            
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 disabled:opacity-40 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Action Pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => handleSendMessage('Plan a 4-day trip from Lucknow to Mumbai under ₹25,000')}
              className="px-3 py-1 rounded-full bg-dark-card border border-dark-border text-slate-300 hover:border-sky-500/50 hover:text-white whitespace-nowrap transition-all"
            >
              🏙 Lucknow ➔ Mumbai (₹25k)
            </button>
            <button
              onClick={() => handleSendMessage('Plan a 4-day trip from Delhi to Bangalore under ₹30,000')}
              className="px-3 py-1 rounded-full bg-dark-card border border-dark-border text-slate-300 hover:border-sky-500/50 hover:text-white whitespace-nowrap transition-all"
            >
              🌆 Delhi ➔ Bangalore (₹30k)
            </button>
            <button
              onClick={() => handleSendMessage('Plan a 4-day trip from Delhi to Goa under ₹30,000')}
              className="px-3 py-1 rounded-full bg-dark-card border border-dark-border text-slate-300 hover:border-sky-500/50 hover:text-white whitespace-nowrap transition-all"
            >
              🏖 Delhi ➔ Goa (₹30k)
            </button>
            <button
              onClick={() => handleSendMessage('Book the flight')}
              className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 whitespace-nowrap transition-all"
            >
              ✈️ Book Flight
            </button>
            <button
              onClick={() => handleSendMessage('Book the hotel')}
              className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 whitespace-nowrap transition-all"
            >
              🏨 Book Hotel
            </button>
            <button
              onClick={() => handleSendMessage('Make it cheaper')}
              className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 whitespace-nowrap transition-all"
            >
              💸 Make it cheaper
            </button>
          </div>
        </div>

      </div>

      {/* Right Plan & Breakdown Dashboard Column */}
      <div className="lg:col-span-6 flex flex-col gap-6 overflow-y-auto">
        
        {activePlan ? (
          <div className="space-y-6">
            
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">AI Generated Itinerary</span>
                  <h3 className="text-2xl font-extrabold text-white">{activePlan.destination} Trip</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Est. Cost</span>
                  <span className="text-2xl font-black text-white">₹{activePlan.budgetBreakdown?.totalEstimatedCost?.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center pt-2">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
                  <div className="text-[10px] text-slate-400">Flights</div>
                  <div className="text-xs font-bold text-sky-300">₹{activePlan.budgetBreakdown?.flight?.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="text-[10px] text-slate-400">Hotel</div>
                  <div className="text-xs font-bold text-indigo-300">₹{activePlan.budgetBreakdown?.hotel?.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] text-slate-400">Food</div>
                  <div className="text-xs font-bold text-emerald-300">₹{activePlan.budgetBreakdown?.food?.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[10px] text-slate-400">Transport</div>
                  <div className="text-xs font-bold text-amber-300">₹{activePlan.budgetBreakdown?.transport?.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-[10px] text-slate-400">Activities</div>
                  <div className="text-xs font-bold text-purple-300">₹{activePlan.budgetBreakdown?.activities?.toLocaleString()}</div>
                </div>
              </div>

              {activePlan.cheaperSuggestions && activePlan.cheaperSuggestions.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Budget Optimizer Suggestions:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {activePlan.cheaperSuggestions.map((sugg, i) => (
                      <li key={i}>{sugg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Flight Options List */}
            {activePlan && (activePlan.flightOffers || activePlan.flightOffer) && (
              <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Plane className="w-4 h-4" /> Recommended Flights ({activePlan.origin} ➔ {activePlan.destination})
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Select to book</span>
                </div>

                <div className="space-y-2.5">
                  {(activePlan.flightOffers || [activePlan.flightOffer]).slice(0, 3).map((flight, idx) => (
                    <div key={flight.id || idx} className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border flex items-center justify-between text-xs hover:border-sky-500/40 transition-all">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{flight.airline} ({flight.flightNumber})</span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-semibold border border-sky-500/30">Cheapest</span>
                          )}
                        </div>
                        <div className="text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>{flight.origin} ➔ {flight.destination}</span>
                          {(flight.departureTime || flight.departure_time) && (
                            <>
                              <span>•</span>
                              <span className="text-sky-300 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-sky-400" />
                                {(flight.departureTime || flight.departure_time).includes('T') ? (flight.departureTime || flight.departure_time).split('T')[1].substring(0, 5) : (flight.departureTime || flight.departure_time)}
                                {(flight.arrivalTime || flight.arrival_time) ? ` - ${(flight.arrivalTime || flight.arrival_time).includes('T') ? (flight.arrivalTime || flight.arrival_time).split('T')[1].substring(0, 5) : (flight.arrivalTime || flight.arrival_time)}` : ''}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>{flight.duration}</span>
                          <span>•</span>
                          <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-base font-bold text-emerald-400">₹{flight.price?.toLocaleString()}</div>
                        <button
                          onClick={() => handleBookFlightClick(flight)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all"
                        >
                          Book Flight
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotel Options List */}
            {activePlan && (activePlan.hotelOffers || activePlan.hotelOffer) && (
              <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Hotel className="w-4 h-4" /> Recommended Hotels in {activePlan.destination}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Select to book</span>
                </div>

                <div className="space-y-2.5">
                  {(activePlan.hotelOffers || [activePlan.hotelOffer]).slice(0, 3).map((hotel, idx) => (
                    <div key={hotel.id || idx} className="p-3.5 rounded-2xl bg-dark-bg/80 border border-dark-border flex items-center justify-between text-xs hover:border-indigo-500/40 transition-all">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{hotel.name}</span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">Cheapest</span>
                          )}
                        </div>
                        <div className="text-slate-400 mt-0.5">{hotel.location} • {hotel.rating} ★ • ₹{hotel.pricePerNight?.toLocaleString()}/night</div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-base font-bold text-emerald-400">₹{hotel.totalPrice?.toLocaleString()}</div>
                        <button
                          onClick={() => handleBookHotelClick(hotel)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                        >
                          Book Hotel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h4 className="font-bold text-white text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" /> Day-by-Day Schedule
              </h4>

              <div className="space-y-4">
                {activePlan.itinerary?.map((day) => (
                  <div key={day.day} className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border space-y-2">
                    <div className="font-bold text-sky-400 text-sm">DAY {day.day}: {day.title}</div>
                    
                    <div className="space-y-2 pt-1">
                      {day.schedule?.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-start gap-3 bg-dark-card p-2.5 rounded-xl border border-white/5">
                          <span className="font-semibold text-slate-400 w-16 flex-shrink-0">{item.time}</span>
                          <div className="flex-1">
                            <span className="font-bold text-white">{item.activity}</span>
                            <p className="text-slate-400 mt-0.5">{item.description}</p>
                          </div>
                          <span className="font-bold text-emerald-400">₹{item.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No Active Trip Plan Loaded</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Ask our AI assistant on the left or click one of the quick action pills to generate your day-by-day itinerary & budget breakdown.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

export default function AIAgentPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-12 text-center text-slate-400">
        Loading AI Travel Assistant...
      </div>
    }>
      <AIAgentContent />
    </Suspense>
  );
}
