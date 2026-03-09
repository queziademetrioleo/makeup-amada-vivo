import { useRef, useState, useCallback } from 'react';
export function useWebcam() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [state, setState] = useState({
        isReady: false,
        isLoading: false,
        error: null,
    });
    const start = useCallback(async () => {
        setState({ isReady: false, isLoading: true, error: null });
        if (!navigator.mediaDevices?.getUserMedia) {
            setState({ isReady: false, isLoading: false, error: 'Câmera não suportada neste navegador.' });
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 },
                },
                audio: false,
            });
            streamRef.current = stream;
            const video = videoRef.current;
            if (!video) {
                stream.getTracks().forEach((t) => t.stop());
                setState({ isReady: false, isLoading: false, error: 'Elemento de vídeo não encontrado.' });
                return;
            }
            video.srcObject = stream;
            // Wait for canplay — ensures the browser can actually render frames,
            // not just that metadata arrived.
            await new Promise((resolve, reject) => {
                const onCanPlay = () => { video.removeEventListener('canplay', onCanPlay); resolve(); };
                const onError = () => { video.removeEventListener('error', onError); reject(new Error('Erro ao iniciar vídeo.')); };
                video.addEventListener('canplay', onCanPlay, { once: true });
                video.addEventListener('error', onError, { once: true });
            });
            await video.play();
            setState({ isReady: true, isLoading: false, error: null });
        }
        catch (err) {
            const message = err instanceof DOMException && err.name === 'NotAllowedError'
                ? 'Permissão de câmera negada. Clique no ícone de câmera na barra de endereços e permita o acesso.'
                : err instanceof Error
                    ? err.message
                    : 'Erro ao acessar a câmera.';
            setState({ isReady: false, isLoading: false, error: message });
        }
    }, []);
    const stop = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current)
            videoRef.current.srcObject = null;
        setState({ isReady: false, isLoading: false, error: null });
    }, []);
    return { videoRef, ...state, start, stop };
}
