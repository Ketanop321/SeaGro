import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Briefcase, 
  BookOpen, 
  Bike, 
  MessageSquare, 
  Users2, 
  Newspaper,
  Share,
  CheckSquare,
  ArrowRight,
  Star,
  TrendingUp,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: 'Remote Jobs',
    description: 'Discover thousands of remote job opportunities from top companies worldwide.',
    link: '/jobs',
    color: 'bg-blue-500',
    stats: '10K+ Jobs'
  },
  {
    icon: BookOpen,
    title: 'Learning Hub',
    description: 'Access curated courses, tutorials, and resources to advance your skills.',
    link: '/learning',
    color: 'bg-green-500',
    stats: '500+ Courses'
  },
  {
    icon: Bike,
    title: 'Bike Sharing',
    description: 'Find and reserve bikes in your city for eco-friendly transportation.',
    link: '/bikes',
    color: 'bg-orange-500',
    stats: '200+ Cities'
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Connect with professionals and join meaningful conversations.',
    link: '/chat',
    color: 'bg-purple-500',
    stats: 'Live Chat',
    protected: true
  },
  {
    icon: Users2,
    title: 'Community',
    description: 'Build your professional network and share your journey.',
    link: '/community',
    color: 'bg-pink-500',
    stats: '50K+ Members',
    protected: true
  },
  {
    icon: Newspaper,
    title: 'Tech News',
    description: 'Stay updated with the latest technology trends and industry news.',
    link: '/news',
    color: 'bg-indigo-500',
    stats: 'Daily Updates'
  },
  {
    icon: Share,
    title: 'Content Sharing',
    description: 'Share your knowledge, projects, and insights with the community.',
    link: '/sharing',
    color: 'bg-teal-500',
    stats: 'Share & Learn',
    protected: true
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Organize your goals and track your professional development.',
    link: '/todos',
    color: 'bg-red-500',
    stats: 'Stay Organized',
    protected: true
  }
];

const stats = [
  { label: 'Active Users', value: '50K+', icon: Users2 },
  { label: 'Job Opportunities', value: '10K+', icon: Briefcase },
  { label: 'Learning Resources', value: '500+', icon: BookOpen },
  { label: 'Cities Covered', value: '200+', icon: Globe }
];

export function StartExploring() {
  return (
    <>
      <Helmet>
        <title>Start Exploring - SeaGro</title>
        <meta name="description" content="Discover all the amazing features SeaGro has to offer. From remote jobs to learning resources, bike sharing to community networking." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-blue-600 text-white">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Start Your Journey
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-teal-100 max-w-3xl mx-auto">
                Explore a world of opportunities, learning, and connections. 
                Your professional growth starts here.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/learn-more"
                  className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-teal-600 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-teal-100 rounded-full">
                      <stat.icon className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover powerful tools and resources designed to accelerate your professional journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Link
                  key={index}
                  to={feature.link}
                  className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {feature.protected && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Login Required
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-teal-600">
                        {feature.stats}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Join thousands of professionals who are already using SeaGro to advance their careers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-gray-50 transition-colors"
              >
                <Star className="mr-2 h-5 w-5" />
                Start Free Today
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-teal-600 transition-colors"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore Opportunities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}