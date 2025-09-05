import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Anchor } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-blue-500 to-purple-600" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Where Innovation
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-blue-200">
                Meets Growth
              </span>
            </h1>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              Join SeaGro's ecosystem of professionals, innovators, and learners. 
              Shape your future with cutting-edge resources and meaningful connections.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                to="/start-exploring"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                <Compass className="w-5 h-5 mr-2" />
                Start Exploring
              </Link>
              <Link
                to="/learn-more"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-teal-600 transition-colors"
              >
                <Anchor className="w-5 h-5 mr-2" />
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur-lg opacity-50" />
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                alt="Team collaboration"
                className="relative rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}