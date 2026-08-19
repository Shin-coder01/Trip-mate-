"use client";

import { useEffect, useRef, useState } from "react";
import { LocationMessage, Member, WS_BASE_URL } from "@/lib/api";

type StompFrame = {
  command: string;
  body: string;
};

export default function LiveTripPanel({
  tripId,
  member,
  token,
}: {
  tripId: number;
  member: Member | null;
  token: string | null;
}) {
  const socketRef = useRef<WebSocket | null>(null);
  const connectedRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);
  const [locations, setLocations] = useState<Record<number, LocationMessage>>({});
  const [status, setStatus] = useState("Connecting");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!token) return;
    const socket = new WebSocket(`${WS_BASE_URL}?token=${encodeURIComponent(token)}`);
    socketRef.current = socket;

    socket.onopen = () => {
      sendFrame(socket, "CONNECT", {
        "accept-version": "1.2",
        "heart-beat": "0,0",
      });
    };

    socket.onmessage = (event) => {
      for (const frame of parseFrames(String(event.data))) {
        if (frame.command === "CONNECTED") {
          connectedRef.current = true;
          setStatus("Connected");
          sendFrame(socket, "SUBSCRIBE", {
            id: `trip-${tripId}`,
            destination: `/topic/trips/${tripId}/locations`,
          });
        }

        if (frame.command === "MESSAGE" && frame.body) {
          const message = JSON.parse(frame.body) as LocationMessage;
          setLocations((current) => ({ ...current, [message.memberId]: message }));
        }
      }
    };

    socket.onerror = () => setStatus("Live connection error");
    socket.onclose = () => {
      connectedRef.current = false;
      setStatus("Disconnected");
    };

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socket.close();
    };
  }, [token, tripId]);

  function startSharing() {
    if (!member) {
      setStatus("Current member could not be identified");
      return;
    }
    if (!navigator.geolocation) {
      setStatus("Geolocation is not available in this browser");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const message: LocationMessage = {
          tripId,
          memberId: member.id,
          memberName: member.name,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          sharedAt: new Date().toISOString(),
        };
        publishLocation(message);
        setLocations((current) => ({ ...current, [member.id]: message }));
      },
      (error) => setStatus(error.message),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    setSharing(true);
  }

  function stopSharing() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  }

  function publishLocation(message: LocationMessage) {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !connectedRef.current) {
      setStatus("Waiting for live connection");
      return;
    }
    sendFrame(
      socket,
      "SEND",
      { destination: `/app/trips/${tripId}/location`, "content-type": "application/json" },
      JSON.stringify(message),
    );
  }

  const liveLocations = Object.values(locations);

  return (
    <section className="ticket-panel p-6">
      <p className="route-label">Live trip mode</p>
      <h2 className="mt-2 text-3xl font-bold">Member positions</h2>
      <p className="mt-3 text-sm text-muted-ink">Status: {status}</p>

      <div className="mt-5 flex gap-3">
        {sharing ? (
          <button className="secondary-button flex-1" onClick={stopSharing}>
            Stop sharing
          </button>
        ) : (
          <button className="stamp-button flex-1" onClick={startSharing}>
            Share location
          </button>
        )}
      </div>

      <div className="relative mt-5 h-56 overflow-hidden border border-ticket-line bg-kraft">
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-ticket-line" />
        <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-ticket-line" />
        {liveLocations.map((location, index) => (
          <div
            key={location.memberId}
            className="map-pin absolute flex h-8 w-8 items-center justify-center rounded-full border border-stamp bg-paper font-mono text-xs font-bold text-stamp"
            style={{
              left: `${16 + ((index * 27) % 68)}%`,
              top: `${18 + ((index * 31) % 62)}%`,
            }}
            title={`${location.memberName}: ${location.latitude}, ${location.longitude}`}
          >
            {location.memberName.slice(0, 2).toUpperCase()}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {liveLocations.length === 0 ? (
          <p className="text-sm text-muted-ink">No one is sharing location yet.</p>
        ) : (
          liveLocations.map((location) => (
            <div key={location.memberId} className="border border-ticket-line p-3 text-sm">
              <p className="font-bold">{location.memberName}</p>
              <p className="data-value mt-1 text-muted-ink">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function sendFrame(
  socket: WebSocket,
  command: string,
  headers: Record<string, string>,
  body = "",
) {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  socket.send(`${command}\n${headerLines.join("\n")}\n\n${body}\0`);
}

function parseFrames(raw: string): StompFrame[] {
  return raw
    .split("\0")
    .filter((chunk) => chunk.trim().length > 0)
    .map((chunk) => {
      const [headerBlock, ...bodyParts] = chunk.split("\n\n");
      const lines = headerBlock.split("\n").filter(Boolean);
      return {
        command: lines[0] ?? "",
        body: bodyParts.join("\n\n"),
      };
    });
}
