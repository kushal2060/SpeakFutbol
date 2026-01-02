import React, { useState } from "react";
import ApiService, { Event } from "@/services/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
  onEventUpdated: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, onClose, onEventUpdated }) => {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    event_type: event.event_type,
    location: event.location,
    latitude: event.latitude,
    longitude: event.longitude,
    date: event.date,
    time: event.time,
    max_participants: event.max_participants,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [removingParticipantId, setRemovingParticipantId] = useState<number | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await ApiService.updateEvent(event.id, formData);
      setSuccess("Event updated!");
      onEventUpdated();
      onClose();
    } catch (err) {
      setError("Failed to update event");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove participant handler
  const handleRemoveParticipant = async (userId: number) => {
    setRemovingParticipantId(userId);
    setError("");
    setSuccess("");
    try {
      await ApiService.removeParticipantFromEvent(event.id, userId);
      setSuccess("Participant removed!");
      onEventUpdated(); // Refresh event data in parent
    } catch (err:any) {
       
      if(err && typeof err === "object" && err.error) {
        setError(err.error);
      } else {
         setError("Failed to remove participant");
      }
     
    } finally {
      setRemovingParticipantId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#5D6C8A] bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 overflow-y-auto">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold mb-4 text-black">Edit Event</h2>
         <button
                    onClick= {onClose}
                    className="text-gray-400 hover:text-gray-600 mb-6"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
       </div>
       
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* ...inputs for all fields... */}
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded px-3 py-2 text-black"
            required
          />
          {/* Add other fields as needed */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#5D6C8A] text-white px-4 py-2 rounded"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </form>
        <h3 className="mt-6 font-semibold text-black">Participants</h3>
        <ul>
          {event.participants.map(p => (
            <li key={p.id} className="flex justify-between items-center py-1 text-black">
              <span>{p.username}</span>
              <button
                className="text-red-500 text-xs"
                onClick={() => handleRemoveParticipant(p.id)}
                disabled={removingParticipantId === p.id || isLoading}
              >
                {removingParticipantId === p.id ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-500 mt-2">{success}</div>}
      </div>
    </div>
  );
};

export default EditEventModal;