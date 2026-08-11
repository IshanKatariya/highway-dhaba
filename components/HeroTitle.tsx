"use client";

import { motion } from "framer-motion";

const containerVariants: any = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.16, delayChildren: 0.2 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function HeroTitle() {
  return (
    <motion.div
      className="flex flex-col items-center text-center gap-4 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="leading-none select-none"
        variants={itemVariants}
        style={{
          fontFamily: 'Yatra One',
          fontSize: "clamp(72px, 14vw, 150px)",
          color: "#f5a623",
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
          textShadow: "rgb(137 88 5) 0px 5px 0px",
        }}
      >
        हाईवे ढाबा
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="uppercase tracking-[0.35em] text-white/80"
        style={{
          fontFamily: "Yatra One",
          fontSize: "clamp(14px, 2.7vw, 22px)",

        }}
      >
        HIGHWAY DHABA
      </motion.p>


    </motion.div>
  );
}
