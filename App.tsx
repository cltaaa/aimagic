import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSettings } from './contexts/SettingsContext';
import { editImageWithNanoBanana } from './services/geminiService';
import type { AppState, ModeSettings } from './types';

// --- Icon Components ---
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 0 1 0 1.845c.008.379.137.752.43.992l1.003.827c.424.35.534.955.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.333.183-.582.495-.645.87l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.845c-.008-.379-.137-.752-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.87l.213-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);
const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

// --- Spinner Component ---
const Spinner: React.FC = () => (
    <div className="border-4 border-gray-500 border-t-cyan-400 rounded-full w-16 h-16 animate-spin"></div>
);

// --- Page Components (defined outside App to prevent re-renders) ---

interface HomePageProps { onStartMode: (mode: string) => void; onGoToSettings: () => void; }
const HomePage: React.FC<HomePageProps> = ({ onStartMode, onGoToSettings }) => (
    <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen animate-fadeIn">
        <button onClick={onGoToSettings} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
            <SettingsIcon className="w-8 h-8"/>
        </button>
        <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">Nano 成像器</h1>
        <p className="text-gray-400 mb-12 text-center max-w-md">选择一个模式开始创作。在设置中配置模式。</p>
        <div className="w-full max-w-sm">
            <button onClick={() => onStartMode('rainbow')} className="w-full bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-gray-700 hover:scale-105 transform transition-all duration-300 group">
                <div className="flex flex-col items-center">
                    <div className="p-4 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 mb-4">
                      <CameraIcon className="w-10 h-10 text-white"/>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">彩虹模式</h2>
                    <p className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors">拍张照片，为它添加一张魔法卡片。</p>
                </div>
            </button>
        </div>
    </div>
);

interface SettingsPageProps { onBack: () => void; }
const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    const { settings, updateSettings } = useSettings();
    const [rainbowSettings, setRainbowSettings] = useState<ModeSettings>(settings['rainbow'] || { prompt: '', referenceImage: null });

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRainbowSettings(prev => ({...prev, prompt: e.target.value}));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setRainbowSettings(prev => ({...prev, referenceImage: event.target?.result as string}));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSave = () => {
        updateSettings('rainbow', rainbowSettings);
        onBack();
    };

    return (
        <div className="p-4 sm:p-8 min-h-screen animate-fadeIn">
            <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <ArrowLeftIcon className="w-6 h-6"/> 返回
            </button>
            <h1 className="text-3xl font-bold text-center mb-8">设置</h1>
            <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-cyan-400">彩虹模式配置</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">提示词 (支持中文)</label>
                        <textarea value={rainbowSettings.prompt} onChange={handlePromptChange} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">参考图片 (卡片)</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 transition"/>
                    </div>
                    {rainbowSettings.referenceImage && (
                        <div>
                            <p className="text-sm font-medium text-gray-300 mb-2">当前参考图片:</p>
                            <img src={rainbowSettings.referenceImage} alt="Reference" className="max-w-xs max-h-40 mx-auto rounded-md object-contain"/>
                        </div>
                    )}
                </div>
                <button onClick={handleSave} className="w-full mt-8 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    保存并返回
                </button>
            </div>
        </div>
    );
};

interface CameraViewProps { onCapture: (imageDataUrl: string) => void; onCancel: () => void; }
const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("访问摄像头时出错: ", err);
                alert("无法访问摄像头。请检查权限。");
                onCancel();
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
            }
        }
    };
    
    return (
        <div className="relative w-screen h-screen bg-black flex flex-col justify-center items-center animate-fadeIn">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex justify-center items-center">
                <button onClick={onCancel} className="absolute left-4 text-white text-lg">取消</button>
                <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 hover:border-white transition"></button>
            </div>
        </div>
    );
};

interface GeneratingViewProps { }
const GeneratingView: React.FC<GeneratingViewProps> = () => (
    <div className="flex flex-col justify-center items-center min-h-screen text-center p-4 animate-fadeIn">
        <Spinner />
        <h2 className="text-2xl font-bold mt-8">正在生成您的杰作...</h2>
        <p className="text-gray-400 mt-2">AI 正在思考，这可能需要一些时间。</p>
    </div>
);

interface ResultViewProps { image: string; onReset: () => void; }
const ResultView: React.FC<ResultViewProps> = ({ image, onReset }) => {
    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = image;
        link.download = 'generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">这是您的图片！</h1>
            <img src={image} alt="Generated" className="max-w-full max-h-[60vh] rounded-lg shadow-2xl mb-8 object-contain" />
            <div className="flex gap-4">
                <button onClick={onReset} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">再试一次</button>
                <button onClick={downloadImage} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
                    <DownloadIcon className="w-5 h-5"/> 下载
                </button>
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [appState, setAppState] = useState<AppState>('HOME');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { settings } = useSettings();

    const handleStartMode = useCallback((mode: string) => {
      const modeSettings = settings[mode];
      if (!modeSettings?.prompt || !modeSettings?.referenceImage) {
        alert(`'${mode}' 模式未配置。请在设置中设置提示词和参考图片。`);
        return;
      }
      setAppState('CAMERA');
    }, [settings]);

    const handleCapture = useCallback(async (imageDataUrl: string) => {
        setCapturedImage(imageDataUrl);
        setAppState('GENERATING');
        setError(null);
        
        try {
            const rainbowSettings = settings['rainbow'];
            if (!rainbowSettings?.prompt || !rainbowSettings?.referenceImage) {
                throw new Error('彩虹模式未配置。');
            }

            const result = await editImageWithNanoBanana(
                imageDataUrl,
                rainbowSettings.referenceImage,
                rainbowSettings.prompt
            );
            
            if (result.image) {
                setGeneratedImage(result.image);
                setAppState('RESULT');
            } else {
                throw new Error(result.error || "生成图片失败。");
            }
        } catch (e: any) {
            setError(e.message);
            alert(`错误: ${e.message}`);
            setAppState('HOME');
        }
    }, [settings]);

    const handleReset = useCallback(() => {
        setAppState('HOME');
        setCapturedImage(null);
        setGeneratedImage(null);
        setError(null);
    }, []);

    const renderContent = () => {
        switch (appState) {
            case 'HOME':
                return <HomePage onStartMode={handleStartMode} onGoToSettings={() => setAppState('SETTINGS')} />;
            case 'SETTINGS':
                return <SettingsPage onBack={() => setAppState('HOME')} />;
            case 'CAMERA':
                return <CameraView onCapture={handleCapture} onCancel={handleReset} />;
            case 'GENERATING':
                return <GeneratingView />;
            case 'RESULT':
                return generatedImage ? <ResultView image={generatedImage} onReset={handleReset} /> : <HomePage onStartMode={handleStartMode} onGoToSettings={() => setAppState('SETTINGS')} />;
            default:
                return <div>未知状态</div>;
        }
    };

    return (
        <main className="bg-gray-900 text-white min-h-screen">
            {renderContent()}
        </main>
    );
}