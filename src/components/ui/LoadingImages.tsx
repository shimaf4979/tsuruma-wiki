"use client";

import { motion } from "framer-motion";

const images = [
  { letter: "D", image: "/g108.png" },
  { letter: "R", image: "/g109.png" },
  { letter: "E", image: "/g110.png" },
  { letter: "A", image: "/g111.png" },
  { letter: "M", image: "/g112.png" },
];

export const LoadingImages = () => {
  return (
    <div className='flex justify-center items-center min-h-[200px] gap-2'>
      {images.map((item, index) => (
        <motion.div
          key={item.letter}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        >
          <img
            src={item.image}
            alt={item.letter}
            className='w-12 h-12 object-contain'
          />
        </motion.div>
      ))}
      <span className='ml-4 text-gray-500'>
        読み込み中
        <span className='inline-flex'>
          <span className='animate-[dot1_1.4s_infinite]'>.</span>
          <span className='animate-[dot2_1.4s_infinite]'>.</span>
          <span className='animate-[dot3_1.4s_infinite]'>.</span>
        </span>
      </span>
    </div>
  );
};
