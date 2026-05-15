import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationPickerModal = ({ isOpen, onClose, onSave }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  // Get current location
  useEffect(() => {
    if (!isOpen) return;

    // Reset state every time modal opens
    setPosition(null);
    setAddress("");
    setError("");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          fetchAddress(coords);
        },
        () => setError("Location permission denied")
      );
    } else {
      setError("Geolocation not supported");
    }
  }, [isOpen]);

  // Reverse Geocoding using Nominatim
  const fetchAddress = async ([lat, lng]) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
      );

      const data = await res.json();

      if (!data || !data.address) {
        setError("Address not found");
        return;
      }

      const addr = data.address;

      const parsedAddress = {
        house:
          (addr.house_number ? addr.house_number + ", " : "") +
          (addr.road || ""),
        area:
          addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          "",
        city:
          addr.city ||
          addr.town ||
          addr.village ||
          "",
        state: addr.state || "",
        pincode: addr.postcode || "",
        formattedAddress: data.display_name,
      };

      setAddress(parsedAddress);

    } catch (err) {
      setError("Failed to fetch address");
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        setPosition(coords);
        fetchAddress(coords);
      },
    });

    return position ? <Marker position={position} draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const latlng = marker.getLatLng();
          const coords = [latlng.lat, latlng.lng];
          setPosition(coords);
          fetchAddress(coords);
        },
      }}
    /> : null;
  };

  const handleSave = () => {
    if (!position) return;

    onSave({
      latitude: position[0],
      longitude: position[1],
      ...address,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[600px] rounded-none p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          Select Delivery Location
        </h2>

        {position && (
          <MapContainer
            key={position.toString()}
            center={position}
            zoom={15}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
        )}

        <div className="mt-4">
          <p className="text-sm text-gray-500">Selected Address:</p>
          <p className="text-sm font-medium">
            {address?.formattedAddress}
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const coords = [
                      pos.coords.latitude,
                      pos.coords.longitude,
                    ];
                    setPosition(coords);
                    fetchAddress(coords);

                    if (mapRef.current) {
                      mapRef.current.setView(coords, 16); // 👈 THIS FIXES YOUR ISSUE
                    }
                  },
                  () => setError("Location permission denied")
                );
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-none"
          >
            Use Current Location
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-none"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-none"
            >
              Save Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;