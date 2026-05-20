import { useState } from "react";

const roleBadgeColors = {
  admin: "bg-blue-100 text-blue-800",
  teamleader: "bg-green-100 text-green-800",
  engineer: "bg-orange-100 text-orange-800",
};

const formatFieldName = (field) => {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
};

const HistoryTimeline = ({ history }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!history || history.length === 0) {
    return null;
  }

  const sortedHistory = [...history].reverse();

  return (
    <div className="mt-4 border-t pt-4">
      <button
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span
          className={`transform transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          &#9654;
        </span>
        History ({sortedHistory.length} {sortedHistory.length === 1 ? "change" : "changes"})
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-4">
          {sortedHistory.map((entry, index) => (
            <div key={index} className="relative pl-6 border-l-2 border-gray-200 pb-4">
              <div className="absolute left-[-5px] top-1 w-2 h-2 bg-gray-400 rounded-full" />

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span>
                  {new Date(entry.changedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="text-gray-300">|</span>
                <span>{entry.changedBy?.name || "Unknown"}</span>
                {entry.changedBy?.role && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      roleBadgeColors[entry.changedBy.role] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {entry.changedBy.role}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {entry.changes.map((change, ci) => (
                  <div key={ci} className="text-sm">
                    <span className="font-medium text-gray-600">
                      {formatFieldName(change.field)}:
                    </span>{" "}
                    <span className="text-red-500 line-through">
                      {change.oldValue ?? "N/A"}
                    </span>{" "}
                    <span className="text-gray-400">&rarr;</span>{" "}
                    <span className="text-green-600">
                      {change.newValue ?? "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTimeline;
