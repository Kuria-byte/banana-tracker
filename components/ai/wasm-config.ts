// File: /components/ai/wasm-config.ts
"use client";

import { env } from '@huggingface/transformers';

/**
 * Configure Transformers.js for optimal performance based on browser capabilities
 * 
 * This handles cases where SharedArrayBuffer isn't available or allowed
 * by falling back to single-threaded mode
 */
export function configureTransformersEnvironment() {
  try {
    // Check if SharedArrayBuffer is available
    if (typeof SharedArrayBuffer === 'undefined') {
      console.log('SharedArrayBuffer is not available. Using single-threaded mode.');
      
      // Disable multi-threading for WASM
      if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
        env.backends.onnx.wasm.numThreads = 1;
      }
    } else {
      console.log('SharedArrayBuffer is available. Using multi-threaded mode if supported.');
      
      // Use 2 threads if available (good balance for most devices)
      if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
        env.backends.onnx.wasm.numThreads = 2;
      }
    }
    
    // Always enable browser caching
    env.useBrowserCache = true;
    env.allowLocalModels = false;
    
    // Configure a smaller quantized model for devices with limited memory
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile) {
      console.log('Mobile device detected. Using optimized settings.');
      // Use int8 quantization for mobile devices to reduce memory usage
      if (env.backends && env.backends.onnx) {
        env.backends.onnx.quantized = true;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error configuring Transformers.js environment:', error);
    
    // Set safe fallback values
    env.useBrowserCache = true;
    env.allowLocalModels = false;
    if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
      env.backends.onnx.wasm.numThreads = 1;
    }
    
    return false;
  }
}