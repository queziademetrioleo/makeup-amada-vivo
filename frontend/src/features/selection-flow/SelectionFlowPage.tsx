import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebcam } from '@/hooks/useWebcam';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { useCameraStore } from '@/store/useCameraStore';
import { useMakeupStore } from '@/store/useMakeupStore';
import {
  useOrderStore,
  STEPS,
  STEP_LABELS,
  STEP_DESCRIPTIONS,
  type SelectionStep,
  type StepSelection,
} from '@/store/useOrderStore';
import { TryOnCanvas } from '@/features/tryon/TryOnCanvas';
import { CameraPermission } from '@/features/camera/CameraPermission';
import { PRODUCTS } from '@/data/products';
import type { Product, ProductColor } from '@/types/products';

// Map each step to a product category
const STEP_CATEGORY: Record<SelectionStep, string> = {
  batom: 'lipstick',
  base: 'foundation',
  corretivo: 'corretivo',
  blush: 'blush',
};

// Opacity defaults per step
const STEP_OPACITY: Record<SelectionStep, number> = {
  batom: 0.85,
  base: 0.45,
  corretivo: 0.55,
  blush: 0.55,
};

function applyStepColor(
  step: SelectionStep,
  color: string,
  updateLipstick: (p: object) => void,
  updateFoundation: (p: object) => void,
  updateContour: (p: object) => void,
  updateBlush: (p: object) => void,
) {
  const opacity = STEP_OPACITY[step];
  switch (step) {
    case 'batom':
      updateLipstick({ color, opacity, enabled: true, glossy: false });
      break;
    case 'base':
      updateFoundation({ color, opacity, enabled: true });
      break;
    case 'corretivo':
      updateContour({ color, opacity, enabled: true });
      break;
    case 'blush':
      updateBlush({ color, opacity, enabled: true });
      break;
  }
}

interface NameModalProps {
  onConfirm: (name: string) => void;
}

function NameModal({ onConfirm }: NameModalProps) {
  const [value, setValue] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[#161829] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-[#E8809A]/20 border border-[#E8809A]/30 flex items-center justify-center mb-6 mx-auto">
          <span className="text-xl">💄</span>
        </div>
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          Bem-vinda ao Try-On Guiado
        </h2>
        <p className="text-white/50 text-sm text-center mb-6">
          Vamos encontrar o look perfeito para você passo a passo.
        </p>
        <label className="block text-sm text-white/60 mb-2">Qual é o seu nome?</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onConfirm(value.trim());
          }}
          placeholder="Digite seu nome..."
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#E8809A]/50 focus:ring-1 focus:ring-[#E8809A]/30 mb-4"
        />
        <button
          disabled={!value.trim()}
          onClick={() => { if (value.trim()) onConfirm(value.trim()); }}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all
            bg-[#E8809A] hover:bg-[#E8809A]/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Começar
        </button>
      </motion.div>
    </motion.div>
  );
}

export function SelectionFlowPage() {
  const navigate = useNavigate();
  const { videoRef, isReady, isLoading, error, start } = useWebcam();
  const { faceLandmarkerRef } = useFaceMesh();
  const { faceMeshReady, faceDetected } = useCameraStore();
  const { config, updateLipstick, updateFoundation, updateContour, updateBlush } = useMakeupStore();
  const {
    clientName,
    stepIndex,
    setClientName,
    confirmStep,
    nextStep,
  } = useOrderStore();

  const currentStep = STEPS[stepIndex] as SelectionStep | undefined;

  // Products for the current step
  const stepProducts: Product[] = currentStep
    ? PRODUCTS.filter((p) => p.category === STEP_CATEGORY[currentStep])
    : [];

  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const prevStepRef = useRef<number>(-1);

  const selectedProduct = stepProducts[selectedProductIndex] ?? null;
  const selectedColor: ProductColor | null = selectedProduct?.colors[selectedColorIndex] ?? null;

  // When step changes, reset product/color selection and auto-preview first color
  useEffect(() => {
    if (!currentStep) return;
    if (prevStepRef.current !== stepIndex) {
      prevStepRef.current = stepIndex;
      setSelectedProductIndex(0);
      setSelectedColorIndex(0);
    }
  }, [stepIndex, currentStep]);

  // Auto-preview color whenever product/color/step selection changes
  useEffect(() => {
    if (!currentStep || !selectedColor) return;
    applyStepColor(
      currentStep,
      selectedColor.hex,
      updateLipstick,
      updateFoundation,
      updateContour,
      updateBlush,
    );
  }, [currentStep, selectedColor, updateLipstick, updateFoundation, updateContour, updateBlush]);

  // Start webcam on mount
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All steps done → go to receipt
  useEffect(() => {
    if (stepIndex >= STEPS.length) {
      navigate('/recibo');
    }
  }, [stepIndex, navigate]);

  const handleChoose = () => {
    if (!currentStep || !selectedProduct || !selectedColor) return;
    const selection: StepSelection = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      colorId: selectedColor.id,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
    };
    confirmStep(selection);
    nextStep();
  };

  const cameraStatus = isLoading ? 'requesting' : error ? 'error' : 'idle';

  return (
    <div className="fixed inset-0 bg-[#080910] flex overflow-hidden">
      {/*
        Hidden video element — must stay in DOM always (same pattern as TryOnPage).
        Placing it off-screen prevents React from unmounting/remounting it.
      */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Name modal */}
      <AnimatePresence>
        {!clientName && (
          <NameModal onConfirm={(name) => setClientName(name)} />
        )}
      </AnimatePresence>

      {/* Camera / canvas area (left) */}
      <div className="flex-1 flex items-center justify-center p-4 relative min-w-0">
        {isReady ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full max-h-full"
            style={{ aspectRatio: undefined }}
          >
            <div className="relative w-full h-full">
              <TryOnCanvas
                videoRef={videoRef}
                faceLandmarkerRef={faceLandmarkerRef}
                config={config}
                showBeforeAfter={false}
                showDebug={false}
                faceMeshReady={faceMeshReady}
                faceDetected={faceDetected}
              />
            </div>
          </motion.div>
        ) : (
          <div className="w-full max-w-2xl aspect-[4/3] glass-panel rounded-2xl overflow-hidden">
            <CameraPermission
              status={cameraStatus}
              error={error}
              onStart={start}
            />
          </div>
        )}
      </div>

      {/* Sidebar (right) */}
      <div className="w-80 xl:w-96 flex-shrink-0 bg-[#0D0E1C] border-l border-white/5 flex flex-col overflow-hidden">
        {/* Step progress header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
              Seu Look
            </h1>
            {clientName && (
              <span className="text-xs text-[#E8809A] font-medium">{clientName}</span>
            )}
          </div>

          {/* Step pills */}
          <div className="flex gap-2">
            {STEPS.map((step, idx) => {
              const isDone = idx < stepIndex;
              const isCurrent = idx === stepIndex;
              return (
                <div
                  key={step}
                  className={`flex-1 flex flex-col items-center gap-1`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${isDone
                        ? 'bg-[#E8809A] text-white'
                        : isCurrent
                          ? 'bg-[#E8809A]/20 border-2 border-[#E8809A] text-[#E8809A]'
                          : 'bg-white/5 border border-white/10 text-white/30'
                      }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-colors
                      ${isCurrent ? 'text-[#E8809A]' : isDone ? 'text-white/50' : 'text-white/20'}`}
                  >
                    {STEP_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current step content */}
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto flex flex-col"
            >
              {/* Step title */}
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-lg font-semibold text-white">
                  {STEP_LABELS[currentStep]}
                </h2>
                <p className="text-sm text-white/40 mt-0.5">
                  {STEP_DESCRIPTIONS[currentStep]}
                </p>
              </div>

              {/* Product selector */}
              {stepProducts.length > 1 && (
                <div className="px-5 pb-3">
                  <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Produto</p>
                  <div className="flex flex-col gap-1.5">
                    {stepProducts.map((product, pIdx) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProductIndex(pIdx);
                          setSelectedColorIndex(0);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all text-sm
                          ${selectedProductIndex === pIdx
                            ? 'bg-[#E8809A]/10 border-[#E8809A]/40 text-white'
                            : 'bg-white/3 border-white/8 text-white/60 hover:border-white/20 hover:text-white/80'
                          }`}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-white/40 mt-0.5">{product.brand} · R$ {product.price.toFixed(2).replace('.', ',')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Single product (no selector needed) */}
              {stepProducts.length === 1 && selectedProduct && (
                <div className="px-5 pb-3">
                  <div className="bg-white/3 border border-white/8 rounded-xl px-3 py-2.5">
                    <div className="text-sm font-medium text-white">{selectedProduct.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{selectedProduct.brand} · R$ {selectedProduct.price.toFixed(2).replace('.', ',')}</div>
                  </div>
                </div>
              )}

              {/* Color grid */}
              {selectedProduct && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Cor</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.colors.map((color, cIdx) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColorIndex(cIdx)}
                        title={color.name}
                        className={`flex flex-col items-center gap-1.5 group`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full transition-all shadow-md
                            ${selectedColorIndex === cIdx
                              ? 'ring-2 ring-[#E8809A] ring-offset-2 ring-offset-[#0D0E1C] scale-110'
                              : 'ring-1 ring-white/10 group-hover:ring-white/30 group-hover:scale-105'
                            }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span
                          className={`text-[9px] text-center leading-tight transition-colors
                            ${selectedColorIndex === cIdx ? 'text-white/80' : 'text-white/30 group-hover:text-white/50'}`}
                        >
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected color preview */}
              {selectedColor && (
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-3 py-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm ring-1 ring-white/10"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <div>
                      <div className="text-sm text-white font-medium">{selectedColor.name}</div>
                      <div className="text-xs text-white/40">{selectedColor.hex}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom action */}
        <div className="p-5 border-t border-white/5">
          <button
            onClick={handleChoose}
            disabled={!selectedColor || !currentStep}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all
              bg-[#E8809A] hover:bg-[#E8809A]/90 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-[#E8809A]/20"
          >
            {currentStep ? `Escolher ${STEP_LABELS[currentStep]}` : 'Escolher'}
          </button>
          {stepIndex > 0 && (
            <p className="text-center text-xs text-white/30 mt-2">
              Passo {stepIndex + 1} de {STEPS.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
