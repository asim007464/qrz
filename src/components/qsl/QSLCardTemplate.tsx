import type { QSLCard, QSLTemplate } from "@/types";
import { cn } from "@/lib/utils";

type QSLCardTemplateProps = {
  card: Partial<QSLCard>;
  template: QSLTemplate;
  editable?: boolean;
  className?: string;
};

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="60" cy="60" rx="55" ry="20" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse cx="60" cy="60" rx="20" ry="55" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path
        d="M10 45 Q40 35 60 40 Q80 45 110 42"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M15 75 Q45 85 60 80 Q75 75 105 78"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M5 60 Q30 50 60 55 Q90 60 115 58"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      />
    </svg>
  );
}

export function QSLCardTemplate({
  card,
  template,
  editable = false,
  className,
}: QSLCardTemplateProps) {
  const bgStyle: React.CSSProperties = {
    backgroundColor: template.backgroundColor,
    ...(template.backgroundImage
      ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${template.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
    ...(card.backgroundImage
      ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url(${card.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
  };

  const FieldBox = ({
    value,
    placeholder,
  }: {
    value?: string;
    placeholder?: string;
  }) => (
    <div
      className={cn(
        "rounded-sm px-2 py-1.5 text-center text-xs font-medium min-h-[28px] flex items-center justify-center",
        editable && "border border-dashed border-qsl-cream/40"
      )}
      style={{
        backgroundColor: template.borderColor,
        color: template.backgroundColor,
      }}
    >
      {value || (editable ? placeholder : "—")}
    </div>
  );

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border-4 shadow-xl max-w-md mx-auto",
        className
      )}
      style={{ borderColor: template.borderColor, ...bgStyle }}
    >
      <div className="p-4 md:p-5 text-qsl-cream">
        {/* Top section */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm font-bold tracking-widest uppercase">
              {card.fromCountry || "COUNTRY"}
            </p>
            <p className="text-[10px] opacity-80 mt-0.5">
              {card.ituZone || "ITU Zone —"}
            </p>
          </div>
          <GlobeIcon className="w-16 h-16 md:w-20 md:h-20 text-qsl-cream opacity-70" />
        </div>

        {/* Callsign */}
        <div className="relative text-center -mt-8 mb-4">
          <h2
            className="text-4xl md:text-5xl font-black tracking-wider qsl-text-shadow"
            style={{ color: template.accentColor }}
          >
            {card.fromCallsign || "CALLSIGN"}
          </h2>
        </div>

        {/* Middle section */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4 text-xs">
          <p className="font-semibold tracking-wide uppercase opacity-90">
            Confirming Our QSO:
          </p>
          <div className="text-right opacity-80 leading-relaxed">
            <p>Op. {card.fromName || "Operator Name"}</p>
            <p>{card.fromAddress || "Address"}</p>
            <p>{card.fromCountry || "Country"}</p>
          </div>
        </div>

        {/* TO RADIO field */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs font-bold mb-1">
            <span>TO RADIO:</span>
            <div
              className="flex-1 rounded-sm px-3 py-1.5 text-sm font-black tracking-wider min-h-[32px] flex items-center"
              style={{
                backgroundColor: template.borderColor,
                color: template.backgroundColor,
              }}
            >
              {card.toCallsign || (editable ? "Enter callsign" : "—")}
            </div>
          </div>
        </div>

        {/* Data grid */}
        <div className="grid grid-cols-6 gap-1">
          {(["DATE", "UTC", "MHZ", "MODE", "RST", "QSL"] as const).map((header) => {
            const keyMap: Record<string, keyof QSLCard> = {
              DATE: "date",
              UTC: "utc",
              MHZ: "mhz",
              MODE: "mode",
              RST: "rst",
              QSL: "qslVia",
            };
            const key = keyMap[header];
            return (
              <div key={header}>
                <div
                  className="rounded-sm px-1 py-1 text-[9px] md:text-[10px] font-bold text-center mb-0.5"
                  style={{
                    backgroundColor: template.borderColor,
                    color: template.backgroundColor,
                  }}
                >
                  {header}
                </div>
                <FieldBox
                  value={card[key] as string | undefined}
                  placeholder={header}
                />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-4 text-xs italic opacity-70 transform -rotate-2 origin-left">
          73&apos;s &amp; DX
        </p>
      </div>
    </div>
  );
}
