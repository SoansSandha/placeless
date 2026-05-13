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
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.215, 0.61, 0.355, 1] 
    } 
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#b9b9f9] selection:text-[#533afd]">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-[200px] pb-[160px] px-6 flex flex-col items-center text-center overflow-hidden">
          <GradientMesh />
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[850px] relative z-10"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-[48px] md:text-[72px] font-light tracking-[-2px] text-[#0d253d] leading-[1.05] mb-8"
            >
              Play Spyfall, <span className="text-[#533afd] italic">anywhere.</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-[20px] md:text-[28px] font-light tracking-[-0.26px] text-[#273951] mb-12 max-w-[650px] mx-auto leading-relaxed"
            >
              A free browser-based social deduction game. No accounts, no installs, just pure deception.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-5 justify-center"
            >
              <Link to="/play">
                <Button variant="primary" className="w-full sm:w-auto px-10 py-4 text-lg">
                  Play Now
                </Button>
              </Link>
              <Link to="/play/join">
                <Button variant="secondary" className="w-full sm:w-auto px-10 py-4 text-lg">
                  Join Room
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Features Strip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-[100px] flex flex-wrap justify-center gap-x-16 gap-y-6 text-[#64748d] relative z-10"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-[20px] font-light text-[#0d253d]">3–10</span>
              <span className="text-[12px] uppercase tracking-widest font-normal">Players</span>
            </div>
            <div className="w-px h-12 bg-[#e3e8ee] hidden md:block"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[20px] font-light text-[#0d253d]">3–15</span>
              <span className="text-[12px] uppercase tracking-widest font-normal">Min Rounds</span>
            </div>
            <div className="w-px h-12 bg-[#e3e8ee] hidden md:block"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[20px] font-light text-[#0d253d]">30+</span>
              <span className="text-[12px] uppercase tracking-widest font-normal">Locations</span>
            </div>
          </motion.div>
        </section>

        {/* How to Play Section */}
        <section className="bg-[#f6f9fc] py-32 px-6 relative">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-[42px] font-light tracking-[-1px] text-[#0d253d] mb-4">How to Play</h2>
              <p className="text-[#64748d] max-w-[500px] mx-auto">Master the art of deduction in four simple steps.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                step="1" 
                delay={0.1}
                title="Join" 
                description="Create or enter a room code to join your friends in the lobby instantly." 
              />
              <FeatureCard 
                step="2" 
                delay={0.2}
                title="Reveal" 
                description="See your secret role and location. One player is the Spy; they are in the dark." 
              />
              <FeatureCard 
                step="3" 
                delay={0.3}
                title="Talk" 
                description="Ask pointed questions to reveal the Spy without compromising the secret location." 
              />
              <FeatureCard 
                step="4" 
                delay={0.4}
                title="Vote" 
                description="Accuse the Spy to win. But beware: if the Spy guesses the location first, they win!" 
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 px-6 bg-white overflow-hidden">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                {
                  quote: "The best way to lose friends and realize you're a terrible liar.",
                  author: "Alex",
                  role: "The Spy"
                },
                {
                  quote: "Finally, a browser version that doesn't feel like it's from 2005.",
                  author: "Sarah",
                  role: "Loyal Resident"
                },
                {
                  quote: "Simple, clean, and dangerously addictive. The UI is just chef's kiss.",
                  author: "Jordan",
                  role: "Frequent Accuser"
                }
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex flex-col gap-6"
                >
                  <p className="text-[18px] font-light text-[#0d253d] italic leading-relaxed relative">
                    <span className="text-[#533afd] text-4xl absolute -top-4 -left-6 opacity-20">"</span>
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f6f9fc] border border-[#e3e8ee] flex items-center justify-center text-[#533afd] font-light">
                      {t.author[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-normal text-[#0d253d]">{t.author}</span>
                      <span className="text-[11px] font-normal uppercase tracking-wider text-[#533afd]">{t.role}</span>
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
