import React, { useState } from 'react';
import EventCard from '../components/events/EventCard';
import { eventsData, featuredAds, resaleTickets } from '../data/eventsData';
import { Plus, ChevronLeft, ChevronRight, Ticket, RefreshCw } from 'lucide-react';
import './Events.css';

const Events = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowTicketModal(true);
  };

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % featuredAds.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + featuredAds.length) % featuredAds.length);
  };

  return (
    <div className="events-page">
      {/* Ad Banner Section */}
      <section className="ad-banner-section">
        <div className="ad-carousel">
          <button className="carousel-btn prev" onClick={prevAd}>
            <ChevronLeft size={24} />
          </button>
          
          <div className="ad-banner animate-fade-in" key={currentAdIndex}>
            <img
              src={featuredAds[currentAdIndex].image}
              alt={featuredAds[currentAdIndex].title}
              className="ad-image"
            />
            <div className="ad-content">
              <h2 className="ad-title">{featuredAds[currentAdIndex].title}</h2>
              <p className="ad-sponsor">Sponsored by {featuredAds[currentAdIndex].sponsor}</p>
              <button className="ad-btn">Learn More</button>
            </div>
          </div>
          
          <button className="carousel-btn next" onClick={nextAd}>
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="ad-indicators">
          {featuredAds.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentAdIndex ? 'active' : ''}`}
              onClick={() => setCurrentAdIndex(index)}
            />
          ))}
        </div>
      </section>

      {/* Events Header */}
      <div className="events-header">
        <div>
          <h1 className="events-title">Upcoming Events</h1>
          <p className="events-subtitle">Book your tickets to amazing events</p>
        </div>
        <button className="create-event-btn" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {eventsData.map((event) => (
          <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} />
        ))}
      </div>

      {/* Resale Marketplace */}
      <section className="resale-section">
        <div className="resale-header">
          <RefreshCw className="resale-icon" />
          <h2 className="resale-title">Ticket Resale Marketplace</h2>
          <p className="resale-subtitle">Find tickets from verified sellers</p>
        </div>
        <div className="resale-grid">
          {resaleTickets.map((ticket) => (
            <div key={ticket.id} className="resale-card hover-lift">
              <div className="resale-info">
                <h3 className="resale-event">{ticket.eventTitle}</h3>
                <p className="resale-section">{ticket.section}</p>
                <p className="resale-seller">Sold by {ticket.seller}</p>
              </div>
              <div className="resale-pricing">
                <div className="original-price">${ticket.originalPrice}</div>
                <div className="resale-price">${ticket.resalePrice}</div>
                <div className="qty-available">{ticket.quantity} available</div>
              </div>
              <button className="resale-buy-btn">
                <Ticket size={16} />
                Buy Ticket
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Event</h2>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input type="text" className="form-input" placeholder="Enter event title" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows="4" placeholder="Describe your event"></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input type="text" className="form-input" placeholder="Event venue" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ticket Price ($)</label>
                <input type="number" className="form-input" placeholder="99" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Capacity</label>
                <input type="number" className="form-input" placeholder="500" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Upload Event Poster</label>
              <div className="upload-area">
                <Plus size={32} />
                <p>Click to upload poster</p>
                <input type="file" className="file-input" accept="image/*" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="modal-btn submit">Create Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Purchase Modal */}
      {showTicketModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal-content ticket-modal" onClick={(e) => e.stopPropagation()}>
            <img src={selectedEvent.poster} alt={selectedEvent.title} className="ticket-poster" />
            <h2 className="modal-title">{selectedEvent.title}</h2>
            <p className="ticket-description">{selectedEvent.description}</p>
            
            <div className="ticket-details">
              <div className="detail-row">
                <span>Date & Time</span>
                <span className="detail-value">{new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}</span>
              </div>
              <div className="detail-row">
                <span>Venue</span>
                <span className="detail-value">{selectedEvent.venue}</span>
              </div>
              <div className="detail-row">
                <span>Location</span>
                <span className="detail-value">{selectedEvent.location}</span>
              </div>
              <div className="detail-row">
                <span>Available Tickets</span>
                <span className="detail-value">{selectedEvent.availableTickets} / {selectedEvent.totalCapacity}</span>
              </div>
              <div className="detail-row total">
                <span>Ticket Price</span>
                <span className="detail-value">${selectedEvent.ticketPrice}</span>
              </div>
            </div>

            <div className="qr-placeholder">
              <div className="qr-code"></div>
              <p className="qr-label">QR Code will be generated after purchase</p>
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowTicketModal(false)}>
                Cancel
              </button>
              <button className="modal-btn submit">
                <Ticket size={18} />
                Buy Ticket - ${selectedEvent.ticketPrice}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
