// ```tsx
"use client";
import gsap from 'gsap';
import React, { useEffect, useRef } from 'react';

const MainPage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const text = "STALK SHOPS";

    useEffect(() => {
        if (!containerRef.current || !textRef.current) return;

        const letters = textRef.current.children;
        const tl = gsap.timeline({ delay: 0.5 });

        // Initial entrance
        tl.to(letters, {
            y: 0,
            duration: 1,
            stagger: 0.05,
            ease: "expo.out",
        });

        // Transition to "SS" circle icon
        tl.to(Array.from(letters).filter((_, i) => i !== 0 && i !== 6), {
            opacity: 0,
            scale: 0,
            width: 0,
            duration: 0.6,
            ease: "power4.inOut",
        }, "+=0.5");

        tl.to(containerRef.current, {
            width: "10rem", // w-48
            height: "10rem", // h-48
            borderRadius: "25px",
            duration: 1,
            ease: "elastic.out(1, 0.8)",
        }, "-=0.4");

        tl.to([letters[0], letters[6]], {
            fontSize: "5rem",
            duration: 0.8,
            ease: "expo.out",
        }, "-=0.8");
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen mainBgColor">
            <div 
                ref={containerRef}
                className="bg-white rounded-[40px] w-full max-w-2xl h-20 flex items-center justify-center shadow-2xl overflow-hidden"
            >
                <div ref={textRef} className="flex items-center justify-center">
                    {text.split("").map((char, index) => (
                        <span
                            key={index}
                            className="text-5xl font-black text-red-500 tracking-tighter inline-block translate-y-32 whitespace-pre"
                        >
                            {char}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainPage;
// ```
