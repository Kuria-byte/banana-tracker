// components/assistant/chat-skeleton.tsx
export default function ChatSkeleton() {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-64 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-56"></div>
          </div>
        </div>
        
        <div className="flex items-start justify-end gap-3">
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100"></div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-56 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-72 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-64 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
        
        <div className="mt-8 h-12 bg-gray-100 rounded-full"></div>
      </div>
    );
  }