"use client"

import { motion } from "framer-motion"

const Template = ({
  children
}: { children: React.ReactNode}) => {
  return (
    <motion.div
      initial={{y: 20, opacity: 0}}
      animate={{y: 0, opacity: 1}}
      transition={{ ease: 'easeOut', duration: .75}}
    >
      {children}
    </motion.div>
  )
}

export default Template
