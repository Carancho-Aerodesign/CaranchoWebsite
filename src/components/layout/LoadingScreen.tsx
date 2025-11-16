export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="flex flex-col items-center">
        <img src="./logoWithLabel.png" alt="Logo Carancho Aerodesign" className="h-16 animate-pulse" />
      </div>
    </div>
  );
}
