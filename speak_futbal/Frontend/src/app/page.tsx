"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Add this import
import { MagnifyingGlassIcon, MapPinIcon, CalendarIcon, UsersIcon, PlusIcon } from "@heroicons/react/24/outline";
import SignInModal from "@/components/SignInModal";
import LogInModal from "@/components/LogInModal";
import ApiService, { Event } from "@/services/api";

export default function Home() {
  const router = useRouter(); // Add this
  const [signInOpen, setSignInOpen] = useState(false);
  const [logInOpen, setLogInOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Remove: const [showProfile, setShowProfile] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const userData = await ApiService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        // User is not logged in
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const eventsData = await ApiService.getEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleLoginSuccess = (userData: any) => {
  const user = userData.user ?? userData;
  setUser(user);
  fetchEvents();
};

  const handleSignupSuccess = (userData: any) => {
    setUser(userData);
    fetchEvents(); // Refresh events after signup
  };

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      setUser(null);
      // Remove: setShowProfile(false);
      fetchEvents();
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleJoinEvent = async (eventId: number) => {
    if (!user) {
      setLogInOpen(true);
      return;
    }

    try {
      await ApiService.participateInEvent(eventId);
      fetchEvents(); // Refresh events to update participant count
    } catch (err) {
      console.error("Failed to join event:", err);
    }
  };

  const handleLeaveEvent = async (eventId: number) => {
    try {
      await ApiService.leaveEvent(eventId);
      fetchEvents(); // Refresh events to update participant count
    } catch (err) {
      console.error("Failed to leave event:", err);
    }
  };

  const isUserParticipating = (event: Event) => {
    return event.participants.some(participant => participant.id === user?.id);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedEventType === "all" || event.event_type === selectedEventType;
    return matchesSearch && matchesType;
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav
        className="fixed top-0 left-0 w-screen flex items-center px-8 py-4 mt-7 shadow-md z-50 rounded-2xl"
        style={{
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.5))",
          backdropFilter: "blur(5px)",
        }}
      >
        {/* Left: Logo */}
        <div className="flex-1">
          <h1
            className="font-bold cursor-pointer"
            onClick={() => router.push('/')}
            style={{
              color: "#111827",
              fontFamily: "Poppins, sans-serif",
              fontSize: "24px",
            }}
          >
            Speak Football
          </h1>
        </div>

        {/* Center: Links */}
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-8">
            {/* Add your navigation links here */}
          </div>
        </div>

        {/* Right: Auth Button */}
        <div className="flex-1 flex justify-end">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-600">Loading...</div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/profile')} // Changed from setShowProfile(true)
                className="text-gray-700 hover:text-[#5D6C8A] transition-colors"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "16px",
                }}
              >
                {user.username}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-all duration-200"
                style={{
                  backgroundColor: "#5D6C8A",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "16px",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-all duration-200"
              style={{
                backgroundColor: "#5D6C8A",
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
              }}
              onClick={() => setLogInOpen(true)}
            >
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modals */}
      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSwitchToLogIn={() => {
          setSignInOpen(false);
          setLogInOpen(true);
        }}
        onSignupSuccess={handleSignupSuccess}
      />
      <LogInModal
        open={logInOpen}
        onClose={() => setLogInOpen(false)}
        onSwitchToSignUp={() => {
          setLogInOpen(false);
          setSignInOpen(true);
        }}
        onForgotPassword={() => {
          // Handle forgot password
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Hero Section */}
      <section
        className="relative h-[100vh] bg-cover bg-center"
        style={{
          backgroundImage: "url('/art.gif')",
          filter: "saturate(0.5)",
        }}
      >
        {/* Content inside hero */}
        <div className="relative z-10 flex flex-col items-start justify-center h-full text-white px-6">
          <h2
            className="text-6xl font-bold mb-4 text-left"
            style={{
              color: "#000000",
              marginTop: "-200px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Find the latest football event around you
          </h2>
          <p
            className="mb-8 max-w-xl text-left"
            style={{
              color: "#000000",
              whiteSpace: "nowrap",
              fontFamily: "Poppins, sans-serif",
              fontSize: "18px",
              marginLeft: "2.5px",
            }}
          >
            Explore football related events, screening, activities -- all in one place
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              Available Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover and join football events happening around you
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D6C8A] focus:border-[#5D6C8A] text-black"
              />
            </div>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D6C8A] focus:border-[#5D6C8A] text-black"
            >
              <option value="all">All Types</option>
              <option value="match">Match</option>
              <option value="tournament">Tournament</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Events Grid */}
          {eventsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D6C8A]"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedEventType !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No events are currently available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                      <span className="inline-block bg-[#5D6C8A] text-white text-xs px-2 py-1 rounded ml-2 flex-shrink-0">
                        {event.event_type}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UsersIcon className="w-4 h-4" />
                        <span>
                          {event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}
                          {event.max_participants && ` / ${event.max_participants} max`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Created by {event.created_by.username}
                      </div>
                      {user ? (
                        isUserParticipating(event) ? (
                          <button
                            onClick={() => handleLeaveEvent(event.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Leave Event
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinEvent(event.id)}
                            disabled={Boolean(event.max_participants && event.participants.length >= event.max_participants)}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                              event.max_participants && event.participants.length >= event.max_participants
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#5D6C8A] text-white hover:bg-[#4a5870]'
                            }`}
                          >
                            {event.max_participants && event.participants.length >= event.max_participants
                              ? 'Event Full'
                              : 'Join Event'
                            }
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => setLogInOpen(true)}
                          className="bg-[#5D6C8A] text-white px-4 py-2 rounded-lg hover:bg-[#4a5870] transition-colors text-sm"
                        >
                          Login to Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}