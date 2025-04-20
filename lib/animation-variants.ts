export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

export const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
}

export const optionVariants = {
  unselected: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
  },
  selected: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
    scale: 1.02,
    transition: { duration: 0.3 },
  },
}

export const textVariants = {
  enter: { y: 30, opacity: 0, rotateX: 15 },
  center: { y: 0, opacity: 0.6, rotateX: 0 },
  exit: { y: -30, opacity: 0, rotateX: -15 },
}
