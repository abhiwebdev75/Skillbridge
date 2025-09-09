import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import Chatbot from "../components/chatbot";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import HALO from "vanta/dist/vanta.halo.min";

const AppLayout = ({ userRole }) => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

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
        backgroundColor: 0x0a0f1c,
        baseColor: 0x5a189a,
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
      <div
        ref={vantaRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header userRole={userRole} />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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
