import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";//eslint-disable-line no-unused-vars
import { Dumbbell, Utensils, BarChart3, ArrowRight, Users, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";

// ====== Data ======
const features = [
  {
    title: "Workouts",
    desc: "Access personalized workout plans crafted by trainers.",
    icon: <Dumbbell size={32} />,
    color: "bg-blue-500",
    path: "/workouts",
  },
  {
    title: "Nutrition",
    desc: "Track meals and get diet recommendations tailored to your goals.",
    icon: <Utensils size={32} />,
    color: "bg-green-500",
    path: "/nutrition",
  },
  {
    title: "Progress",
    desc: "Visualize your fitness journey with charts & milestones.",
    icon: <BarChart3 size={32} />,
    color: "bg-purple-500",
    path: "/progress",
  },
];

const stats = [
  { value: "50k+", label: "Active Users", icon: <Users size={20} /> },
  { value: "95%", label: "Success Rate", icon: <Target size={20} /> },
  { value: "10k+", label: "Workouts", icon: <Award size={20} /> },
];

// ====== Animation Wrapper ======
const ScrollAnimation = ({ children, variants, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ====== Variants ======
const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  },
  slideDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  },
};

// ====== Components ======

// Header
const Header = () => (
  <header className="top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-2xl">
        <Dumbbell size={32} className="text-blue-600" />
        <span>FitTrack</span>
      </Link>

      <div className="flex space-x-4">
        <Link
          to="/memberLogin"
          className="px-5 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Sign Up
        </Link>
      </div>
    </div>
  </header>
);

// Hero Section
const Hero = () => (
  <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-24 px-6 text-center overflow-hidden">
    {/* Decorative circles */}
    <div className="absolute top-0 left-0 w-full h-full opacity-10">
      <div className="absolute top-10 left-20 w-72 h-72 bg-white rounded-full"></div>
      <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300 rounded-full"></div>
    </div>

    <div className="container mx-auto relative z-10">
      <ScrollAnimation variants={animations.slideDown}>
        <h1 className="text-4xl md:text-6xl font-bold mb-10">
          <Typewriter
            words={["Unlock the Power of Fitness", "Track. Train. Transform."]}
            loop
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1200}
          />
        </h1>
      </ScrollAnimation>

      <ScrollAnimation variants={animations.fadeIn}>
        <p className="mt-4 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
          Track workouts, monitor nutrition, and achieve your fitness goals with our all-in-one platform.
        </p>
      </ScrollAnimation>

      <ScrollAnimation variants={animations.fadeIn}>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started <ArrowRight size={18} />
          </Link>
          <Link
            to="/trainerLogin"
            className="inline-flex items-center bg-white text-blue-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            TrainerLogin<ArrowRight size={20} className="ml-2" />
          </Link>
          <Link
            to="/adminLogin"
            className="inline-flex items-center bg-white text-blue-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
          AdminLogin<ArrowRight size={20} className="ml-2" />
          </Link>
        
        </div>
      </ScrollAnimation>
      
    </div>
  </section>
);

// Stats Section
const Stats = () => (
  <section className="py-16 px-6 bg-white">
    <div className="container mx-auto">
      <ScrollAnimation variants={animations.staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <ScrollAnimation key={index} variants={animations.staggerItem} className="text-center p-6 rounded-xl">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">{stat.icon}</div>
            </div>
            <h3 className="text-4xl font-bold text-gray-800 mb-2">{stat.value}</h3>
            <p className="text-gray-600 text-lg">{stat.label}</p>
          </ScrollAnimation>
        ))}
      </ScrollAnimation>
    </div>
  </section>
);

// Features Section
const Features = () => (
  <section className="py-20 px-6 bg-gray-50">
    <div className="container mx-auto">
      <ScrollAnimation variants={animations.fadeIn}>
        <h2 className="text-black text-3xl md:text-4xl font-bold text-center mb-4">
          Everything You Need to Succeed
        </h2>
      </ScrollAnimation>

      <ScrollAnimation variants={animations.fadeIn}>
        <p className="text-gray-900 text-center text-xl mb-16 max-w-3xl mx-auto">
          Our comprehensive platform provides all the tools you need to reach your fitness goals.
        </p>
      </ScrollAnimation>

      <ScrollAnimation variants={animations.staggerContainer} className="grid gap-10 md:grid-cols-3">
        {features.map((feature, index) => (
          <ScrollAnimation key={index} variants={animations.staggerItem}>
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl text-white ${feature.color} mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-black text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-600 text-lg">{feature.desc}</p>
            </div>
          </ScrollAnimation>
        ))}
      </ScrollAnimation>
    </div>
  </section>
);

// CTA Section
const CTA = () => (
  <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
    <div className="container mx-auto text-center">
      <ScrollAnimation variants={animations.slideUp}>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Fitness?</h2>
      </ScrollAnimation>

      <ScrollAnimation variants={animations.slideUp}>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Join thousands of users who have already achieved their fitness goals with FitTrack.
        </p>
      </ScrollAnimation>

      <ScrollAnimation variants={animations.slideUp}>
        <Link
          to="/register"
          className="inline-flex items-center bg-white text-blue-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Start Your Journey Today <ArrowRight size={20} className="ml-2" />
        </Link>
      </ScrollAnimation>

    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="py-12 px-6 bg-gray-900 text-white">
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-6 md:mb-0">
          <Dumbbell size={28} className="text-blue-400" />
          <span className="text-xl font-bold">FitTrack</span>
        </div>
        <div className="flex space-x-8">
          <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link to="/contacts" className="text-gray-400 hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-400">
        <p>© {new Date().getFullYear()} FitTrack. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// ====== Main Page ======
const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default WelcomePage;
