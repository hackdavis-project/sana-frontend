"use client"
import { X, Camera, Edit2, Mic, Plus } from "lucide-react"

interface ActionMenuProps {
  isExpanded: boolean
  onToggle: () => void
}

export function ActionMenu({ isExpanded, onToggle }: ActionMenuProps) {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-28 flex items-center z-10">
      <div className="relative">
        <div
          className={`bg-amber-100 rounded-full border border-amber-200 shadow-lg overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-center ${
            isExpanded ? "w-64 h-14 opacity-100" : "w-14 h-14 opacity-100"
          }`}
        >
          {isExpanded ? (
            <div className="flex flex-row items-center justify-between w-full px-4 py-3">
              <button
                className="bg-amber-200 text-amber-800 rounded-full p-3 hover:bg-amber-300 transition-colors"
                onClick={onToggle}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                className="text-amber-800 p-2 hover:bg-amber-200 rounded-full transition-colors"
                onClick={() => alert("Camera clicked!")}
                aria-label="Camera"
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                className="text-amber-800 p-2 hover:bg-amber-200 rounded-full transition-colors"
                onClick={() => alert("Edit clicked!")}
                aria-label="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>

              <button
                className="text-amber-800 p-2 hover:bg-amber-200 rounded-full transition-colors"
                onClick={() => alert("Microphone clicked!")}
                aria-label="Microphone"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              className="w-full h-full flex items-center justify-center"
              onClick={onToggle}
              aria-label="Open actions menu"
            >
              <Plus className="w-6 h-6 text-amber-800" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
