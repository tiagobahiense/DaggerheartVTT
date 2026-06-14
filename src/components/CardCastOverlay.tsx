import { useEffect, useRef } from 'react';
import { Sparkle, HandGrabbing } from '@phosphor-icons/react';
import { CardCastEvent, hexToRgba, parseCardCastEvent } from '../lib/cardCastEvents';

const OVERLAY_DURATION_MS = 5500;
const EVENT_TTL_MS = 8000;

interface CardCastOverlayProps {
  event: CardCastEvent | null;
}

export function CardCastOverlay({ event }: CardCastOverlayProps) {
  if (!event) return null;

  const color = event.corDominio;
  const glowSoft = hexToRgba(color, 0.35);
  const glowMid = hexToRgba(color, 0.55);
  const glowStrong = hexToRgba(color, 0.75);
  const badgeBg = hexToRgba(color, 0.18);
  const badgeBorder = hexToRgba(color, 0.45);

  return (
    <>
      <style>{`
        @keyframes card-cast-backdrop-in {
          0% { opacity: 0; }
          12% { opacity: 1; }
          82% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes card-cast-content-in {
          0% { opacity: 0; transform: scale(0.72) translateY(36px); filter: blur(10px); }
          14% { opacity: 1; transform: scale(1.04) translateY(0); filter: blur(0); }
          78% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.96) translateY(-12px); }
        }
        @keyframes card-cast-image-float {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50% { transform: translateY(-10px) rotate(1.5deg); }
        }
        @keyframes card-cast-ring-pulse {
          0% { transform: scale(0.85); opacity: 0.55; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes card-cast-shimmer {
          0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          20% { opacity: 0.7; }
          100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
        }
        @keyframes card-cast-sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .card-cast-backdrop { animation: card-cast-backdrop-in ${OVERLAY_DURATION_MS}ms ease-out forwards; }
        .card-cast-content { animation: card-cast-content-in ${OVERLAY_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .card-cast-image { animation: card-cast-image-float 2.8s ease-in-out infinite; }
        .card-cast-ring { animation: card-cast-ring-pulse 2.4s ease-out infinite; }
        .card-cast-ring-delay { animation-delay: 0.8s; }
        .card-cast-shimmer { animation: card-cast-shimmer 2.2s ease-in-out infinite; }
        .card-cast-sparkle { animation: card-cast-sparkle 1.6s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 z-[9999998] flex items-center justify-center pointer-events-none px-4 card-cast-backdrop">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 45%, ${hexToRgba(color, 0.28)} 0%, transparent 52%),
              radial-gradient(circle at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.92) 72%)
            `,
          }}
        />

        <div className="relative w-full max-w-4xl flex flex-col items-center text-center card-cast-content">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,680px)] h-48 rounded-full blur-3xl -z-10"
            style={{ background: `linear-gradient(90deg, transparent, ${glowSoft}, ${glowMid}, ${glowSoft}, transparent)` }}
          />

          <div className="relative mb-6 md:mb-8">
            <div
              className="absolute inset-0 rounded-2xl card-cast-ring"
              style={{ boxShadow: `0 0 0 2px ${badgeBorder}`, margin: '-12px' }}
            />
            <div
              className="absolute inset-0 rounded-2xl card-cast-ring card-cast-ring-delay"
              style={{ boxShadow: `0 0 0 1px ${hexToRgba(color, 0.25)}`, margin: '-12px' }}
            />

            <div
              className="relative w-36 h-52 md:w-44 md:h-64 rounded-xl overflow-hidden card-cast-image"
              style={{
                boxShadow: `0 0 40px ${glowMid}, 0 0 80px ${glowSoft}, 0 20px 40px rgba(0,0,0,0.6)`,
                border: `2px solid ${glowStrong}`,
              }}
            >
              {event.cardPath ? (
                <img src={event.cardPath} alt={event.cardName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a120b] flex items-center justify-center">
                  <HandGrabbing size={48} style={{ color }} />
                </div>
              )}
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ background: `linear-gradient(120deg, transparent 35%, ${hexToRgba(color, 0.35)} 50%, transparent 65%)` }}
              >
                <div className="absolute inset-0 card-cast-shimmer bg-white/10 w-1/3" />
              </div>
            </div>

            <Sparkle
              size={22}
              weight="fill"
              className="absolute -top-3 -right-3 card-cast-sparkle"
              style={{ color, filter: `drop-shadow(0 0 8px ${glowStrong})` }}
            />
            <Sparkle
              size={16}
              weight="fill"
              className="absolute -bottom-2 -left-4 card-cast-sparkle"
              style={{ color, animationDelay: '0.5s', filter: `drop-shadow(0 0 6px ${glowStrong})` }}
            />
          </div>

          <h2
            className="text-2xl md:text-4xl font-rpg uppercase text-white relative z-10 tracking-wide"
            style={{ textShadow: `0 0 24px ${glowMid}, 0 4px 8px rgba(0,0,0,0.9)` }}
          >
            {event.charName}
          </h2>

          <p className="text-xs md:text-sm text-white/80 font-light tracking-[0.35em] uppercase my-2 md:my-3 relative z-10 bg-black/50 px-5 py-1.5 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
            <HandGrabbing size={16} style={{ color }} />
            usou a carta
          </p>

          <h1
            className="text-3xl md:text-6xl lg:text-7xl font-black uppercase relative z-10 font-rpg leading-tight px-2 max-w-3xl"
            style={{
              color: 'white',
              textShadow: `0 0 30px ${glowStrong}, 0 0 60px ${glowSoft}, 0 4px 12px rgba(0,0,0,1)`,
            }}
          >
            {event.cardName}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 md:mt-5 relative z-10">
            {event.tipoDominio && (
              <span
                className="text-xs md:text-sm uppercase tracking-widest font-bold px-4 py-1.5 rounded-full backdrop-blur-md"
                style={{
                  color,
                  backgroundColor: badgeBg,
                  border: `1px solid ${badgeBorder}`,
                  boxShadow: `0 0 20px ${glowSoft}`,
                }}
              >
                {event.tipoDominio}
              </span>
            )}
            {event.nivelDominio != null && (
              <span
                className="text-xs md:text-sm uppercase tracking-widest font-bold px-4 py-1.5 rounded-full backdrop-blur-md text-white/90"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  border: `1px solid ${badgeBorder}`,
                }}
              >
                Nv. {event.nivelDominio}
              </span>
            )}
            {event.cardCategory && (
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/50 px-3 py-1 rounded-full border border-white/10 bg-black/30">
                {event.cardCategory}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function useCardCastAlertListener(
  latestCardCast: unknown,
  setAlert: (alert: CardCastEvent | null) => void,
  options?: { skipCharId?: string | null }
) {
  const lastHandledIdRef = useRef(0);
  const eventId =
    latestCardCast && typeof latestCardCast === 'object' && 'id' in latestCardCast
      ? (latestCardCast as { id?: number }).id
      : null;

  useEffect(() => {
    const event = parseCardCastEvent(latestCardCast);
    if (!event) return;

    const timeDiff = Date.now() - event.id;
    if (timeDiff >= EVENT_TTL_MS) return;
    if (event.id <= lastHandledIdRef.current) return;

    if (options?.skipCharId && event.charId === options.skipCharId) {
      lastHandledIdRef.current = event.id;
      return;
    }

    lastHandledIdRef.current = event.id;
    setAlert(event);

    const timer = setTimeout(() => setAlert(null), OVERLAY_DURATION_MS);
    return () => clearTimeout(timer);
  }, [eventId, latestCardCast, options?.skipCharId, setAlert]);
}
