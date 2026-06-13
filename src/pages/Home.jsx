import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GradientMesh } from '../components/GradientMesh';
import { Button } from '../components/Button';
import { FeatureCard } from '../components/FeatureCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.4
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  show: { 
    opacity: 1, 
    scale: 1,
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 200,
      damping: 20
    } 
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#b9b9f9] selection:text-[#533afd] overflow-x-hidden">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-[240px] pb-[180px] px-6 flex flex-col items-center text-center">
          <GradientMesh />
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1000px] relative z-10"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-[56px] md:text-[92px] font-black tracking-[-4px] text-[#0d253d] leading-[0.95] mb-10"
            >
              Play Spyfall, <br />
              <span className="text-[#533afd] inline-block hover:rotate-2 transition-transform cursor-default">anywhere.</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-[22px] md:text-[32px] font-medium tracking-[-0.5px] text-[#273951] mb-16 max-w-[750px] mx-auto leading-tight"
            >
              A free browser-based social deduction game. No accounts, no installs, just pure deception.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/play">
                <Button variant="primary" className="w-full sm:w-auto px-12 py-5 text-xl shadow-2xl shadow-[#533afd]/30">
                  Create Room
                </Button>
              </Link>
              <Link to="/play/join">
                <Button variant="secondary" className="w-full sm:w-auto px-12 py-5 text-xl shadow-xl">
                  Join Room
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Features Strip */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-[120px] flex flex-wrap justify-center gap-x-12 gap-y-8 relative z-10"
          >
            <div className="bg-[#f6f9fc] px-8 py-4 rounded-2xl border border-[#e3e8ee] flex flex-col items-center gap-1 shadow-sm">
              <span className="text-[24px] font-bold text-[#533afd]">3–10</span>
              <span className="text-[12px] uppercase tracking-widest font-bold text-[#64748d]">Players</span>
            </div>
            <div className="bg-[#f6f9fc] px-8 py-4 rounded-2xl border border-[#e3e8ee] flex flex-col items-center gap-1 shadow-sm">
              <span className="text-[24px] font-bold text-[#533afd]">3–15</span>
              <span className="text-[12px] uppercase tracking-widest font-bold text-[#64748d]">Min Rounds</span>
            </div>
            <div className="bg-[#f6f9fc] px-8 py-4 rounded-2xl border border-[#e3e8ee] flex flex-col items-center gap-1 shadow-sm">
              <span className="text-[24px] font-bold text-[#533afd]">30+</span>
              <span className="text-[12px] uppercase tracking-widest font-bold text-[#64748d]">Locations</span>
            </div>
          </motion.div>
        </section>

        {/* How to Play Section */}
        <section className="bg-[#f6f9fc] py-40 px-6 relative border-y border-[#e3e8ee]">
          <div className="max-w-[1300px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-[48px] md:text-[64px] font-black tracking-[-2px] text-[#0d253d] mb-6">How to Play</h2>
              <p className="text-[20px] text-[#64748d] max-w-[600px] mx-auto font-medium">Master the art of deception and deduction in four simple steps.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                step="1" 
                delay={0.1}
                title="Start" 
                description="Create or enter a room code to get everyone into the lobby instantly." 
              />
              <FeatureCard 
                step="2" 
                delay={0.2}
                title="Identify" 
                description="See your secret role and location. The Spy stays in the dark." 
              />
              <FeatureCard 
                step="3" 
                delay={0.3}
                title="Deceive" 
                description="Ask pointed questions to expose the Spy or hide the secret location." 
              />
              <FeatureCard 
                step="4" 
                delay={0.4}
                title="Win" 
                description="Vote correctly to catch the Spy, or guess the location if you are the Spy!" 
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-40 px-6 bg-white overflow-hidden">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  quote: "The absolute best way to lose friends and realize you're a terrible liar.",
                  author: "Alex",
                  role: "The Spy"
                },
                {
                  quote: "Finally, a browser version that doesn't feel like a legacy app. Smooth as butter.",
                  author: "Sarah",
                  role: "Loyal Resident"
                },
                {
                  quote: "Simple, clean, and dangerously addictive. The bounciness makes it so fun to use.",
                  author: "Jordan",
                  role: "Frequent Accuser"
                }
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: i * 0.1 }}
                  className="flex flex-col gap-8 bg-[#f6f9fc] p-10 rounded-[32px] border border-[#e3e8ee] hover:shadow-xl transition-shadow"
                >
                  <p className="text-[20px] font-medium text-[#0d253d] italic leading-tight relative">
                    <span className="text-[#533afd] text-6xl absolute -top-8 -left-6 opacity-10">"</span>
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-2xl bg-[#533afd] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#533afd]/20">
                      {t.author[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-bold text-[#0d253d]">{t.author}</span>
                      <span className="text-[12px] font-bold uppercase tracking-widest text-[#533afd]">{t.role}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
