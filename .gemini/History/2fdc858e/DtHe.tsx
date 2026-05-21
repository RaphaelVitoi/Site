/**
 * IDENTITY: SOTA Button (The Atomic Trigger)
 * PATH: src/components/ui/SotaButton.tsx
 * ROLE: Botão ultra-estilizado com efeitos quânticos e suporte a fullWidth.
 */

"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import React from "react";

interface SotaButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "ref" | "children"
> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SotaButton: React.FC<SotaButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  style,
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center gap-3 font-heading font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 overflow-hidden active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none select-none";

  const variants = {
    primary:
      "bg-accent-indigo text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] border border-white/10 hover:border-white/20",
    secondary:
      "bg-accent-emerald text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] border border-white/10",
    danger:
      "bg-rose-600 text-white shadow-[0_4px_15px_rgba(225,29,72,0.3)] hover:shadow-[0_8px_30px_rgba(225,29,72,0.5)] border border-white/10",
    outline:
      "bg-transparent border-2 border-white/10 text-white hover:bg-white/5 hover:border-white/20",
    ghost: "bg-transparent text-text-muted hover:bg-white/5 hover:text-white",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-[0.65rem]",
    md: "px-8 py-3.5 text-xs",
    lg: "px-12 py-5 text-sm",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={style as any}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite] pointer-events-none" />

      {isLoading ? (
        <i className="fa-solid fa-circle-notch animate-spin text-sm" />
      ) : (
        <>
          {leftIcon && <span className="opacity-70">{leftIcon}</span>}
          <span className="relative z-10">{children}</span>
          {rightIcon && <span className="opacity-70">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default SotaButton;
