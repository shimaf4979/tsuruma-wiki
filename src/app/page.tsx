"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useUIStore } from "../store";
import { HomeContent } from "../components/HomeContent";

export default function HomePage() {
  const [showHome, setShowHome] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const { setShowNavbar } = useUIStore();

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ページロード時にナビゲーションバーを非表示にする
  useEffect(() => {
    setShowNavbar(false);
  }, [setShowNavbar]);

  const handleClick = () => {
    setIsTransitioning(true);
    // 0.5秒後にホーム画面を表示
    setTimeout(() => {
      setShowHome(true);
      // アニメーション完了後にナビゲーションバーを表示
      setShowNavbar(true);
    }, 500);
  };

  const titleVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    clicked: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        when: "afterChildren",
        duration: 0.3,
      },
    },
  };

  const letterVariants = {
    initial: {
      opacity: 0,
      scale: 0.3,
      rotate: -180,
      y: -200,
    },
    animate: (i: number) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: i * 0.2,
        duration: 0.8,
      },
    }),
    clicked: {
      scale: 1.3,
      rotate: 10,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0,
      rotate: 720,
      transition: {
        duration: 0.6,
        ease: "easeIn",
      },
    },
  };

  const backgroundVariants = {
    initial: { opacity: 1, scale: 1 },
    clicked: {
      scale: 1.2,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 1.8,
      transition: {
        duration: 0.8,
        ease: "easeIn",
      },
    },
  };

  return (
    <div className='min-h-screen relative overflow-hidden'>
      <AnimatePresence mode='wait'>
        {!showHome ? (
          // オープニング画面
          <motion.div
            key='opening'
            variants={backgroundVariants}
            initial='initial'
            animate={isTransitioning ? "clicked" : "animate"}
            exit='exit'
            className='fixed inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-blue-300 flex items-center justify-center cursor-pointer'
            onClick={handleClick}
          >
            {/* 背景の星々 */}
            <div className='absolute inset-0'>
              {[...Array(50)].map((_, i) => {
                // 固定の位置を生成（ランダムではなく）
                const generatePosition = () => {
                  // グリッドベースの位置計算
                  const gridSize = 10; // 10x10のグリッド
                  const row = Math.floor(i / gridSize);
                  const col = i % gridSize;

                  // グリッド内で少しランダムなオフセットを追加
                  const offsetX = (i * 7) % 10; // 7は素数なので、より均等な分布になります
                  const offsetY = (i * 13) % 10; // 13も素数

                  const left = col * 10 + offsetX;
                  const top = row * 10 + offsetY;

                  return { left: `${left}%`, top: `${top}%` };
                };

                const position = generatePosition();
                return (
                  <motion.div
                    key={i}
                    className='absolute w-1 h-1 bg-white rounded-full'
                    style={{
                      left: position.left,
                      top: position.top,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                );
              })}
            </div>

            {/* メインタイトル */}
            <motion.div
              variants={titleVariants}
              initial='initial'
              animate={isTransitioning ? "clicked" : "animate"}
              exit='exit'
              className='text-center z-10'
            >
              <div className='flex justify-center items-center mb-4 gap-1 sm:gap-2 px-2'>
                {[
                  { letter: "D", image: "/g108.png" },
                  { letter: "R", image: "/g109.png" },
                  { letter: "E", image: "/g110.png" },
                  { letter: "A", image: "/g111.png" },
                  { letter: "M", image: "/g112.png" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className='relative'
                    style={{
                      width:
                        windowWidth < 640
                          ? "70px"
                          : windowWidth < 768
                          ? "90px"
                          : "130px",
                      height:
                        windowWidth < 640
                          ? "90px"
                          : windowWidth < 768
                          ? "110px"
                          : "170px",
                    }}
                    variants={{
                      ...letterVariants,
                      floating: {
                        y: [-8, 8, -8],
                        rotate: [-3, 3, -3],
                        transition: {
                          duration: 2.5 + index * 0.3, // 各文字で少し異なる速度
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2, // 各文字で少し異なるタイミング
                        },
                      },
                    }}
                    initial='initial'
                    animate={[
                      isTransitioning ? "clicked" : "animate",
                      "floating", // 浮遊アニメーションを追加
                    ]}
                    custom={index}
                    exit='exit'
                    whileHover={{
                      rotate: 15,
                      scale: 1.1,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.letter}
                      className='w-full h-full object-contain'
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div
                className='mb-8 px-4'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                <img
                  src='/o.png'
                  alt='あなたの物語が始まる'
                  className='max-w-full h-auto mx-auto'
                  style={{ maxHeight: windowWidth < 768 ? "60px" : "80px" }}
                />
              </motion.div>

              <motion.div
                className='flex flex-col sm:flex-row items-center justify-center text-white/80 space-y-2 sm:space-y-0 sm:space-x-2 px-4'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
              >
                <motion.span
                  className='text-2xl font-bold'
                  animate={{
                    scale: [1, 1.1, 1],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  Please click
                </motion.span>
                <motion.div
                  animate={{
                    x: [0, 10, 0],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <ChevronRight className='w-4 h-4' />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* パーティクルエフェクト */}
            <div className='absolute inset-0 pointer-events-none'>
              {[...Array(20)].map((_, i) => {
                // 固定の位置を生成
                const positions = [
                  { left: "10%", top: "20%" },
                  { left: "20%", top: "40%" },
                  { left: "30%", top: "60%" },
                  { left: "40%", top: "80%" },
                  { left: "50%", top: "10%" },
                  { left: "60%", top: "30%" },
                  { left: "70%", top: "50%" },
                  { left: "80%", top: "70%" },
                  { left: "90%", top: "90%" },
                  { left: "15%", top: "25%" },
                  { left: "25%", top: "45%" },
                  { left: "35%", top: "65%" },
                  { left: "45%", top: "85%" },
                  { left: "55%", top: "15%" },
                  { left: "65%", top: "35%" },
                  { left: "75%", top: "55%" },
                  { left: "85%", top: "75%" },
                  { left: "95%", top: "95%" },
                  { left: "5%", top: "5%" },
                  { left: "15%", top: "35%" },
                ];
                const position = positions[i % positions.length];
                return (
                  <motion.div
                    key={i}
                    className='absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full'
                    style={{
                      left: position.left,
                      top: position.top,
                    }}
                    animate={{
                      y: [0, -100, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        ) : (
          // ホーム画面
          <HomeContent />
        )}
      </AnimatePresence>
    </div>
  );
}
