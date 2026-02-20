import { motion } from "framer-motion";

interface ElegantSignatureProps {
  name?: string;
  className?: string;
}

const ElegantSignature = ({ name = "Eunice Joaquim", className = "" }: ElegantSignatureProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
      className={`relative inline-block ${className}`}
    >
      {/* Glow effect behind signature */}
      <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl opacity-50" />
      
      {/* Signature text with elegant script styling */}
      <motion.svg
        viewBox="0 0 300 80"
        className="relative w-48 sm:w-56 lg:w-64 h-auto"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="signatureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        
        {/* Elegant script text */}
        <text
          x="50%"
          y="55%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="url(#signatureGradient)"
          className="font-signature"
          style={{
            fontFamily: "'Playfair Display', 'Dancing Script', cursive",
            fontSize: "32px",
            fontStyle: "italic",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          {name}
        </text>
        
        {/* Decorative underline curve */}
        <motion.path
          d="M 40 60 Q 150 75 260 60"
          fill="none"
          stroke="url(#signatureGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 1.2, delay: 2.5, ease: "easeOut" }}
        />
        
        {/* Decorative flourish */}
        <motion.path
          d="M 255 55 Q 270 45 280 55 Q 290 65 275 70"
          fill="none"
          stroke="url(#signatureGradient)"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 3, ease: "easeOut" }}
        />
      </motion.svg>
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 2, delay: 3.5, ease: "easeInOut" }}
        style={{ mixBlendMode: "overlay" }}
      />
    </motion.div>
  );
};

export default ElegantSignature;
