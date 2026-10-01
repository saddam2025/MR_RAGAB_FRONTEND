import { useEffect } from 'react';

export default function useHeroParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const layers = [...el.querySelectorAll('.hero-parallax')];
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let rect = el.getBoundingClientRect();

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
        el.classList.toggle('geometric-hero--visible', entry.isIntersecting);
      }, { threshold: 0.05 })
      : null;
    observer?.observe(el);
    if (!observer) el.classList.add('geometric-hero--visible');

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth) || 0;
        const range = Number(layer.dataset.range) || 20;
        layer.style.transform = `translate3d(${(cx * depth * range).toFixed(2)}px, ${(cy * depth * range).toFixed(2)}px, 0)`;
      });
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const move = (event) => {
      if (event.pointerType !== 'mouse') return;
      tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
      start();
    };
    const leave = () => { tx = 0; ty = 0; start(); };
    const resize = () => { rect = el.getBoundingClientRect(); };
    const canParallax = () => finePointer.matches && !reduceMotion.matches;
    if (canParallax()) {
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      window.addEventListener('resize', resize);
    }

    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [ref]);
}
