// lib/cn.ts

// Import clsx (for conditional classes) and twMerge (for Tailwind merging)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Function that combines clsx + twMerge
// Takes any number of class inputs
// Returns merged class string
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}