interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
      <div className="ui-panel flex flex-col items-center rounded-3xl p-8">
        <div className="relative">
          <div className="lds-spinner text-brand-secondary">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-medium text-neutral-secondary sm:text-base">{message}</p>
      </div>
    </div>
  );
}
