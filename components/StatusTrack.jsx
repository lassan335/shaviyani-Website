import { STATUSES, STATUS_COLOR } from "../lib/orderStatus";

export default function StatusTrack({ status }) {
  const idx = STATUSES.indexOf(status);
  const color = STATUS_COLOR[status] || "#6B7280";

  return (
    <div className="statusTrack">
      {STATUSES.map((s, i) => (
        <div key={s} className="statusStep">
          <div className="statusStepRow">
            <div
              className={"dot" + (i <= idx ? " filled" : "")}
              style={i <= idx ? { background: color, borderColor: color } : {}}
            />
            {i < STATUSES.length - 1 && (
              <div className={"line" + (i < idx ? " filled" : "")} style={i < idx ? { background: color } : {}} />
            )}
          </div>
          <div className="statusStepLabel">{s}</div>
        </div>
      ))}
    </div>
  );
}
