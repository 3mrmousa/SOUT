"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import "./BranchedMenu.css";

export interface BranchedMenuChild {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface BranchedMenuItem {
  value?: string;
  label: string;
  icon?: React.ReactNode;
  children?: BranchedMenuChild[];
}

export interface BranchedMenuProps {
  items: BranchedMenuItem[];
  defaultOpen?: number | number[];
  activeValue?: string;
  onSelect?: (
    value: string,
    item: BranchedMenuItem | BranchedMenuChild,
  ) => void;
  color?: string;
  accentColor?: string;
  lineColor?: string;
  width?: number;
  rowHeight?: number;
  indent?: number;
  trunk?: number;
  radius?: number;
  lineWidth?: number;
  fontSize?: number;
  drawDuration?: number;
  foldDuration?: number;
  className?: string;
}

const PAD = 6;
const MARK = 16;

const toSet = (open: number | number[]) =>
  new Set(Array.isArray(open) ? open : open >= 0 ? [open] : []);

export default function BranchedMenu({
  items,
  defaultOpen = 0,
  activeValue,
  onSelect,
  color = "#f4f4f5",
  accentColor = "#a855f7",
  lineColor = "#27272a",
  width = 240,
  rowHeight = 38,
  indent = 34,
  trunk = 12,
  radius = 8,
  lineWidth = 1.5,
  fontSize = 13,
  drawDuration = 350,
  foldDuration = 260,
  className = "",
}: BranchedMenuProps) {
  const [open, setOpen] = useState<Set<number>>(() => toSet(defaultOpen));
  const [internalActive, setInternalActive] = useState<string>("");
  const active = activeValue !== undefined ? activeValue : internalActive;

  const navRef = useRef<HTMLElement>(null);
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement>(null);

  const activeSection = items.findIndex((it) =>
    it.children?.some((kid) => kid.value === active),
  );
  const markerShown = activeSection >= 0 && open.has(activeSection);

  useLayoutEffect(() => {
    const place = (glide: boolean) => {
      const m = markerRef.current;
      const el = heads.current[activeSection];
      if (!m) return;
      const on = Boolean(markerShown && el);
      if (!glide) m.style.transition = "none";
      if (on && el) {
        m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
      }
      m.toggleAttribute("data-on", on);
      if (!glide) {
        void m.offsetHeight;
        m.style.transition = "";
      }
    };

    place(true);
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [activeSection, markerShown, items, fontSize, rowHeight]);

  const select = (
    value: string,
    item: BranchedMenuItem | BranchedMenuChild,
  ) => {
    if (activeValue === undefined) setInternalActive(value);
    onSelect?.(value, item);
  };

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const r = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = (k: number) => PAD + k * rowHeight + rowHeight / 2;
  const branch = (k: number) =>
    `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = (k: number) =>
    `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = (k: number) =>
    rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);

  return (
    <nav
      ref={navRef}
      className={`branched-menu${className ? ` ${className}` : ""}`}
      style={
        {
          "--bm-w": `${width}px`,
          "--bm-ink": color,
          "--bm-accent": accentColor,
          "--bm-line": lineColor,
          "--bm-font": `${fontSize}px`,
          "--bm-row": `${rowHeight}px`,
          "--bm-indent": `${indent}px`,
          "--bm-line-w": lineWidth,
          "--bm-draw": `${drawDuration}ms`,
          "--bm-fold": `${foldDuration}ms`,
        } as React.CSSProperties
      }
    >
      <span
        ref={markerRef}
        className="branched-menu__marker"
        aria-hidden="true"
      />
      {items.map((item, i) => {
        const kids = item.children;
        const isOpen = kids ? open.has(i) : false;
        const leafValue = item.value ?? item.label;
        const leafActive = !kids && leafValue === active;
        const bodyH = kids ? PAD * 2 + kids.length * rowHeight : 0;

        return (
          <div
            key={item.value ?? item.label}
            className="branched-menu__section"
            data-open={isOpen ? "" : undefined}
          >
            <button
              ref={(el) => {
                heads.current[i] = el;
              }}
              type="button"
              className="branched-menu__head font-interference"
              aria-expanded={kids ? isOpen : undefined}
              aria-current={leafActive ? "true" : undefined}
              data-active={leafActive ? "" : undefined}
              onClick={() => (kids ? toggle(i) : select(leafValue, item))}
            >
              {item.icon ? (
                <span className="branched-menu__icon" aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
            </button>

            {kids && kids.length > 0 ? (
              <div className="branched-menu__body">
                <div className="branched-menu__fold">
                  <div
                    className="branched-menu__tree"
                    style={{ height: bodyH }}
                  >
                    <svg
                      className="branched-menu__lines"
                      width={indent}
                      height={bodyH}
                      aria-hidden="true"
                    >
                      <path
                        className="branched-menu__base"
                        d={`M ${trunk} 0 V ${rowY(kids.length - 1) - r}`}
                      />
                      {kids.map((kid, k) => (
                        <path
                          key={kid.value}
                          className="branched-menu__base"
                          d={branch(k)}
                        />
                      ))}
                      {kids.map((kid, k) => (
                        <path
                          key={kid.value}
                          className="branched-menu__reach"
                          d={reach(k)}
                          style={{
                            strokeDasharray: length(k),
                            strokeDashoffset:
                              kid.value === active ? 0 : length(k),
                          }}
                        />
                      ))}
                    </svg>

                    {kids.map((kid) => (
                      <button
                        key={kid.value}
                        type="button"
                        className="branched-menu__item"
                        aria-current={kid.value === active ? "true" : undefined}
                        data-active={kid.value === active ? "" : undefined}
                        tabIndex={isOpen ? 0 : -1}
                        onClick={() => select(kid.value, kid)}
                      >
                        {kid.icon ? (
                          <span
                            className="branched-menu__icon"
                            aria-hidden="true"
                          >
                            {kid.icon}
                          </span>
                        ) : null}
                        <span className="branched-menu__label">
                          {kid.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
