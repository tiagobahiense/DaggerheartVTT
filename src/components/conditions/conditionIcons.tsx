import type { ReactNode } from 'react';
import {
  EyeSlash, Anchor, Warning, WaveSine, Moon, Snowflake,
  Lightning, Brain, Heart, Prohibit, Ghost, EyeClosed,
  MaskHappy, ShieldCheck, Wrench, Buildings, Skull,
  WarningCircle,
} from '@phosphor-icons/react';
import { ConditionId } from '../../types/sheetExtras';

export const CONDITION_ICONS: Record<ConditionId, ReactNode> = {
  hidden: <EyeSlash size={14} weight="fill" />,
  immobilized: <Anchor size={14} weight="fill" />,
  vulnerable: <Warning size={14} weight="fill" />,
  shaken: <WaveSine size={14} weight="fill" />,
  asleep: <Moon size={14} weight="fill" />,
  restrained: <Snowflake size={14} weight="fill" />,
  stunned: <Lightning size={14} weight="fill" />,
  dissociated: <Brain size={14} weight="fill" />,
  charmed: <Heart size={14} weight="fill" />,
  unconscious: <Prohibit size={14} weight="fill" />,
  incorporeal: <Ghost size={14} weight="fill" />,
  invisible: <EyeClosed size={14} weight="fill" />,
  oculto: <MaskHappy size={14} weight="fill" />,
  protected: <ShieldCheck size={14} weight="fill" />,
  broken: <Wrench size={14} weight="fill" />,
  collapsed: <Buildings size={14} weight="fill" />,
  destroyed: <Skull size={14} weight="fill" />,
};

export const CONDITION_ICON_FALLBACK = <WarningCircle size={14} weight="fill" />;
