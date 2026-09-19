import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-primary-blue/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary-blue animate-spin" />
        </div>
      </div>
      <div className="space-y-3 w-full max-w-sm mx-auto animate-pulse">
        <div className="h-4 bg-gray-800 rounded-full w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-800 rounded-full w-1/2 mx-auto"></div>
      </div>
    </div>
  );
}
