import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  Award, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  MessageCircle,
  Briefcase,
  BookOpen
} from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security and privacy controls.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance ensures smooth experience across all features.'
  },
  {
    icon: Users,
    title: 'Global Community',
    description: 'Connect with professionals from around the world in your field.'
  },
  {
    icon: Globe,
    title: 'Worldwide Access',
    description: 'Access opportunities and resources from anywhere in the world.'
  },
  {
    icon: Award,
    title: 'Quality Assured',
    description: 'Curated content and verified opportunities ensure the highest quality.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Fully responsive design works perfectly on all your devices.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    company: 'TechCorp',
    content: 'SeaGro helped me find my dream remote job and connect with amazing professionals in my field.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150'
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'StartupXYZ',
    content: 'The learning resources on SeaGro are top-notch. I\'ve advanced my skills significantly.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150'
  },
  {
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    company: 'DesignStudio',
    content: 'The community aspect is incredible. I\'ve made valuable connections and learned so much.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150'
  }
];

const features = [
  {
    icon: Briefcase,
    title: 'Job Opportunities',
    description: 'Access thousands of remote job listings from top companies worldwide.',
    details: [
      'Verified job postings',
      'Direct application process',
      'Salary transparency',
      'Company insights'
    ]
  },
  {
    icon: BookOpen,
    title: 'Learning Platform',
    description: 'Comprehensive learning resources to advance your professional skills.',
    details: [
      'Expert-curated courses',
      'Interactive tutorials',
      'Skill assessments',
      'Certification programs'
    ]
  },
  {
    icon: MessageCircle,
    title: 'Real-time Communication',
    description: 'Connect and collaborate with professionals in real-time.',
    details: [
      'Instant messaging',
      'Group discussions',
      'File sharing',
      'Video integration'
    ]
  }
];

export function LearnMore() {
  return (
    <>
      <Helmet>
        <title>Learn More - SeaGro</title>
        <meta name="description" content="Learn more about SeaGro's features, benefits, and how it can help advance your professional career. Join our global community today." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-blue-600 to-purple-600">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Why Choose SeaGro?
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Discover how SeaGro is revolutionizing professional development 
                and career growth for thousands of professionals worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Built for Modern Professionals
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every feature is designed with your success in mind
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-teal-100 rounded-lg mr-4">
                      <benefit.icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Deep Dive */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powerful Features, Seamless Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to accelerate your professional journey
              </p>
            </div>

            <div className="space-y-20">
              {features.map((feature, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center mb-6">
                      <div className="p-4 bg-teal-100 rounded-xl mr-4">
                        <feature.icon className="h-8 w-8 text-teal-600" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl p-8 h-80 flex items-center justify-center">
                      <feature.icon className="h-32 w-32 text-teal-600 opacity-50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Loved by Professionals Worldwide
              </h2>
              <p className="text-xl text-gray-600">
                See what our community has to say about their experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Join thousands of professionals who are already transforming their careers with SeaGro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/start-exploring"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-teal-600 transition-colors"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}