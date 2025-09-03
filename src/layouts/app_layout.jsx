import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import * as THREE from "three";
import HALO from "vanta/dist/vanta.halo.min"; // ✅ Correct HALO import
import Header from "../components/header";
import Footer from "../components/footer";
import Chatbot from "../components/chatbot";

const AppLayout = () => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // ✅ Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = HALO({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,

        // 🎨 Colors
        backgroundColor: 0x0a0f1c, // dark navy
        baseColor: 0x5a189a,

        // 🔥 Motion / glow tuning
        size: 0.6,
        amplitudeFactor: 1.2,
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col font-inter">
      {/* Vanta.js HALO background */}
      <div
        ref={vantaRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Page Content above Vanta */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* ✅ Chatbot */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* ✅ Chatbot Button (shows only if closed) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition ease-in-out"
          style={{ fontSize: "20px" }}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default AppLayout;
