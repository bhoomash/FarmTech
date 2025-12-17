'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function LocationMap({ coordinates, onMapClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Initialize map only once
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [coordinates.lat, coordinates.lng],
        16
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Add initial marker
      markerRef.current = L.marker([coordinates.lat, coordinates.lng], {
        draggable: true
      }).addTo(mapInstanceRef.current);

      // Handle marker drag
      markerRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        onMapClick(lat, lng);
      });

      // Handle map click
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        onMapClick(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (markerRef.current && coordinates) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      mapInstanceRef.current?.setView([coordinates.lat, coordinates.lng], 16);
    }
  }, [coordinates]);

  return (
    <div 
      ref={mapRef} 
      className="h-64 w-full rounded-lg border border-gray-200 z-0"
      style={{ zIndex: 0 }}
    />
  );
}
