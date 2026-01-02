"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Add this
import { User, Event } from "@/services/api";
import ApiService from "@/services/api";
import { PlusIcon, MapPinIcon, CalendarIcon, UsersIcon, XMarkIcon } from "@heroicons/react/24/outline";
import EditEventModal from "../../components/EditEventModal";

// Define the EventFormData interface
interface EventFormData {
  title: string;
  description: string;
  event_type: "match" | "tournament" | "training" | "other";
  location: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  max_participants: number | undefined;
}

// Remove the ProfileProps interface and make this a standalone page
export default function ProfilePage() {
  const router = useRouter(); // Add this
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEditEventForm, setShowEditEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleEventClick = (event: Event) => {
  setSelectedEvent(event);
  setShowEditEventForm(true);
};
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    location: user?.location || "",
  });

  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: "",
    description: "",
    event_type: "match",
    location: "",
    latitude: 0,
    longitude: 0,
    start_date: "",
    end_date: "",
    max_participants: undefined,
  });

  useEffect(() => {
    // Fetch current user on mount
    const fetchUser = async () => {
      try {
        const userData = await ApiService.getCurrentUser();
        if (!userData) {
          router.push('/'); // Redirect to home if not logged in
          return;
        }
        setUser(userData);
        setProfileData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          location: userData.location || "",
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.push('/'); // Redirect to home on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    try {
      const events = await ApiService.getEvents();
       
      // Filter events created by the current user
      const userCreatedEvents = events.filter(event => event.created_by.id === user?.id);
      
      setUserEvents(userCreatedEvents);
      
      // Filter events that the user has joined (but not created)
      const userJoinedEvents = events.filter(event => 
        event.participants.some(p => p.id === user?.id) && 
        event.created_by.id !== user?.id
      );
      console.log("User Joined Events:", userJoinedEvents.length);
      setJoinedEvents(userJoinedEvents);
    } catch (err) {
      console.error("Failed to fetch user events:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      router.push('/');
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await ApiService.updateProfile(profileData);
      setUser(updatedUser); // Update local state instead of calling onUserUpdate
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await ApiService.createEvent(eventFormData);
      setSuccess("Event created successfully!");
      setShowEventForm(false);
      setEventFormData({
        title: "",
        description: "",
        event_type: "match",
        location: "",
        latitude: 0,
        longitude: 0,
        start_date: "",
        end_date: "",
        max_participants: undefined,
      });
      fetchUserEvents(); // Refresh the events list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventDelete = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await ApiService.deleteEvent(eventId);
      setSuccess("Event deleted successfully!");
      fetchUserEvents(); // Refresh the events list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D6C8A] mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add navigation bar */}
      <nav
        className="fixed top-0 left-0 w-screen flex items-center px-8 py-4 mt-7 shadow-md z-50 rounded-2xl"
        style={{
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.5))",
          backdropFilter: "blur(5px)",
        }}
      >
        <div className="flex-1">
          <button
            onClick={() => router.push('/')}
            className="font-bold text-[#111827] hover:text-[#5D6C8A] transition-colors"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "24px",
            }}
          >
            ← Back to Home
          </button>
        </div>
        <div className="flex-1 flex justify-end">
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
      </nav>

      {/* Add top padding for fixed nav */}
      <div className="pt-28 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-2 bg-[#5D6C8A] text-white px-4 py-2 rounded-lg hover:bg-[#4a5870] transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Event
              </button>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <p className="mt-1 text-sm text-gray-900">{user.first_name || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <p className="mt-1 text-sm text-gray-900">{user.last_name || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-sm text-gray-900">{user.location || "Not provided"}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#5D6C8A] text-white px-4 py-2 rounded-lg hover:bg-[#4a5870] transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A] text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#5D6C8A] text-white px-4 py-2 rounded-lg hover:bg-[#4a5870] transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6 text-[#5D6C8A]" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Events Created</p>
                        <p className="text-2xl font-bold text-gray-900">{userEvents.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-6 h-6 text-[#5D6C8A]" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Events Participated</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {joinedEvents.length}
                           </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User's Events */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Events</h2>
            {userEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">You haven't created any events yet.</p>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="mt-4 bg-[#5D6C8A] text-white px-4 py-2 rounded-lg hover:bg-[#4a5870] transition-colors"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents.map((event) => (
                  <div key={event.id}
                   className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                   onClick={() => handleEventClick(event)}>

                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <button
                        onClick={() => handleEventDelete(event.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-[#5D6C8A] text-white text-xs px-2 py-1 rounded">
                        {event.event_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.participants.length} participants
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Joined Events */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Events I've Joined</h2>
            {joinedEvents.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">You haven't joined any events yet.</p>
                <p className="text-sm text-gray-400 mt-2">Browse events on the home page to join some!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Joined
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-[#5D6C8A] text-white text-xs px-2 py-1 rounded">
                        {event.event_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.participants.length} participants
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Created by {event.created_by.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
              {error}
            </div>
          )}
          {success && (
            <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
              {success}
            </div>
          )}

          {/* Event Creation Modal */}
          {showEventForm && (
            <div className="fixed inset-0 bg-[#5D6C8A] bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
                    <button
                      onClick={() => setShowEventForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleEventSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                      <input
                        type="text"
                        value={eventFormData.title}
                        onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                        className="w-full border border-gray-300  rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={eventFormData.description}
                        onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                      <select
                        value={eventFormData.event_type}
                        onChange={(e) => setEventFormData({ ...eventFormData, event_type: e.target.value as any })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                      >
                        <option value="match">Match</option>
                        <option value="tournament">Tournament</option>
                        <option value="training">Training</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={eventFormData.location}
                        onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          value={eventFormData.start_date}
                          onChange={(e) => setEventFormData({ ...eventFormData, start_date: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                        <input
                          type="datetime-local"
                          value={eventFormData.end_date}
                          onChange={(e) => setEventFormData({ ...eventFormData, end_date: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants (Optional)</label>
                      <input
                        type="number"
                        value={eventFormData.max_participants || ""}
                        onChange={(e) => setEventFormData({ ...eventFormData, max_participants: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#5D6C8A] focus:border-[#5D6C8A]  text-black"
                        min="1"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-[#5D6C8A] text-white py-2 rounded-lg hover:bg-[#4a5870] transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Creating..." : "Create Event"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEventForm(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
    
    {showEditEventForm && selectedEvent && (
    <EditEventModal
    event={selectedEvent}
    onClose={() => setShowEditEventForm(false)}
    onEventUpdated={fetchUserEvents}
  />
)}
        </div>
      </div>
    </div>
  );
}
